/**
 * `array_map` variant — maps a binding-path array onto a homogeneous
 * component list. Per-entry input resolution runs inside `computed()` so
 * children's hydration sources re-resolve when parent data changes.
 */
import { computed, type ReadonlySignal } from "@preact/signals-core";

import { reportFailedToParse, reportInvalidConfig, stringifyError } from "../../../errors";
import type {
  BindingContext,
  NestedComponentBuildContext,
  PropBuildRequest,
  ResolvedProp,
  SduiComponentConfig,
} from "../../../types";
import { asRecordOrEmpty, isRecord, stringFieldOr, type RecordOf } from "../../../utils/typeGuards";
import { asShallowEqualValue, computedEqual, shallowEqual } from "../../../signals/computedEqual";
import { generateDynamicBindingPropValue } from "../utils/sduiPropSignalUtils";
import { resolveInputDefs } from "../utils/resolveInputs";
import { resolveTemplate, type ResolvedTemplate } from "../utils/resolveTemplate";
import { childCtx } from "../utils/bindingContext";
import { arrayRefEqual, isComponentVisible, makeOverlayDataSources } from "./shared";

interface CachedArrayMapItem {
  config: SduiComponentConfig;
  item: RecordOf;
}

function buildArrayMapItem(
  itemRecord: RecordOf,
  defaultResolved: ResolvedTemplate,
  defaultInputDefs: RecordOf,
  request: PropBuildRequest,
  buildContext: NestedComponentBuildContext,
): SduiComponentConfig | undefined {
  const { ctx } = request;

  // Per-entry template precedence: entry inline > entry RCT > default.
  // A failed override falls back to the default template.
  const entryInline = isRecord(itemRecord.inlineComponent) ? itemRecord.inlineComponent : undefined;
  const entryRobloxComponent = stringFieldOr(itemRecord, "robloxComponent", "");
  const itemResolved =
    entryInline || entryRobloxComponent
      ? (resolveTemplate(entryInline, entryRobloxComponent, ctx, buildContext.templateStore) ??
        defaultResolved)
      : defaultResolved;

  // Inline path: shared scope with the entry's data overlaid on parent
  // `inputData`. Per-entry / default `inputs` defs are ignored.
  if (itemResolved.isInline) {
    const overlaySources = makeOverlayDataSources(request.dataSources, itemRecord);
    const inputDataSignal = computed(() => overlaySources.value.inputData);
    return buildContext.builder.buildConfigForComponent(
      itemResolved.template,
      inputDataSignal,
      buildContext.builderConfig,
      buildContext.parentAnalyticsContext,
      overlaySources,
    );
  }

  // RCT path: isolated scope. Each item gets its own `computed()` so
  // child entity-ID resolution stays reactive to parent data changes.
  const itemInputDataSignal = computed(() =>
    resolveInputDefs(defaultInputDefs, { ...request, ctx }, itemRecord),
  );
  return buildContext.builder.buildConfigForComponent(
    itemResolved.template,
    itemInputDataSignal,
    buildContext.builderConfig,
    buildContext.parentAnalyticsContext,
  );
}

/**
 * @deprecated Legacy `array_map` list variant. Use the unified
 * `component_list` pipeline (`buildComponentList`) instead.
 */
export function buildArrayMap(
  propData: RecordOf,
  request: PropBuildRequest,
  buildContext: NestedComponentBuildContext,
): ResolvedProp {
  const ctx: BindingContext = { ...request.ctx, parserName: "array_map" };
  const childRequest: PropBuildRequest = { ...request, ctx };
  const bindingPath = stringFieldOr(propData, "bindingPath", "");
  const defaultInline = isRecord(propData.inlineComponent) ? propData.inlineComponent : undefined;
  const defaultRobloxComponent = stringFieldOr(propData, "robloxComponent", "");
  const defaultInputDefs = asRecordOrEmpty(propData.inputs);

  if (!bindingPath) {
    reportInvalidConfig(ctx, `array_map missing bindingPath`);
    return { value: [], category: "failed", error: "Invalid array_map bindingPath" };
  }
  if (!defaultInline && !defaultRobloxComponent) {
    reportInvalidConfig(ctx, `array_map missing inlineComponent and robloxComponent`);
    return { value: [], category: "failed", error: "Invalid array_map template" };
  }
  const defaultResolved = resolveTemplate(
    defaultInline,
    defaultRobloxComponent,
    ctx,
    buildContext.templateStore,
  );
  if (!defaultResolved) {
    return {
      value: [],
      category: "failed",
      error: defaultInline
        ? "Invalid array_map inline template"
        : `Template not found: ${defaultRobloxComponent}`,
    };
  }

  // Per-index cache shared across re-evaluations. Pagination can reuse an
  // unchanged prefix, while focused updates rebuild positions whose item data
  // changed so their input signals do not retain stale entity IDs.
  let cachedItems: (CachedArrayMapItem | undefined)[] = [];

  const buildConfigsFromBoundArray = (rawArray: unknown): SduiComponentConfig[] => {
    if (!Array.isArray(rawArray)) return [];
    const next: SduiComponentConfig[] = [];
    const nextCachedItems: (CachedArrayMapItem | undefined)[] = [];
    for (let index = 0; index < rawArray.length; index += 1) {
      const itemRecord = asRecordOrEmpty(rawArray[index]);
      const cached = cachedItems[index];
      if (
        cached &&
        shallowEqual(asShallowEqualValue(cached.item), asShallowEqualValue(itemRecord))
      ) {
        next.push(cached.config);
        nextCachedItems[index] = cached;
        continue;
      }
      const itemCtx = childCtx(ctx, `[${index}]`);
      try {
        const built = buildArrayMapItem(
          itemRecord,
          defaultResolved,
          defaultInputDefs,
          { ...request, ctx: itemCtx },
          buildContext,
        );
        if (built) {
          next.push(built);
          nextCachedItems[index] = { config: built, item: itemRecord };
        }
      } catch (err) {
        reportFailedToParse(itemCtx, `array_map[${index}] threw: ${stringifyError(err)}`);
      }
    }
    cachedItems = nextCachedItems;
    return next;
  };

  const arraySignalProp = generateDynamicBindingPropValue(bindingPath, childRequest, raw =>
    buildConfigsFromBoundArray(raw),
  );
  if (arraySignalProp.category !== "propSignal") {
    return arraySignalProp;
  }

  // Layered filter signal. Narrow the signal once at this boundary.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const arraySignal = arraySignalProp.signal as ReadonlySignal<SduiComponentConfig[]>;
  const visibleSignal = computedEqual<SduiComponentConfig[]>(() => {
    const all = arraySignal.value;
    return Array.isArray(all) ? all.filter(isComponentVisible) : [];
  }, arrayRefEqual);

  return { value: visibleSignal.peek(), category: "propSignal", signal: visibleSignal };
}
