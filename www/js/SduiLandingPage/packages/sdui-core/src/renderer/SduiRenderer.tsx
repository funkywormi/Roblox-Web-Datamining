import React from "react";
import { isSduiListValue } from "../binding/propValues";
import { SduiErrorName } from "../errors/SduiErrors";
import { reportError } from "../errors/SduiLogger";
import type { SduiComponentRegistry } from "../registry/SduiComponentRegistry";
import {
  SDUI_MANAGED_CHILDREN_PROP,
  type DataStatus,
  type SduiActionResolver,
  type SduiComponentConfig,
  type SduiErrorReporter,
  type SduiManagedChildList,
  type SduiPageContext,
} from "../types";
import { peekPropStatuses } from "../utils/builderHelpers";
import { componentTypeName } from "../utils/protoEnum";
import { needsInteractiveWrapper } from "../utils/rendererHelpers";
import { isSduiConfig, isSduiConfigArray } from "../utils/typeGuards";
import { materializeSduiPropValue } from "./materializeSduiPropValue";

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
  }>;
  // Resolves `SduiActionData` into runtime actions (e.g. `onActivated`, `href`).
  actionResolver?: SduiActionResolver;
  // Per-prop status map injected by the interactive wrapper.
  propStatuses?: Record<string, DataStatus>;
}

type SduiRendererChildContext = Omit<SduiRendererProps, "config">;
type RootSduiConfigValue = SduiComponentConfig | SduiComponentConfig[];

function isRootSduiConfigValue(value: unknown): value is RootSduiConfigValue {
  return !isSduiListValue(value) && (isSduiConfig(value) || isSduiConfigArray(value));
}

function renderSduiChild(
  childConfig: SduiComponentConfig,
  reactKey: React.Key | undefined,
  ctx: SduiRendererChildContext,
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
    />
  );
}

function addListItemAnalytics(childConfig: SduiComponentConfig, index: number): void {
  childConfig.analyticsContext?.setLocalAnalyticsData?.({
    feedItemPosition: index + 1,
    itemPosition: index + 1,
    itemComponentType: componentTypeName(childConfig.componentType),
  });
}

function createManagedChildList(
  configs: SduiComponentConfig[],
  propName: string,
  ctx: SduiRendererChildContext,
): SduiManagedChildList {
  return {
    configs,
    renderItem: (childConfig, index, reactKey) => {
      addListItemAnalytics(childConfig, index);
      return renderSduiChild(
        childConfig,
        reactKey ?? childConfig.reactKey ?? childConfig.identifier ?? `${propName}-${index}`,
        ctx,
      );
    },
  };
}

/**
 * Isomorphic recursive renderer for SduiComponentConfig trees.
 *
 * No hooks, no context reads. Environment-specific behavior is injected via
 * `registry`, `interactiveWrapper`, and `actionResolver`.
 *
 * When `registry.doesComponentManageChildren(type)` is true, nested configs
 * are passed as `SduiManagedChildList` (`configs` + `renderItem`. Otherwise
 * nested configs become eager `<SduiRenderer>` elements.
 */
export const SduiRenderer: React.FC<SduiRendererProps> = ({
  config,
  registry,
  errorReporter,
  pageContext,
  interactiveWrapper,
  actionResolver,
  propStatuses,
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
      const configs = Array.isArray(propValue) ? propValue : [propValue];
      if (manageChildren) {
        const managedList = createManagedChildList(configs, propName, childContext);
        if (componentPropName === "children") {
          injectedManagedChildrenList = managedList;
        } else {
          resolvedProps[componentPropName] = managedList;
        }
      } else if (Array.isArray(propValue)) {
        const renderedChildren = propValue.map((childConfig, index) => {
          addListItemAnalytics(childConfig, index);
          return renderSduiChild(
            childConfig,
            childConfig.reactKey ?? childConfig.identifier ?? `${propName}-${index}`,
            childContext,
          );
        });
        if (componentPropName === "children") {
          childElements.push(...renderedChildren);
        } else {
          resolvedProps[componentPropName] = renderedChildren;
        }
      } else {
        const renderedChild = renderSduiChild(propValue, undefined, childContext);
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
