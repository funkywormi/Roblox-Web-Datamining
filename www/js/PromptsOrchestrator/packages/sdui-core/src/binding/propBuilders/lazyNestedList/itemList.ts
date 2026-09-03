/**
 * `item_list` variant — heterogeneous static list. Each item carries its
 * own template and input-def map. Items don't iterate over data, so no
 * per-item overlay; the `computed()` wrapper exists for reactive `inputs`.
 */
import { computed } from "@preact/signals-core";
import { reportFailedToParse, reportInvalidConfig, stringifyError } from "../../../errors";
import type {
  BindingContext,
  NestedComponentBuildContext,
  PropBuildRequest,
  ResolvedProp,
  SduiComponentConfig,
} from "../../../types";
import {
  asRecord,
  asRecordOrEmpty,
  isRecord,
  stringFieldOr,
  type RecordOf,
} from "../../../utils/typeGuards";
import { computedEqual } from "../../../signals/computedEqual";
import { resolveInputDefs } from "../utils/resolveInputs";
import { resolveTemplate } from "../utils/resolveTemplate";
import { childCtx } from "../utils/bindingContext";
import { arrayRefEqual, isComponentVisible } from "./shared";

function buildItemListEntry(
  itemRecord: RecordOf,
  itemCtx: BindingContext,
  request: PropBuildRequest,
  buildContext: NestedComponentBuildContext,
): SduiComponentConfig | undefined {
  const inlineSchema = isRecord(itemRecord.inlineComponent)
    ? itemRecord.inlineComponent
    : undefined;
  const robloxComponent = stringFieldOr(itemRecord, "robloxComponent", "");
  if (!inlineSchema && !robloxComponent) {
    reportInvalidConfig(itemCtx, `item_list entry missing inlineComponent and robloxComponent`);
    return undefined;
  }

  const resolved = resolveTemplate(
    inlineSchema,
    robloxComponent,
    itemCtx,
    buildContext.templateStore,
  );
  if (!resolved) return undefined;

  // Inline path: shared scope, parent `inputData` aliased directly.
  // `itemRecord.inputs` is intentionally ignored (no per-entry overlay).
  if (resolved.isInline) {
    const parentInputDataSignal = computed(() => request.dataSources.value.inputData);
    return buildContext.builder.buildConfigForComponent(
      resolved.template,
      parentInputDataSignal,
      buildContext.builderConfig,
      buildContext.parentAnalyticsContext,
      request.dataSources,
    );
  }

  // RCT path: isolated scope built from the item's `inputs` def map.
  const inputDefs = asRecordOrEmpty(itemRecord.inputs);
  const itemInputDataSignal = computed(() =>
    resolveInputDefs(inputDefs, { ...request, ctx: itemCtx }),
  );
  return buildContext.builder.buildConfigForComponent(
    resolved.template,
    itemInputDataSignal,
    buildContext.builderConfig,
    buildContext.parentAnalyticsContext,
  );
}

/**
 * @deprecated Legacy `item_list` list variant. Use the unified
 * `component_list` pipeline (`buildComponentList`) instead.
 */
export function buildItemList(
  propData: RecordOf,
  request: PropBuildRequest,
  buildContext: NestedComponentBuildContext,
): ResolvedProp {
  const ctx: BindingContext = { ...request.ctx, parserName: "item_list" };
  const items = Array.isArray(propData.items) ? propData.items : [];

  const builtConfigs: SduiComponentConfig[] = [];
  for (let index = 0; index < items.length; index += 1) {
    const itemRecord = asRecord(items[index]);
    if (!itemRecord) continue;

    const itemCtx = childCtx(ctx, `[${index}]`);
    try {
      const config = buildItemListEntry(itemRecord, itemCtx, request, buildContext);
      if (config) builtConfigs.push(config);
    } catch (err) {
      reportFailedToParse(itemCtx, `item_list[${index}] threw: ${stringifyError(err)}`);
    }
  }

  // No filter signal needed when nothing is filterable — keep static lists zero-cost.
  const hasFilterableItem = builtConfigs.some(c => c.isComponentFilteredSignal != null);
  if (!hasFilterableItem) {
    return { value: builtConfigs, category: "nestedConfig" };
  }

  const visibleSignal = computedEqual<SduiComponentConfig[]>(
    () => builtConfigs.filter(isComponentVisible),
    arrayRefEqual,
  );
  return { value: visibleSignal.peek(), category: "propSignal", signal: visibleSignal };
}
