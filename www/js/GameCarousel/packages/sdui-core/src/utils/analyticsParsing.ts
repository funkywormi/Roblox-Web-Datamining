import type { AnalyticsContext, AnalyticsFieldMap } from "../types";

type AnalyticsScalar = string | number | boolean | undefined;

/**
 * Looks up a scalar field on an analytics snapshot (lua `findAnalyticsField`).
 * Returns `defaultValue` when the key is missing; omit default to get `undefined`.
 */
export function findAnalyticsField(
  key: string,
  analyticsData: AnalyticsFieldMap | undefined,
  defaultValue?: string | number | boolean,
): string | number | boolean | undefined {
  const value = analyticsData?.[key];
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  return defaultValue;
}

// Server-provided analytics maps can carry null/undefined at runtime even though
// `AnalyticsFieldMap` types every value as present.
function readField(
  data: Record<string, AnalyticsFieldMap[string] | null | undefined> | undefined,
  key: string,
): AnalyticsFieldMap[string] | undefined {
  return data?.[key] ?? undefined;
}

/**
 * Looks up a field on the node's own analytics data first, then its ancestors'.
 * Returns `defaultValue` when the key is absent (or null) in both.
 */
export function findAnalyticsFieldInAncestors(
  key: string,
  analyticsContext: AnalyticsContext | undefined,
): AnalyticsFieldMap[string] | undefined;
export function findAnalyticsFieldInAncestors<T>(
  key: string,
  analyticsContext: AnalyticsContext | undefined,
  defaultValue: T,
): AnalyticsFieldMap[string] | T;
export function findAnalyticsFieldInAncestors<T>(
  key: string,
  analyticsContext: AnalyticsContext | undefined,
  defaultValue?: T,
): AnalyticsFieldMap[string] | T | undefined {
  return (
    readField(analyticsContext?.analyticsData, key) ??
    readField(analyticsContext?.ancestorAnalyticsData, key) ??
    defaultValue
  );
}

/**
 * Coerces a template-bound analytics scalar to match the `fallback` type.
 * A string fallback stringifies number/boolean inputs; a number fallback
 * parses int-like strings. Anything that can't be coerced returns `fallback`.
 */
export function parseAnalyticsField(input: AnalyticsScalar, fallback: string): string;
export function parseAnalyticsField(input: AnalyticsScalar, fallback: number): number;
export function parseAnalyticsField(
  input: AnalyticsScalar,
  fallback: string | number,
): string | number {
  if (typeof fallback === "number") {
    if (typeof input === "number") {
      return input;
    }
    if (typeof input === "string") {
      const parsed = Number.parseInt(input, 10);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
    return fallback;
  }

  if (typeof input === "string") {
    return input;
  }
  if (typeof input === "number" || typeof input === "boolean") {
    return String(input);
  }
  return fallback;
}

/** Ancestor fields first; own snapshot wins on key collision (Lua binding parity). */
export function mergeAnalyticsFieldMaps(
  ancestorFields: AnalyticsFieldMap,
  ownFields: AnalyticsFieldMap,
): AnalyticsFieldMap {
  return { ...ancestorFields, ...ownFields };
}

/** Flattens a context's ancestor + own snapshots into a single field map (own wins). */
export function readMergedAnalyticsFields(
  analyticsContext: AnalyticsContext | undefined,
): AnalyticsFieldMap {
  if (!analyticsContext) {
    return {};
  }
  return mergeAnalyticsFieldMaps(
    analyticsContext.getAncestorAnalyticsDataSnapshot(),
    analyticsContext.getAnalyticsDataSnapshot(),
  );
}
