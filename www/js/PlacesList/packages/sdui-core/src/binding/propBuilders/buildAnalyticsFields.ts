import type { ReadonlySignal } from "@preact/signals-core";

import { reportBindingError, SduiErrorName } from "../../errors";
import type {
  AnalyticsFieldMap,
  BindingContext,
  DataBindingSources,
  PropBuildRequest,
  SduiDataBinder,
} from "../../types";
import { isRecord } from "../../utils/typeGuards";
import { unwrapOneOf } from "../../utils/oneOfHelper";
import { isUnchangedBySnakeToCamel, snakeToCamel } from "../../utils/caseConversion";
import { buildDefaultProp } from "./buildDefaultProp";

/**
 * Output of `resolveAnalyticsFields`. `literals` carries `AnalyticsDataField.literal`
 * fields; `signals` carries non-subscribing reads for dynamic binding-path and
 * conditional fields. `buildAnalyticsContext` overlays signals on literals at
 * snapshot time, with collection-set locals winning last.
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
 * literal scalar or a non-subscribing dynamic read. Fields reuse the default
 * prop builder so binding paths and conditionals follow the same resolution
 * mechanics as regular props. Per-field failures are isolated and reported
 * so one bad entry can't sink the rest of the map.
 *
 * Keys are normalized to camelCase. Templates author analytics keys against
 * proto field names, so the same field arrives as `universe_id` on one surface
 * and `universeId` on another; every consumer reads camelCase, matching the Lua
 * client's `ProtoVariableMapper` output. Normalizing here keeps that the one
 * place the two spellings are reconciled.
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
  // camelCase key -> original template key that owns it
  const usedKeys = new Map<string, string>();

  // Keys that snakeToCamel would leave unchanged (already the consumer spelling)
  // are resolved first so they win over a snake_case spelling of the same field
  // regardless of map order. The sort is stable, so fields that don't collide
  // keep their template order.
  const entries = Object.entries(rawAnalyticsData).sort(
    ([a], [b]) => Number(isUnchangedBySnakeToCamel(b)) - Number(isUnchangedBySnakeToCamel(a)),
  );

  for (const [rawFieldName, rawField] of entries) {
    const fieldCtx = makeFieldContext(rootCtx, rawFieldName);

    const reportFieldError = (errorName: SduiErrorName, message: string, extra?: object): void => {
      reportBindingError(errorName, fieldCtx, message, extra);
    };

    const key = snakeToCamel(rawFieldName);
    const isKeyUsed = usedKeys.has(key);
    if (isKeyUsed) {
      const usedKeyName = usedKeys.get(key);
      reportFieldError(
        SduiErrorName.DuplicateAnalyticsFieldKey,
        `analytics field "${rawFieldName}" collides with "${usedKeyName}" as "${key}"; keeping "${usedKeyName}"`,
      );
      continue;
    }

    if (!isRecord(rawField)) {
      reportFieldError(
        SduiErrorName.FailedToParseProp,
        `analytics field "${rawFieldName}" must be a record; got ${typeof rawField}`,
      );
      continue;
    }

    const kindWrapper = unwrapOneOf(rawField);
    if (!kindWrapper) {
      reportFieldError(
        SduiErrorName.FailedToParseProp,
        `analytics field "${rawFieldName}" missing oneOf wrapper (kind/value)`,
      );
      continue;
    }

    const request: PropBuildRequest = {
      dataSources,
      dataBinder,
      ctx: fieldCtx,
      // AnalyticsDataField conditional branches only contain literal or
      // binding-path values, so the default builder never recursively dispatches
      // a nested prop definition through this callback.
      buildProp: () => ({
        value: undefined,
        category: "failed",
        error: "AnalyticsDataField does not support nested prop definitions",
      }),
    };
    const result = buildDefaultProp(kindWrapper.propType, kindWrapper.propValue, request, {
      kind: "default",
      parser: coerceAnalyticsScalar,
    });

    if (result.category === "literal") {
      const scalar = coerceAnalyticsScalar(result.value);
      if (scalar === undefined) {
        reportFieldError(
          SduiErrorName.FailedToParseProp,
          `analytics field "${rawFieldName}" literal was not a scalar (got ${typeof kindWrapper.propValue})`,
        );
        continue;
      }
      literals[key] = scalar;
      usedKeys.set(key, rawFieldName);
      continue;
    }

    if (result.category === "propSignal") {
      signals[key] = result.signal;
      usedKeys.set(key, rawFieldName);
    }
  }

  return { literals, signals };
}
