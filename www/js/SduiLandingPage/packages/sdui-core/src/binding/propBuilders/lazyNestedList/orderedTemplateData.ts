/**
 * `ordered_template_data` variant — keyed feed entries assembled in a
 * dynamic order. The build is wrapped in one `computedEqual` so it
 * re-runs when the entry map, the order array, or any built config's
 * filter signal changes. Per-identifier configs are memoized in
 * `configCache` so an order shuffle doesn't rebuild existing items.
 */
import { computed } from "@preact/signals-core";
import {
  reportBindingError,
  reportFailedToParse,
  reportInvalidConfig,
  SduiErrorName,
  stringifyError,
} from "../../../errors";
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
import { unwrapOneOf } from "../../../utils/oneOfHelper";
import { resolveBindingPath } from "../../SduiDataBinder";
import { resolveInputDefs } from "../utils/resolveInputs";
import { resolveTemplate } from "../utils/resolveTemplate";
import { childCtx } from "../utils/bindingContext";
import { arrayRefEqual, isComponentVisible, makeOverlayDataSources } from "./shared";
import { PROP_KIND } from "../../../types/propKinds";

/** Each order entry may be a bare string or a `{ identifier }` record. */
function normalizeOrderEntries(rawEntries: unknown, entryMap: RecordOf): string[] {
  if (!Array.isArray(rawEntries)) return Object.keys(entryMap);
  const identifiers: string[] = [];
  for (const entry of rawEntries) {
    if (typeof entry === "string" && entry !== "") {
      identifiers.push(entry);
      continue;
    }
    if (isRecord(entry) && typeof entry.identifier === "string" && entry.identifier !== "") {
      identifiers.push(entry.identifier);
    }
  }
  return identifiers;
}

/**
 * Reads `entryOrder` (`oneof kind { literal, binding_path }`) and returns
 * the ordered identifier list. Falls back to `Object.keys(entryMap)` when
 * the order can't be resolved.
 */
function resolveOrderedIdentifiers(
  entryOrder: unknown,
  entryMap: RecordOf,
  request: PropBuildRequest,
): string[] {
  const { dataSources, dataBinder, ctx } = request;
  const unwrappedOrder = unwrapOneOf(entryOrder);
  if (!unwrappedOrder) return Object.keys(entryMap);

  switch (unwrappedOrder.propType) {
    case PROP_KIND.LITERAL: {
      const items = isRecord(unwrappedOrder.propValue) ? unwrappedOrder.propValue.items : undefined;
      return normalizeOrderEntries(items, entryMap);
    }
    case PROP_KIND.BINDING_PATH_SNAKE:
    case PROP_KIND.BINDING_PATH: {
      if (typeof unwrappedOrder.propValue !== "string") {
        reportBindingError(
          SduiErrorName.InvalidBindingPath,
          ctx,
          `ordered_template_data entryOrder bindingPath must be a string; got ${typeof unwrappedOrder.propValue}`,
        );
        return Object.keys(entryMap);
      }
      const { value } = resolveBindingPath(unwrappedOrder.propValue, dataSources, dataBinder, ctx);
      return normalizeOrderEntries(value, entryMap);
    }
    default:
      reportInvalidConfig(
        ctx,
        `ordered_template_data entryOrder has unknown kind="${unwrappedOrder.propType}"`,
      );
      return Object.keys(entryMap);
  }
}

function buildOrderedEntryConfig(
  identifier: string,
  feedEntry: RecordOf,
  templateMapping: RecordOf | undefined,
  request: PropBuildRequest,
  buildContext: NestedComponentBuildContext,
): SduiComponentConfig | undefined {
  const { ctx } = request;

  // Template precedence:
  //   1. mapping.inlineComponent (anonymous schema, shared scope)
  //   2. feedEntry.robloxComponent (per-entry RCT override; only when the
  //      mapping isn't inline — `FeedEntry` has no `inline_component`)
  //   3. mapping.robloxComponent (default RCT)
  const inlineSchema = isRecord(templateMapping?.inlineComponent)
    ? templateMapping.inlineComponent
    : undefined;
  const feedRobloxComponent = stringFieldOr(feedEntry, "robloxComponent", "");
  const mappingRobloxComponent = stringFieldOr(templateMapping, "robloxComponent", "");
  const effectiveRobloxComponent = feedRobloxComponent || mappingRobloxComponent;

  if (!inlineSchema && !effectiveRobloxComponent) {
    reportInvalidConfig(
      ctx,
      `ordered_template_data entry "${identifier}" missing inlineComponent and robloxComponent`,
      { name: identifier },
    );
    return undefined;
  }

  const resolved = resolveTemplate(
    inlineSchema,
    effectiveRobloxComponent,
    ctx,
    buildContext.templateStore,
    identifier,
  );
  if (!resolved) return undefined;

  // Per-iteration overlay; empty when no `input_data` is set.
  const overlayData = asRecordOrEmpty(unwrapOneOf(feedEntry.inputData)?.propValue);

  let config: SduiComponentConfig | undefined;
  if (resolved.isInline) {
    // Shared scope with `feedEntry.input_data` overlaid on parent
    // `inputData`. `templateMapping.inputs` is ignored.
    const overlaySources = makeOverlayDataSources(request.dataSources, overlayData);
    const inputDataSignal = computed(() => overlaySources.value.inputData);
    config = buildContext.builder.buildConfigForComponent(
      resolved.template,
      inputDataSignal,
      buildContext.builderConfig,
      buildContext.parentAnalyticsContext,
      overlaySources,
    );
  } else {
    // Isolated scope: mapping `inputs` defs resolve reactively against
    // parent sources with the feed entry's `input_data` overlaid.
    const mappingInputDefs = asRecordOrEmpty(templateMapping?.inputs);
    const inputDataSignal = computed(() =>
      resolveInputDefs(mappingInputDefs, { ...request, ctx }, overlayData),
    );
    config = buildContext.builder.buildConfigForComponent(
      resolved.template,
      inputDataSignal,
      buildContext.builderConfig,
      buildContext.parentAnalyticsContext,
    );
  }

  if (!config) return undefined;
  config.identifier = identifier;
  return config;
}

/**
 * @deprecated Legacy `ordered_template_data` list variant. Use the unified
 * `component_list` pipeline (`buildComponentList`) instead.
 */
export function buildOrderedTemplateData(
  propData: RecordOf,
  request: PropBuildRequest,
  buildContext: NestedComponentBuildContext,
): ResolvedProp {
  const { dataSources, dataBinder } = request;
  const ctx: BindingContext = { ...request.ctx, parserName: "ordered_template_data" };
  const childRequest: PropBuildRequest = { ...request, ctx };

  const entryMapPath = stringFieldOr(propData, "entryMapPath", "");
  if (!entryMapPath) {
    reportInvalidConfig(ctx, `ordered_template_data missing entryMapPath`);
    return { value: [], category: "failed", error: "Invalid entryMapPath" };
  }

  const { entryOrder } = propData;
  const templateDataMap = asRecordOrEmpty(propData.templateDataMap);
  const configCache = new Map<string, SduiComponentConfig>();

  const visibleSignal = computedEqual<SduiComponentConfig[]>(() => {
    const { value: entryMapValue } = resolveBindingPath(entryMapPath, dataSources, dataBinder, ctx);
    const entryMap = asRecord(entryMapValue);
    if (!entryMap) return [];

    const orderedIdentifiers = resolveOrderedIdentifiers(entryOrder, entryMap, childRequest);
    const result: SduiComponentConfig[] = [];

    for (const identifier of orderedIdentifiers) {
      const feedEntry = asRecord(entryMap[identifier]);
      if (!feedEntry) continue;

      let config = configCache.get(identifier);
      if (!config) {
        const entryCtx = childCtx(ctx, `.${identifier}`);
        try {
          const built = buildOrderedEntryConfig(
            identifier,
            feedEntry,
            asRecord(templateDataMap[identifier]),
            { ...request, ctx: entryCtx },
            buildContext,
          );
          if (!built) continue;
          configCache.set(identifier, built);
          config = built;
        } catch (err) {
          reportFailedToParse(
            entryCtx,
            `ordered_template_data entry "${identifier}" threw: ${stringifyError(err)}`,
          );
          continue;
        }
      }

      if (isComponentVisible(config)) result.push(config);
    }
    return result;
  }, arrayRefEqual);

  return { value: visibleSignal.peek(), category: "propSignal", signal: visibleSignal };
}
