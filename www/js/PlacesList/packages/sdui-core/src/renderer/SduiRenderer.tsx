import React from "react";
import { materializeSduiComponentConfig } from "../binding/deferredSduiComponentConfig";
import { isSduiListValue, isSduiPooledConfigList } from "../binding/propValues";
import { SduiErrorName } from "../errors/SduiErrors";
import { reportError } from "../errors/SduiLogger";
import type { SduiComponentRegistry } from "../registry/SduiComponentRegistry";
import {
  SDUI_MANAGED_CHILDREN_PROP,
  SDUI_RESERVED_EXTRA_LOCAL_PROPS,
  type DataStatus,
  type SduiActionResolver,
  type SduiComponentConfig,
  type SduiErrorReporter,
  type SduiExtraLocalProps,
  type SduiManagedChildList,
  type SduiPageContext,
  type SduiPooledConfigList,
  type PoolSectionLayoutMetadata,
} from "../types";
import { peekPropStatuses } from "../utils/builderHelpers";
import { componentTypeName } from "../utils/protoEnum";
import { needsInteractiveWrapper } from "../utils/rendererHelpers";
import { isSduiConfig, isSduiConfigArray } from "../utils/typeGuards";
import { materializeSduiPropValue } from "./materializeSduiPropValue";

const RESERVED_EXTRA_LOCAL_PROPS: ReadonlySet<string> = new Set(SDUI_RESERVED_EXTRA_LOCAL_PROPS);

export interface SduiRendererProps {
  config: SduiComponentConfig;
  registry: SduiComponentRegistry;
  // Telemetry sink for render-time errors.
  errorReporter: SduiErrorReporter;
  // Page context attached to error reports (surface filtering).
  pageContext: SduiPageContext;
  // Client-only wrapper for configs that contain signals (`propSignals`, `isComponentFilteredSignal`). Omit on the server.
  interactiveWrapper?: React.ComponentType<{
    config: SduiComponentConfig;
    registry: SduiComponentRegistry;
    errorReporter: SduiErrorReporter;
    pageContext: SduiPageContext;
    actionResolver?: SduiActionResolver;
    extraLocalProps?: SduiExtraLocalProps;
  }>;
  // Resolves `SduiActionData` into runtime actions (e.g. `onActivated`, `href`).
  actionResolver?: SduiActionResolver;
  // Per-prop status map injected by the interactive wrapper.
  propStatuses?: Record<string, DataStatus>;
  // Parent-supplied props. See `SduiExtraLocalProps` for the merge rules. Nested renders
  // do not inherit them.
  extraLocalProps?: SduiExtraLocalProps;
}

type SduiRendererChildContext = Omit<SduiRendererProps, "config">;
type RootSduiConfigValue = SduiComponentConfig | SduiComponentConfig[] | SduiPooledConfigList;

function isRootSduiConfigValue(value: unknown): value is RootSduiConfigValue {
  return (
    isSduiPooledConfigList(value) ||
    (!isSduiListValue(value) && (isSduiConfig(value) || isSduiConfigArray(value)))
  );
}

function normalizeChildConfigs(value: RootSduiConfigValue): SduiComponentConfig[] {
  if (isSduiPooledConfigList(value)) {
    return value.configs;
  }

  return Array.isArray(value) ? value : [value];
}

function renderSduiChild(
  childConfig: SduiComponentConfig,
  reactKey: React.Key | undefined,
  ctx: SduiRendererChildContext,
  extraLocalProps?: SduiExtraLocalProps,
): React.ReactElement {
  return (
    // Recursive render — `SduiRenderer` is defined below as `const` (not hoisted).
    // eslint-disable-next-line @typescript-eslint/no-use-before-define -- mutual recursion
    <SduiRenderer
      key={reactKey}
      config={childConfig}
      registry={ctx.registry}
      errorReporter={ctx.errorReporter}
      pageContext={ctx.pageContext}
      interactiveWrapper={ctx.interactiveWrapper}
      actionResolver={ctx.actionResolver}
      extraLocalProps={extraLocalProps}
    />
  );
}

function addListItemAnalytics(childConfig: SduiComponentConfig, index: number): void {
  const itemPosition = (childConfig.poolPlacement?.poolIndex ?? index) + 1;
  childConfig.analyticsContext?.setLocalAnalyticsData?.({
    feedItemPosition: index + 1,
    itemPosition,
    itemComponentType: componentTypeName(childConfig.componentType),
  });
  childConfig.analyticsContext?.setLayoutCellPosition?.(
    (childConfig.poolPlacement?.cellIndex ?? index) + 1,
  );
}

function createManagedChildList(
  configs: SduiComponentConfig[],
  propName: string,
  ctx: SduiRendererChildContext,
  poolLayout?: PoolSectionLayoutMetadata,
): SduiManagedChildList {
  return {
    configs,
    ...(poolLayout ? { poolLayout } : {}),
    renderItem: (childConfig, index, reactKey, extraLocalProps) => {
      const materializedConfig = materializeSduiComponentConfig(childConfig);
      // Deferred builds that throw or return nothing are skipped, like the eager path.
      if (materializedConfig == null) {
        return null;
      }
      addListItemAnalytics(materializedConfig, index);
      return renderSduiChild(
        materializedConfig,
        reactKey ??
          materializedConfig.reactKey ??
          materializedConfig.identifier ??
          `${propName}-${index}`,
        ctx,
        extraLocalProps,
      );
    },
    renderChild: (childConfig, reactKey, extraLocalProps) => {
      const materializedConfig = materializeSduiComponentConfig(childConfig);
      if (materializedConfig == null) {
        return null;
      }
      return renderSduiChild(materializedConfig, reactKey, ctx, extraLocalProps);
    },
  };
}

/**
 * Isomorphic recursive renderer for SduiComponentConfig trees.
 *
 * No hooks, no context reads. Environment-specific behavior is injected via
 * `registry`, `interactiveWrapper`, and `actionResolver`.
 *
 * Props listed in `config.nestedComponentConfigPropNames` (`NestedComponentProp`
 * / `NestedComponentListProp`) become eager `<SduiRenderer>` elements. Other
 * nested configs (the `Lazy*` descriptors) are passed as `SduiManagedChildList`
 * (`configs` + `renderItem`) so the parent controls rendering. Mirrors Lua
 * `createSduiClientBindingWrappers`, which pre-renders only
 * `NestedComponentConfig` props. `registry.doesComponentManageChildren(type)`
 * opts a component into managed lists for every nested prop.
 */
export const SduiRenderer: React.FC<SduiRendererProps> = ({
  config,
  registry,
  errorReporter,
  pageContext,
  interactiveWrapper,
  actionResolver,
  propStatuses,
  extraLocalProps,
}) => {
  if (interactiveWrapper && needsInteractiveWrapper(config)) {
    const Wrapper = interactiveWrapper;
    return (
      <Wrapper
        config={config}
        registry={registry}
        errorReporter={errorReporter}
        pageContext={pageContext}
        actionResolver={actionResolver}
        extraLocalProps={extraLocalProps}
      />
    );
  }

  const componentDefinition = registry.getComponentDefinition(config.componentType);
  if (!componentDefinition) {
    reportError(
      SduiErrorName.NoComponentRegistered,
      `No component registered for type ${componentTypeName(config.componentType)}`,
      pageContext,
      { componentType: componentTypeName(config.componentType) },
      errorReporter,
    );
    return null;
  }

  const { propMapping: propNameMapping, propParsers: propValueParsers } = componentDefinition;
  const Component = componentDefinition.component;
  const manageChildren = registry.doesComponentManageChildren(config.componentType);

  const resolvedProps: Record<string, unknown> = {};
  const childElements: React.ReactElement[] = [];
  let injectedManagedChildrenList: SduiManagedChildList | undefined;

  // `extraLocalProps` stays on this node. Nested renders start without it.
  const childContext: SduiRendererChildContext = {
    registry,
    errorReporter,
    pageContext,
    interactiveWrapper,
    actionResolver,
  };

  // Include parser-only props that were omitted from the template so their
  // parsers can apply defaults.
  const propNames = [
    ...Object.keys(config.props),
    ...Object.keys(propValueParsers ?? {}).filter(
      propName => !Object.hasOwn(config.props, propName),
    ),
  ];

  for (const propName of propNames) {
    const hasProp = Object.hasOwn(config.props, propName);
    const propValue = hasProp ? config.props[propName] : undefined;
    const componentPropName = propNameMapping?.[propName] ?? propName;

    if (isRootSduiConfigValue(propValue)) {
      const pooledList = isSduiPooledConfigList(propValue) ? propValue : undefined;
      const configs = normalizeChildConfigs(propValue);
      const isNestedComponentConfig = config.nestedComponentConfigPropNames?.has(propName) === true;
      if (manageChildren || !isNestedComponentConfig) {
        const managedList = createManagedChildList(
          configs,
          propName,
          childContext,
          pooledList?.poolLayout,
        );
        if (componentPropName === "children") {
          injectedManagedChildrenList = managedList;
        } else {
          resolvedProps[componentPropName] = managedList;
        }
      } else if (Array.isArray(propValue) || pooledList) {
        const renderedChildren: React.ReactElement[] = [];
        configs.forEach((childConfig, index) => {
          const materializedConfig = materializeSduiComponentConfig(childConfig);
          if (materializedConfig == null) {
            return;
          }
          addListItemAnalytics(materializedConfig, index);
          renderedChildren.push(
            renderSduiChild(
              materializedConfig,
              materializedConfig.reactKey ??
                materializedConfig.identifier ??
                `${propName}-${index}`,
              childContext,
            ),
          );
        });
        if (componentPropName === "children") {
          childElements.push(...renderedChildren);
        } else {
          resolvedProps[componentPropName] = renderedChildren;
        }
      } else {
        const childConfig = configs[0];
        if (!childConfig) {
          continue;
        }

        const renderedChild = renderSduiChild(childConfig, undefined, childContext);
        if (componentPropName === "children") {
          childElements.push(renderedChild);
        } else {
          resolvedProps[componentPropName] = renderedChild;
        }
      }
      continue;
    }

    const materialized = materializeSduiPropValue(propValue, propName, {
      actionResolver,
      renderConfig: (childConfig, reactKey) => renderSduiChild(childConfig, reactKey, childContext),
      errorReporter,
      pageContext,
      componentType: config.componentType,
    });
    if (materialized.kind === "omitted") {
      continue;
    }

    // Omitted parser props are only forwarded when the parser returns a default.
    const parser = propValueParsers?.[propName];
    const parsed = parser ? parser(materialized.value, {}) : materialized.value;
    if (hasProp || parsed != null) {
      resolvedProps[componentPropName] = parsed;
    }
  }

  if (extraLocalProps) {
    for (const [propName, value] of Object.entries(extraLocalProps)) {
      if (value !== undefined && !RESERVED_EXTRA_LOCAL_PROPS.has(propName)) {
        resolvedProps[propName] = value;
      }
    }
  }

  if (injectedManagedChildrenList != null) {
    resolvedProps[SDUI_MANAGED_CHILDREN_PROP] = injectedManagedChildrenList;
  }

  // Wrapper supplies a materialized `propStatuses`. SSR / non-wrapped renders
  // never hit the wrapper, so fallback to peeking statuses straight off `config.propSignals`.
  const resolvedPropStatuses = propStatuses ?? peekPropStatuses(config.propSignals);
  if (resolvedPropStatuses) {
    resolvedProps.propStatuses = resolvedPropStatuses;
  }

  // Forward the build-time `analyticsContext` so leaf components can report
  // analytics data without needing to rebuild the analytics context.
  if (config.analyticsContext) {
    resolvedProps.analyticsContext = config.analyticsContext;
  }

  // Match lua `componentConfig`: leaves get their own type so nested hosts can
  // forward it (e.g. OptionSelector → VariableItemWidthCarousel fallback).
  resolvedProps.componentType = config.componentType;

  return (
    <Component {...resolvedProps}>{childElements.length > 0 ? childElements : undefined}</Component>
  );
};

SduiRenderer.displayName = "SduiRenderer";
