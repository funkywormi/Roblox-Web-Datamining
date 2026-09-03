import { computed, type ReadonlySignal } from "@preact/signals-core";

import { reportBindingError, SduiErrorName } from "../../errors";
import type {
  AnalyticsFieldMap,
  BindingContext,
  DataBindingSources,
  SduiDataBinder,
} from "../../types";
import { isRecord } from "../../utils/typeGuards";
import { unwrapOneOf } from "../../utils/oneOfHelper";
import { isBindingPathKind, PROP_KIND } from "../../types/propKinds";
import { resolveBindingPath } from "../SduiDataBinder";

/**
 * Output of `resolveAnalyticsFields`. `literals` carries `AnalyticsDataField.literal`
 * fields; `signals` carries non-subscribing reads for `AnalyticsDataField.binding_path`
 * fields. `buildAnalyticsContext` overlays signals on literals at snapshot time, with
 * collection-set locals winning last.
 */
export interface ResolvedAnalyticsFields {
  literals: AnalyticsFieldMap;
  signals: Record<string, ReadonlySignal<unknown>>;
}

const EMPTY_RESULT: ResolvedAnalyticsFields = { literals: {}, signals: {} };

/** Drops non-scalars so a malformed read can't poison telemetry parsers. */
export function coerceAnalyticsScalar(value: unknown): string | number | boolean | undefined {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  return undefined;
}

function makeFieldContext(rootCtx: BindingContext, fieldName: string): BindingContext {
  const propName = rootCtx.propName
    ? `${rootCtx.propName}.analyticsData.${fieldName}`
    : `analyticsData.${fieldName}`;
  return { ...rootCtx, propName, parserName: "AnalyticsDataField" };
}

/**
 * Splits each `AnalyticsDataField` in `template.shared.analyticsData` into a
 * literal scalar or a non-subscribing binding-path read. Per-field failures
 * are isolated and reported so one bad entry can't sink the rest of the map.
 */
export function resolveAnalyticsFields(
  rawAnalyticsData: Record<string, unknown> | undefined,
  dataSources: ReadonlySignal<DataBindingSources>,
  dataBinder: SduiDataBinder,
  rootCtx: BindingContext,
): ResolvedAnalyticsFields {
  if (!rawAnalyticsData) return EMPTY_RESULT;

  const literals: AnalyticsFieldMap = {};
  const signals: Record<string, ReadonlySignal<unknown>> = {};

  for (const [fieldName, rawField] of Object.entries(rawAnalyticsData)) {
    const fieldCtx = makeFieldContext(rootCtx, fieldName);

    const reportFieldError = (errorName: SduiErrorName, message: string, extra?: object): void => {
      reportBindingError(errorName, fieldCtx, message, extra);
    };

    if (!isRecord(rawField)) {
      reportFieldError(
        SduiErrorName.FailedToParseProp,
        `analytics field "${fieldName}" must be a record; got ${typeof rawField}`,
      );
      continue;
    }

    const kindWrapper = unwrapOneOf(rawField);
    if (!kindWrapper) {
      reportFieldError(
        SduiErrorName.FailedToParseProp,
        `analytics field "${fieldName}" missing oneOf wrapper (kind/value)`,
      );
      continue;
    }

    const { propType, propValue } = kindWrapper;

    if (propType === PROP_KIND.LITERAL) {
      const scalar = coerceAnalyticsScalar(propValue);
      if (scalar === undefined) {
        reportFieldError(
          SduiErrorName.FailedToParseProp,
          `analytics field "${fieldName}" literal was not a scalar (got ${typeof propValue})`,
        );
        continue;
      }
      literals[fieldName] = scalar;
      continue;
    }

    if (isBindingPathKind(propType)) {
      if (typeof propValue !== "string" || propValue.length === 0) {
        reportFieldError(
          SduiErrorName.InvalidBindingPath,
          `analytics field "${fieldName}" bindingPath must be a non-empty string; got ${typeof propValue}`,
          { bindingPath: String(propValue) },
        );
        continue;
      }
      // Wrap in a `computed` to reuse `resolveBindingPath`'s input-vs-hydration
      // dispatch and default-path fallback. Snapshot consumers read via `peek()` so
      // analytics never accidentally subscribes the renderer.
      const bindingPath = propValue;
      signals[fieldName] = computed(
        () => resolveBindingPath(bindingPath, dataSources, dataBinder, fieldCtx).value,
      );
      continue;
    }

    reportFieldError(
      SduiErrorName.FailedToParseProp,
      `analytics field "${fieldName}" has unknown kind="${propType}" (expected "literal" or "bindingPath")`,
    );
  }

  return { literals, signals };
}
