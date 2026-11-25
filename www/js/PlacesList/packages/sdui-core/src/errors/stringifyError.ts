/**
 * Renders an unknown thrown value into a human-readable string for error
 * reports. Used at `catch` boundaries that funnel into
 * `reportFailedToParse` / `reportInvalidConfig` so structured data thrown
 * by lower layers (e.g. `Error` subclasses, plain objects from schema
 * libraries) survive into the analytics payload.
 *
 * Order:
 *   1. `Error.message` for the standard case.
 *   2. The string itself when callers `throw "literal"`.
 *   3. `JSON.stringify` for plain objects/arrays (guarded against cyclic
 *      values — `JSON.stringify` throws on cycles).
 *   4. `String(value)` as a final fallback (handles `Symbol`, primitives,
 *      and the `JSON.stringify(undefined) === undefined` case).
 */

function tryJsonStringify(value: unknown): string | undefined {
  try {
    return JSON.stringify(value);
  } catch {
    return undefined;
  }
}

export function stringifyError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return tryJsonStringify(err) ?? String(err);
}
