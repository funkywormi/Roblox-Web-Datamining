import type { ActionParams, SduiResolvedAction } from "../types";
import { isRecord } from "../utils/typeGuards";

/**
 * Returns the first defined value from `params` for any of `keys`. Lets
 * each handler accept both camelCase and snake_case proto keys without
 * branching at every call site.
 */
export function readParam(
  params: Record<string, unknown> | undefined,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = params?.[key];
    if (value === undefined || value === null) continue;
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
      return String(value);
    }
  }
  return undefined;
}

/**
 * Multi-key counterpart to {@link readParam} for repeated string fields.
 * Only accepts a non-empty array whose every item is a string, so a partially
 * decoded or empty repeated field falls through to the next key rather than
 * reaching a handler as a valid value.
 */
export function readStringArrayParam(
  params: Record<string, unknown> | undefined,
  ...keys: string[]
): string[] | undefined {
  for (const key of keys) {
    const value = params?.[key];
    if (Array.isArray(value) && value.length > 0 && value.every(item => typeof item === "string")) {
      return value;
    }
  }
  return undefined;
}

/**
 * Reads a `string` field from action params with a fallback. Returns `defaultValue`
 * when the key is missing or the value is not a string.
 *
 * The function uses function overloading to exclude undefined from the return
 * type when a default value is provided.
 */
export function readStringActionParam(
  actionParams: ActionParams,
  key: string,
  defaultValue: string,
): string;

export function readStringActionParam(
  actionParams: ActionParams,
  key: string,
  defaultValue: string | undefined,
): string | undefined;

export function readStringActionParam(
  actionParams: ActionParams,
  key: string,
  defaultValue: string | undefined,
): string | undefined {
  const value = actionParams[key];
  if (typeof value === "string") {
    return value;
  }
  return defaultValue;
}

/**
 * Reads a `boolean` field from action params with a fallback. Returns `defaultValue`
 * when the key is missing or the value is not a boolean.
 *
 * The function uses function overloading to exclude undefined from the return
 * type when a default value is provided.
 */
export function readBooleanActionParam(
  actionParams: ActionParams,
  key: string,
  defaultValue: boolean,
): boolean;

export function readBooleanActionParam(
  actionParams: ActionParams,
  key: string,
  defaultValue: boolean | undefined,
): boolean | undefined;

export function readBooleanActionParam(
  actionParams: ActionParams,
  key: string,
  defaultValue: boolean | undefined,
): boolean | undefined {
  const value = actionParams[key];
  if (typeof value === "boolean") {
    return value;
  }
  return defaultValue;
}

/**
 * Reads a `number` field from action params with a fallback. Returns `defaultValue`
 * when the key is missing or the value is not a finite number, including
 * `NaN`, `Infinity`, and `-Infinity`.
 *
 * The function uses function overloading to exclude undefined from the return
 * type when a default value is provided.
 */
export function readNumberActionParam(
  actionParams: ActionParams,
  key: string,
  defaultValue: number,
): number;

export function readNumberActionParam(
  actionParams: ActionParams,
  key: string,
  defaultValue: number | undefined,
): number | undefined;

export function readNumberActionParam(
  actionParams: ActionParams,
  key: string,
  defaultValue: number | undefined,
): number | undefined {
  const value = actionParams[key];
  return typeof value === "number" && Number.isFinite(value) ? value : defaultValue;
}

/**
 * Reads an `array` field from action params with a fallback. Returns `defaultValue`
 * when the key is missing or the value is not an array. Note that this function only
 * checks for the presence of an array, not the type of the array items.
 *
 * The function uses function overloading to exclude undefined from the return
 * type when a default value is provided.
 */
export function readArrayActionParam<T>(
  actionParams: ActionParams,
  key: string,
  defaultValue: T[],
): T[];

export function readArrayActionParam<T = unknown>(
  actionParams: ActionParams,
  key: string,
  defaultValue: T[] | undefined,
): T[] | undefined;

export function readArrayActionParam(
  actionParams: ActionParams,
  key: string,
  defaultValue: unknown[] | undefined,
): unknown[] | undefined {
  const value = actionParams[key];
  return Array.isArray(value) ? value : defaultValue;
}

/**
 * Reads an `object` field from action params with a fallback. Returns `defaultValue`
 * when the key is missing or the value is not an object.
 *
 * The function uses function overloading to exclude undefined from the return
 * type when a default value is provided.
 */
export function readObjectActionParam<T extends object>(
  actionParams: ActionParams,
  key: string,
  defaultValue: T,
): T;

export function readObjectActionParam<T extends object = Record<string, unknown>>(
  actionParams: ActionParams,
  key: string,
  defaultValue: T | undefined,
): T | undefined;

export function readObjectActionParam(
  actionParams: ActionParams,
  key: string,
  defaultValue: object | undefined,
): object | undefined {
  const value = actionParams[key];
  return isRecord(value) ? value : defaultValue;
}

export function isSduiResolvedAction(value: unknown): value is SduiResolvedAction {
  return isRecord(value) && typeof value.onActivated === "function";
}

/**
 * Reads an `SduiResolvedAction` field from action params with a fallback. Returns
 * `defaultValue` when the key is missing or the value is not a resolved action.
 *
 * The function uses function overloading to exclude undefined from the return
 * type when a default value is provided.
 */
export function readSduiResolvedActionParam(
  actionParams: ActionParams,
  key: string,
  defaultValue: SduiResolvedAction,
): SduiResolvedAction;

export function readSduiResolvedActionParam(
  actionParams: ActionParams,
  key: string,
  defaultValue: SduiResolvedAction | undefined,
): SduiResolvedAction | undefined;

export function readSduiResolvedActionParam(
  actionParams: ActionParams,
  key: string,
  defaultValue: SduiResolvedAction | undefined,
): SduiResolvedAction | undefined {
  const value = actionParams[key];
  return isSduiResolvedAction(value) ? value : defaultValue;
}
