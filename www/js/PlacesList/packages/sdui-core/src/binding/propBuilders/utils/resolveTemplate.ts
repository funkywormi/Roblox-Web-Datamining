/**
 * Shared template resolution for `NestedComponentProp` and the variants of
 * `LazyNestedComponentListProp` (`array_map`, `item_list`,
 * `ordered_template_data`, `component_list`).
 *
 * Implements the proto precedence rule: `inline_component` wins over
 * `roblox_component`.
 */
import { reportBindingError, reportInvalidConfig, SduiErrorName } from "../../../errors";
import type { BindingContext, SduiTemplateStore, UiComponentTemplate } from "../../../types";
import type { RecordOf } from "../../../utils/typeGuards";
import { convertUiComponentTemplate } from "../../../proto/convertDecodedMessage";

const inlineTemplateCache = new WeakMap<RecordOf, UiComponentTemplate>();

export interface ResolvedTemplate {
  template: UiComponentTemplate;
  /** `true` when the template was materialized from an inline schema. */
  isInline: boolean;
}

/**
 * Picks the child template for a nested-component carrier.
 *
 * Precedence:
 *   1. `inlineSchema` if present — converted on the fly into a
 *      `UiComponentTemplate`.
 *   2. Otherwise `robloxComponent` via the template store.
 *
 * Returns `undefined` (and logs) when neither yields a usable template.
 *
 * `identifierForLog` is appended to log messages and `errorData.name` so
 * keyed-feed entries (`ordered_template_data`) can point analytics back at
 * the specific identifier that failed.
 */
export function resolveTemplate(
  inlineSchema: RecordOf | undefined,
  robloxComponent: string,
  ctx: BindingContext,
  templateStore: SduiTemplateStore,
  identifierForLog?: string,
): ResolvedTemplate | undefined {
  if (inlineSchema) {
    let template = inlineTemplateCache.get(inlineSchema);
    if (!template) {
      template = convertUiComponentTemplate(inlineSchema);
      inlineTemplateCache.set(inlineSchema, template);
    }
    if (template.schemaType === "unknown") {
      reportInvalidConfig(
        ctx,
        `inlineComponent schema kind not recognized${
          identifierForLog ? ` for "${identifierForLog}"` : ""
        }`,
        identifierForLog ? { name: identifierForLog } : undefined,
      );
      return undefined;
    }
    return { template, isInline: true };
  }
  if (!robloxComponent) return undefined;
  const template = templateStore.getTemplateByRobloxComponent(robloxComponent);
  if (!template) {
    reportBindingError(
      SduiErrorName.FailedToFindTemplate,
      ctx,
      `could not find template for robloxComponent="${robloxComponent}"`,
      { name: robloxComponent },
    );
    return undefined;
  }
  return { template, isInline: false };
}
