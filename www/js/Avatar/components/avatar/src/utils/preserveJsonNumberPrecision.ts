/** Axios-compatible response transformer signature, typed locally to avoid a direct axios dependency. */
export type ResponseTransformer = (data: unknown) => unknown;

/**
 * Returns an axios `transformResponse` that quote-wraps named numeric JSON
 * values BEFORE `JSON.parse`, so 64-bit ids above `Number.MAX_SAFE_INTEGER`
 * (2^53 − 1) — e.g. snowflake look ids — survive the trip into JavaScript
 * without silent precision loss.
 *
 * Downstream consumers must type the affected field as `string`.
 */
export function preserveJsonNumberPrecision(fields: readonly string[]): ResponseTransformer {
  // Matches `"<field>":<digits>` with a JSON-terminator lookahead so we only
  // rewrite top-level numeric values, never digits embedded inside strings.
  const fieldPattern = new RegExp(
    String.raw`"(?<key>${fields.join("|")})"(?<pre>\s*):(?<post>\s*)(?<value>-?\d+)(?=\s*[,}\]]|\s*$)`,
    "g",
  );

  return data => {
    if (typeof data !== "string" || data.length === 0) return data;
    try {
      return JSON.parse(data.replace(fieldPattern, `"$<key>"$<pre>:$<post>"$<value>"`));
    } catch {
      return JSON.parse(data);
    }
  };
}
