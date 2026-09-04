/**
 * Shared runtime type guards for the SDUI pipeline.
 *
 * Guards in this file are deliberately generic — they answer questions about
 * the *shape* of an unknown value (is it a string-keyed object? is it a
 * defined JSON value?) and have no SDUI-domain semantics. Domain-specific
 * guards (oneOf normalization, render-tree shapes, action-data brands) live
 * next to their consumers (e.g. `binding/oneOf.ts`, `renderer/typeGuards.ts`).
 */
import type { JsonValue } from "@bufbuild/protobuf";
import { SduiComponentConfig, SduiManagedChildList } from "../types";

/**
 * Generic plain-object shape. Centralized so every layer (proto decode,
 * binding pipeline, store) shares one definition of "an object I can index
 * by string."
 */
export type RecordOf<T = unknown> = Record<string, T>;

/** Narrows `unknown` to an array without leaking `any` into consumers. */
export function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Narrows `unknown` to a string-keyed plain object.
 *
 * Excludes arrays — every callsite that mistakes an array for a record ends
 * up producing the wrong nested-prop shape, so the `Array.isArray` check
 * lives here and not in the consumer. Also excludes `null` (which has
 * `typeof === "object"`).
 */
export function isRecord(value: unknown): value is RecordOf {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** Reads the discriminant shared by object- and array-backed SDUI runtime values. */
export function readSduiKind(value: unknown): unknown {
  if (value === null || typeof value !== "object") return undefined;
  return Reflect.get(value, "__sduiKind");
}

/** Internal SDUI runtime values reserve `__sduiKind` as their discriminant. */
export function hasSduiKind<K extends string>(
  value: unknown,
  kind: K,
): value is object & { readonly __sduiKind: K } {
  return readSduiKind(value) === kind;
}

/**
 * Narrows a `string` to a member of a readonly tuple of literal strings.
 */
export function isMemberOf<T extends string>(values: readonly T[], value: string): value is T {
  return values.some(member => member === value);
}

/**
 * Narrowing variant: returns the record or `undefined`. Use when the
 * caller wants to early-out on non-records (e.g. validating a proto
 * payload before walking it).
 */
export function asRecord(value: unknown): RecordOf | undefined {
  return isRecord(value) ? value : undefined;
}

/**
 * Coercion variant: returns the record or an empty `{}`. Use when the
 * caller wants to read optional fields off a record without first
 * branching on its presence (e.g. unwrapping a missing oneOf payload).
 */
export function asRecordOrEmpty(value: unknown): RecordOf {
  return isRecord(value) ? value : {};
}

/**
 * Reads a `string` field off a record with a fallback. Returns `fallback`
 * when the record is `undefined`, the key is missing, or the value is not
 * a string. Centralized because proto field reads frequently need this
 * exact shape (proto strings default to `""`, but we sometimes want a
 * non-empty default or a sentinel value instead).
 */
export function stringFieldOr(record: RecordOf | undefined, key: string, fallback: string): string {
  if (!record) return fallback;
  const value = record[key];
  return typeof value === "string" ? value : fallback;
}

/**
 * Narrows `unknown` to bufbuild's {@link JsonValue}. Used at the network
 * boundary because the DOM lib types `Response.json()` as `Promise<any>`,
 * which would otherwise leak `any` into the rest of the pipeline.
 *
 * Only rejects `undefined` — deeper structural validation is delegated to
 * `fromJson`, which checks the value against the proto schema and throws
 * on mismatch.
 */
export function isJsonValue(value: unknown): value is JsonValue {
  return value !== undefined;
}

/**
 * Production `SduiComponentConfig` values are explicitly branded by
 * `buildConfigForComponent`. Structural lookalikes remain ordinary data.
 */
export function isSduiConfig(value: unknown): value is SduiComponentConfig {
  if (!isRecord(value) || readSduiKind(value) !== "config") return false;
  return typeof value.componentType === "number" && isRecord(value.props);
}

/** Homogeneous non-empty config list. Every entry must carry the config brand. */
export function isSduiConfigArray(value: unknown): value is SduiComponentConfig[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.every(isSduiConfig);
}

/** Shape produced by `SduiRenderer` when `doesManageChildren` and the prop is nested config(s). */
export function isSduiManagedChildList(value: unknown): value is SduiManagedChildList {
  if (!isRecord(value)) return false;
  return Array.isArray(value.configs) && typeof value.renderItem === "function";
}
