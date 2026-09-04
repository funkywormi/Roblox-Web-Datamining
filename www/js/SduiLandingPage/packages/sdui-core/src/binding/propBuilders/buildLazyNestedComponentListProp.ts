/**
 * Dispatcher for `LazyNestedComponentListProp` and `NestedComponentListProp`.
 *
 * TODO(web-sdui): Both descriptors behave the same today. Follow-up: provide
 * descriptor-driven lazy rendering so they defer / diverge —
 * `LazyNestedComponentListProp` lazy-renders; `NestedComponentListProp` does not.
 *
 * Variants:
 * - `array_map`              — DEPRECATED. homogeneous list driven by a binding-path array.
 * - `item_list`              — DEPRECATED. heterogeneous static list with per-item template.
 * - `ordered_template_data`  — DEPRECATED. keyed feed entries assembled in a dynamic order.
 * - `conditional`            — one-of branch resolved at render time.
 * - `component_list`         — PREFERRED: unified V2 list pipeline (normalize/sort/render).
 *
 * Each variant accepts either `inline_component` (anonymous nested
 * `UiComponentSchema`) or `roblox_component` (RCT lookup) as the template
 * source. When both are set, `inline_component` wins.
 *
 * Inline children build in shared scope:
 * - the parent's `DataBindingSources` is forwarded to
 *   `SduiBuilder.buildConfigForComponent` so hydration sources are inherited;
 * - any per-iteration entry data is overlaid on top of the parent's
 *   `inputData`.
 *
 * RCT children build with their own isolated scope from the
 * carrier's `inputs` def map.
 *
 */
import { reportInvalidConfig } from "../../errors";
import type { BindingContext, PropBuildOptions, PropBuildRequest, ResolvedProp } from "../../types";
import { asRecord, asRecordOrEmpty } from "../../utils/typeGuards";
import { generateConditionalPropValue } from "./utils/sduiPropSignalUtils";
import { buildArrayMap } from "./lazyNestedList/arrayMap";
import { buildItemList } from "./lazyNestedList/itemList";
import { buildOrderedTemplateData } from "./lazyNestedList/orderedTemplateData";
import { buildComponentList } from "./lazyNestedList/componentList/buildComponentList";
import { PROP_KIND } from "../../types/propKinds";

export function buildLazyNestedComponentListProp(
  propType: string,
  propValue: unknown,
  request: PropBuildRequest,
  options: PropBuildOptions = { kind: "none" },
): ResolvedProp {
  const ctx: BindingContext = { ...request.ctx, parserName: propType };
  const childRequest: PropBuildRequest = { ...request, ctx };
  const buildContext = options.kind === "nested" ? options.build : undefined;

  if (propType === PROP_KIND.CONDITIONAL) {
    return generateConditionalPropValue(
      asRecordOrEmpty(propValue),
      childRequest,
      buildLazyNestedComponentListProp,
      options,
    );
  }

  if (!buildContext) {
    reportInvalidConfig(ctx, `${propType} called without NestedComponentBuildContext`);
    return { value: undefined, category: "failed", error: "Missing build context" };
  }

  const listPayload = asRecord(propValue);
  if (!listPayload) {
    reportInvalidConfig(ctx, `${propType} expected an object payload; got ${typeof propValue}`);
    return { value: undefined, category: "failed", error: "No list data" };
  }

  switch (propType) {
    // --- Deprecated variants. `component_list` is the preferred variant. ---
    case "array_map":
    case "arrayMap":
      return buildArrayMap(listPayload, childRequest, buildContext);
    case "item_list":
    case "itemList":
      return buildItemList(listPayload, childRequest, buildContext);
    case "ordered_template_data":
    case "orderedTemplateData":
      return buildOrderedTemplateData(listPayload, childRequest, buildContext);
    // --- Active variant. ---
    case "component_list":
    case "componentList":
      return buildComponentList(listPayload, childRequest, buildContext);
    default:
      reportInvalidConfig(ctx, `Unknown LazyNestedComponentListProp variant: ${propType}`);
      return {
        value: undefined,
        category: "failed",
        error: `Unknown LazyNestedComponentListProp variant: ${propType}`,
      };
  }
}
