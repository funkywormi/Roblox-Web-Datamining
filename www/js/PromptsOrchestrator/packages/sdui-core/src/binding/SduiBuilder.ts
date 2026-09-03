import { computed, type ReadonlySignal } from "@preact/signals-core";

import { buildAnalyticsContext } from "../analytics/buildAnalyticsContext";
import { SduiErrorName } from "../errors/SduiErrors";
import { reportError } from "../errors/SduiLogger";
import type {
  ActionBuildContext,
  AnalyticsContext,
  BindingContext,
  BuildPropContext,
  BuiltPropObject,
  DataBindingSources,
  NestedComponentBuildContext,
  PropSignalEntry,
  SduiBuilder,
  SduiBuilderDeps,
  SduiComponentConfig,
  SduiDataBinder,
  UiComponentTemplate,
} from "../types";
import { createPropBuildDispatcher } from "./createPropBuildDispatcher";
import { resolveAnalyticsFields } from "./propBuilders/buildAnalyticsFields";
import { unwrapOneOf } from "../utils/oneOfHelper";
import { getPropBuilder } from "./propBuilders/index";
import { buildDataBindingSourcesSignal } from "./SduiDataBinder";

/**
 * Per-component scratch space threaded through every prop-build call so
 * recursive descents share the same `dataBinder`, `dataSources`, and
 * `BindingContext` ancestor without rebuilding them at each level.
 */
interface ComponentBuildScope {
  dataBinder: SduiDataBinder;
  dataSources: ReadonlySignal<DataBindingSources>;
  rootCtx: BindingContext;
}

/**
 * Resolves a `propName -> propDef` map. Per-prop failures are isolated and
 * reported so one bad prop can't take down the rest of the component.
 */
function buildPropObject(
  propObject: Record<string, unknown>,
  scope: ComponentBuildScope,
  buildContext?: BuildPropContext,
): BuiltPropObject {
  const props: Record<string, unknown> = {};
  const propSignals: Record<string, PropSignalEntry> = {};
  const buildProp = createPropBuildDispatcher({
    dataSources: scope.dataSources,
    dataBinder: scope.dataBinder,
    buildContext,
  });

  for (const [propName, rawProp] of Object.entries(propObject)) {
    const propCtx: BindingContext = { ...scope.rootCtx, propName };
    try {
      const result = buildProp(rawProp, propCtx);

      if (result.category === "propSignal") {
        propSignals[propName] = result.statusSignal
          ? { value: result.signal, status: result.statusSignal }
          : { value: result.signal };
        props[propName] = result.value;
      } else if (result.category === "failed") {
        props[propName] = result.value;
        reportError(
          SduiErrorName.FailedToParseProp,
          `Failed to build prop "${propName}": ${result.error}`,
          propCtx.pageContext,
          { componentType: propCtx.componentType, propName },
          propCtx.errorReporter,
        );
      } else {
        props[propName] = result.value;
      }
    } catch (err) {
      reportError(
        SduiErrorName.FailedToParseProp,
        `prop builder crashed for "${propName}": ${err instanceof Error ? err.message : String(err)}`,
        propCtx.pageContext,
        {
          componentType: propCtx.componentType,
          propName,
          message: err instanceof Error ? err.message : undefined,
        },
        propCtx.errorReporter,
      );
    }
  }

  return { props, propSignals };
}

/**
 * Builds the reactive boolean signal for `ComponentShared.is_component_filtered`.
 * Pinned to `BoolProp`: the proto contract guarantees that descriptor, so we
 * skip the default-builder fallback if `$typeName` is missing on the wire.
 */
function buildIsFilteredSignal(
  propRecord: Record<string, unknown>,
  scope: ComponentBuildScope,
  ctx: BindingContext,
): ReadonlySignal<boolean> {
  const boolPropBuilder = getPropBuilder("BoolProp");
  const unwrappedKind = unwrapOneOf(propRecord);
  if (!unwrappedKind) {
    return computed(() => false);
  }

  const result = boolPropBuilder(unwrappedKind.propType, unwrappedKind.propValue, {
    dataSources: scope.dataSources,
    dataBinder: scope.dataBinder,
    ctx,
    buildProp: createPropBuildDispatcher({
      dataSources: scope.dataSources,
      dataBinder: scope.dataBinder,
    }),
  });

  // Wrap in a `computed` that coerces to boolean. The BoolProp contract
  // guarantees a boolean here, but the wrapper avoids an unsafe assertion
  // and tolerates any non-boolean drift at runtime.
  if (result.category === "propSignal") {
    const valueSignal = result.signal;
    return computed(() => valueSignal.value === true);
  }
  return computed(() => result.value === true);
}

/**
 * Builds a fully-resolved `SduiComponentConfig` for one template: data
 * sources, analytics context, optional `isComponentFiltered` signal, and
 * the prop bag.
 */
function buildComponentConfig(
  template: UiComponentTemplate,
  scope: ComponentBuildScope,
  nestedBuildContext: NestedComponentBuildContext,
  parentAnalyticsContext: AnalyticsContext | undefined,
): SduiComponentConfig {
  const { rootCtx } = scope;
  const { errorReporter } = rootCtx;

  const isComponentFilteredSignal = template.shared.isComponentFiltered
    ? buildIsFilteredSignal(template.shared.isComponentFiltered, scope, {
        ...rootCtx,
        propName: "isComponentFiltered",
      })
    : undefined;

  const { literals: analyticsLiterals, signals: analyticsSignals } = resolveAnalyticsFields(
    template.shared.analyticsData,
    scope.dataSources,
    scope.dataBinder,
    rootCtx,
  );
  const analyticsContext = buildAnalyticsContext({
    literals: analyticsLiterals,
    signals: analyticsSignals,
    parentContext: parentAnalyticsContext,
    debugName: template.schemaType,
    componentType: rootCtx.componentType,
    parserName: rootCtx.parserName,
    pageContext: rootCtx.pageContext,
    errorReporter,
  });

  // Inject `analyticsContext` so child `ActionProp`s see
  // the same data we'll use for impressions/clicks on this component.
  const actionCtx: ActionBuildContext = {
    pageContext: rootCtx.pageContext,
    analyticsContext,
  };

  const nestedContextForChildren: NestedComponentBuildContext = {
    ...nestedBuildContext,
    parentAnalyticsContext: analyticsContext,
  };

  const { props, propSignals } = buildPropObject(template.props, scope, {
    action: actionCtx,
    nested: nestedContextForChildren,
  });

  const hasPropSignals = Object.keys(propSignals).length > 0;

  return {
    __sduiKind: "config",
    componentType: template.shared.componentType,
    props,
    ...(hasPropSignals ? { propSignals } : {}),
    analyticsContext,
    ...(isComponentFilteredSignal ? { isComponentFilteredSignal } : {}),
  };
}

/**
 * Intentional divergences from Lua:
 * - Action handlers are wired separately on the web (see `actions/` and
 *   `buildActionProp`) instead of being parsed eagerly here.
 * - Tokens pass through as raw path strings; Foundation resolves them to CSS
 *   classes at render time, whereas Lua resolves to a token value at build time.
 */
export function createSduiBuilder(deps: SduiBuilderDeps): SduiBuilder {
  const { dataBinder, templateStore, errorReporter } = deps;

  const builder: SduiBuilder = {
    buildProp(rawProp, dataSources, ctx, buildContext) {
      return createPropBuildDispatcher({ dataBinder, dataSources, buildContext })(rawProp, ctx);
    },

    buildPropObject(propObject, dataSources, ctx, buildContext) {
      return buildPropObject(propObject, { dataBinder, dataSources, rootCtx: ctx }, buildContext);
    },

    buildConfigForComponent(
      template,
      inputDataSignal,
      builderConfig,
      parentAnalyticsContext,
      parentDataSources,
    ) {
      const rootCtx: BindingContext = {
        errorReporter,
        pageContext: builderConfig.pageContext,
        componentType: String(template.shared.componentType),
      };

      // Shared-scope (inline_component): reuse the parent's resolved
      // `dataSources` and skip the child's own `inputDataSignal` +
      // `hydrationDataSpecs` construction.
      const dataSources =
        parentDataSources ??
        buildDataBindingSourcesSignal(inputDataSignal, template.shared.hydrationDataSpecs, rootCtx);

      const scope: ComponentBuildScope = { dataBinder, dataSources, rootCtx };

      const nestedBuildContext: NestedComponentBuildContext = {
        templateStore,
        builder,
        builderConfig,
      };

      return buildComponentConfig(template, scope, nestedBuildContext, parentAnalyticsContext);
    },
  };

  return builder;
}
