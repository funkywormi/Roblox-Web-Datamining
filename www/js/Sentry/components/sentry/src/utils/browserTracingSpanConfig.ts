/** Resource span ops dropped from Sentry ingest (still sent to OTEL). */
export const IGNORED_RESOURCE_SPAN_OPS = [
  "resource.link",
  "resource.script",
  "resource.css",
  "resource.img",
  "resource.iframe",
] as const;

/**
 * Opt-in allowlist for http.client spans in Sentry Performance UI.
 * Empty by default — teams add URL patterns via PR when needed.
 * OTEL receives the unfiltered transaction before this allowlist is applied.
 *
 * @example
 * // UBIQUITY-1234: track catalog details latency on game detail pages
 * /\/catalog\.roblox\.com\/v1\/catalog\/items\/details/i,
 */
export const HTTP_SPAN_ALLOWLIST: RegExp[] = [];

export function shouldTraceHttpRequest(url: string): boolean {
  return HTTP_SPAN_ALLOWLIST.some(pattern => pattern.test(url));
}
