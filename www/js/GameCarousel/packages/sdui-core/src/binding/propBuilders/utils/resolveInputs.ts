import { computed, type ReadonlySignal } from "@preact/signals-core";

import { asShallowEqualValue, computedEqual, shallowEqual } from "../../../signals/computedEqual";

import {
  reportBindingError,
  reportFailedToParse,
  SduiErrorName,
  stringifyError,
} from "../../../errors";
import type { BindingContext, PropBuildRequest, TranslationRef } from "../../../types";
import { DataStatus } from "../../../types";
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
 * Resolves each input def into a child record and the keys still `NotReady`.
 *
 * Before the parent input is seeded, any pending key leaves `inputData`
 * undefined so the child does not treat missing fields as settled. After
 * seed, ready siblings stay on the record and only those keys are marked
 * pending.
 *
 * A throw on one key is reported and skipped; later keys still resolve.
 * Failed parent reads become `Ready`/`undefined` in the child.
 *
 * Translation misses are config errors, not pending hydration.
 */
export interface ResolvedInputDefs {
  inputData: Record<string, unknown> | undefined;
  pendingInputKeys: ReadonlySet<string>;
}

export function resolveInputDefs(
  inputDefs: Record<string, unknown>,
  request: PropBuildRequest,
  baseData?: Record<string, unknown>,
): ResolvedInputDefs {
  const { dataSources, dataBinder, ctx } = request;
  const result: Record<string, unknown> = baseData ? { ...baseData } : {};
  const pendingInputKeys = new Set<string>();

  for (const [key, def] of Object.entries(inputDefs)) {
    const keyCtx: BindingContext = {
      ...ctx,
      propName: ctx.propName ? `${ctx.propName}.inputs.${key}` : `inputs.${key}`,
    };
    const definitionStatuses: DataStatus[] = [];

    try {
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
        ...keyCtx,
        parserName: inner.propType,
      };

      switch (inner.propType) {
        case PROP_KIND.LITERAL:
          result[key] = unwrapLiteralValue(inner.propValue);
          break;
        case PROP_KIND.BINDING_PATH_SNAKE:
        case PROP_KIND.BINDING_PATH:
          if (typeof inner.propValue === "string") {
            const read = resolveBindingPath(inner.propValue, dataSources, dataBinder, argCtx);
            definitionStatuses.push(read.status);
            result[key] = read.value;
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
            ? resolveStringFormat(inner.propValue, { ...request, ctx: argCtx }, definitionStatuses)
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
      if (definitionStatuses.includes(DataStatus.NotReady)) {
        pendingInputKeys.add(key);
      }
    } catch (err) {
      reportFailedToParse(keyCtx, `failed to resolve input "${key}": ${stringifyError(err)}`);
    }
  }

  const canSeedChildInput = pendingInputKeys.size === 0 || dataSources.value.isInputDataReady;
  return {
    inputData: canSeedChildInput ? result : undefined,
    pendingInputKeys,
  };
}

function pendingKeysEqual(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  return a.size === b.size && [...a].every(key => b.has(key));
}

export function createInputDataSignals(resolveInputs: () => ResolvedInputDefs): {
  inputDataSignal: ReadonlySignal<Record<string, unknown> | undefined>;
  pendingInputKeysSignal: ReadonlySignal<ReadonlySet<string>>;
} {
  const resolvedInputsSignal = computedEqual(resolveInputs, (previous, next) => {
    if (!pendingKeysEqual(previous.pendingInputKeys, next.pendingInputKeys)) return false;
    return shallowEqual(
      asShallowEqualValue(previous.inputData),
      asShallowEqualValue(next.inputData),
    );
  });
  return {
    inputDataSignal: computed(() => resolvedInputsSignal.value.inputData),
    pendingInputKeysSignal: computed(() => resolvedInputsSignal.value.pendingInputKeys),
  };
}
