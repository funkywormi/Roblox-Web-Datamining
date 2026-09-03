import { computed, type ReadonlySignal } from "@preact/signals-core";

/**
 * Like `computed()` but uses a caller-supplied equality check to avoid
 * notifying downstream subscribers when the derived value is semantically
 * unchanged.
 *
 * Mirrors Lua's `Signals.createComputed(fn, shallowEqual)` pattern.
 * `@preact/signals-core`'s built-in `computed` uses `===` for change
 * detection; this wrapper returns the previous reference when
 * `isEqual(previous, next)` is true, so `===` still sees no change
 * downstream.
 *
 * @param compute - Derives the value from upstream signals. Re-runs whenever
 *                  any read signal changes.
 * @param isEqual - Returns true when two values are semantically equivalent.
 *                  When true, the previous reference is returned and
 *                  subscribers are not notified.
 */
export function computedEqual<T>(
  compute: () => T,
  isEqual: (previous: T, next: T) => boolean,
): ReadonlySignal<T> {
  let previous: T;
  return computed(() => {
    const next = compute();
    if (previous !== undefined && isEqual(previous, next)) {
      return previous;
    }
    previous = next;
    return next;
  });
}

/**
 * Values that {@link shallowEqual} is designed to compare: primitives,
 * `null`, `undefined`, or plain string-keyed records. Arrays, class
 * instances, Maps, Sets, and other non-plain objects are intentionally
 * excluded — `shallowEqual` is not meaningful for them.
 *
 * The record's inner value type is `unknown` (not recursive) because
 * `shallowEqual` only walks one level deep and compares each field with
 * `===`; the field values themselves can be anything.
 */
export type ShallowEqualValue =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined
  | Readonly<Record<string, unknown>>;

/**
 * Coerce an `unknown` value to {@link ShallowEqualValue} for a
 * {@link shallowEqual} comparison. This is a type-only assertion — callers
 * must ensure the value is a primitive or plain record (the contract that
 * `shallowEqual` documents); arrays and non-plain objects will compare by
 * reference at best and may produce surprising results.
 */
export function asShallowEqualValue(value: unknown): ShallowEqualValue {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- documented coercion at the unknown→ShallowEqualValue boundary; runtime contract is enforced by callers.
  return value as ShallowEqualValue;
}

/**
 * Shallow equality check for primitives and plain objects.
 *
 * - Primitives (and identical references) are compared with `===`.
 * - `null` only equals `null`; `null` vs an object is not equal.
 * - Objects are equal when they have the same set of own keys and each
 *   corresponding value matches via `===`. Nested objects are not compared
 *   deeply.
 */
export function shallowEqual(a: ShallowEqualValue, b: ShallowEqualValue): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== "object" || typeof b !== "object") return false;

  const leftKeys = Object.keys(a);
  if (leftKeys.length !== Object.keys(b).length) return false;

  for (const key of leftKeys) {
    if (!Object.hasOwn(b, key)) return false;
    if (a[key] !== b[key]) return false;
  }
  return true;
}

/**
 * Shallow equality for cache values that may be primitives, plain records, or arrays.
 * Non-plain objects compare by identity only.
 */
export function shallowValueEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (a == null || b == null) return false;
  if (typeof a !== "object" || typeof b !== "object") return false;

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((value, index) => Object.is(value, b[index]));
  }

  const prototype: unknown = Object.getPrototypeOf(a);
  if (
    prototype !== Object.getPrototypeOf(b) ||
    (prototype !== Object.prototype && prototype !== null)
  ) {
    return false;
  }

  const leftKeys = Object.keys(a);
  if (leftKeys.length !== Object.keys(b).length) return false;
  return leftKeys.every(
    key => Object.hasOwn(b, key) && Object.is(Reflect.get(a, key), Reflect.get(b, key)),
  );
}
