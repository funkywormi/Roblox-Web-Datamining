import { reportBindingError, SduiErrorName } from "../../../errors";
import type { BindingContext, PropBuildRequest, TranslationRef } from "../../../types";
import { PROP_KIND } from "../../../types/propKinds";
import { isOneOf, unwrapOneOf } from "../../../utils/oneOfHelper";
import { isRecord } from "../../../utils/typeGuards";
import { resolveLocalizedLiteral } from "../../localizedLiterals";
import { resolveBindingPath } from "../../SduiDataBinder";
import { resolveStringFormat } from "../buildStringProp";

/**
 * Peels `LiteralValue` to a primitive. Handles the post-normalize message
 * `{ kind: { kind: "stringValue" | …, value } }`, a flat oneOf, or a bare value.
 */
function unwrapLiteralValue(value: unknown): unknown {
  if (isOneOf(value)) return value.value;
  if (isRecord(value) && isOneOf(value.kind)) return value.kind.value;
  return value;
}

/**
 * Shared utility to resolve template argument / item input definitions
 * against data binding sources. Used by both buildNestedComponentProp
 * and buildLazyNestedComponentListProp.
 *
 * Each `TemplateArg` after `normalizeProtoValue` is shaped
 * `{ kind: { kind: "literal" | "bindingPath" | "translation" | "format", value: ... } }`.
 * Bare strings and primitives are passed through unchanged.
 *
 * Status from `resolveBindingPath` is intentionally dropped: the resolved
 * map is consumed as plain inputData by the nested component. The caller
 * is expected to wrap this call in a `computed()` that produces the
 * nested component's `inputDataSignal`, so any reactive dependencies
 * picked up via `resolveBindingPath` (input-data, hydration stores) flow
 * through the parent's signal graph and re-run when upstream data
 * changes.
 */
export function resolveInputDefs(
  inputDefs: Record<string, unknown>,
  request: PropBuildRequest,
  baseData?: Record<string, unknown>,
): Record<string, unknown> {
  const { dataSources, dataBinder, ctx } = request;
  const result: Record<string, unknown> = baseData ? { ...baseData } : {};

  for (const [key, def] of Object.entries(inputDefs)) {
    if (!isRecord(def)) {
      result[key] = def;
      continue;
    }
    const inner = unwrapOneOf(def);
    if (!inner) {
      result[key] = def;
      continue;
    }

    const argCtx: BindingContext = {
      ...ctx,
      propName: ctx.propName ? `${ctx.propName}.inputs.${key}` : `inputs.${key}`,
      parserName: inner.propType,
    };

    switch (inner.propType) {
      case PROP_KIND.LITERAL:
        result[key] = unwrapLiteralValue(inner.propValue);
        break;
      case PROP_KIND.BINDING_PATH_SNAKE:
      case PROP_KIND.BINDING_PATH:
        if (typeof inner.propValue === "string") {
          result[key] = resolveBindingPath(inner.propValue, dataSources, dataBinder, argCtx).value;
        } else {
          reportBindingError(
            SduiErrorName.TemplateArgBindingPathInvalid,
            argCtx,
            `TemplateArg "${key}" bindingPath must be a string; got ${typeof inner.propValue}`,
          );
          result[key] = undefined;
        }
        break;
      case PROP_KIND.TRANSLATION: {
        const ref = isRecord(inner.propValue)
          ? (inner.propValue as Partial<TranslationRef>)
          : undefined;
        result[key] = resolveLocalizedLiteral(ref, dataBinder, argCtx);
        break;
      }
      case PROP_KIND.FORMAT:
        result[key] = isRecord(inner.propValue)
          ? resolveStringFormat(inner.propValue, { ...request, ctx: argCtx })
          : "";
        break;
      default:
        reportBindingError(
          SduiErrorName.TemplateArgShapeUnexpected,
          argCtx,
          `unknown TemplateArg propType="${inner.propType}" for key="${key}"`,
        );
        result[key] = undefined;
        break;
    }
  }

  return result;
}
