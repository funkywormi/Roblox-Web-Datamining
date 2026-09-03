import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";
import { bigIntFromNumber, parseBigInt } from "@rbx/core-lib/bigint";
import { WebVitalsSchema } from "@rbx/event-stream-proto/eventstream/web/web_vitals_pb";
import { EventStreamClient } from "@rbx/event-stream-v2";

/**
 * Web-vital measurements keyed by metric (`lcp`, `fcp`, `ttfb`, `cls`, `inp`),
 * each `{ value }`. Matches the shape Sentry attaches to `event.measurements`.
 */
export type WebVitalMeasurements = Record<string, { value?: number } | undefined> | undefined;

// UserEventBase.userId is an int64 (bigint). Callers pass the user id Sentry has.
function toUserId(id: string | number | bigint | null | undefined): bigint | undefined {
  if (id == null) {
    return undefined;
  }
  if (typeof id === "bigint") {
    return id;
  }
  return (typeof id === "number" ? bigIntFromNumber(id) : parseBigInt(id)) ?? undefined;
}

// The EventStreamClient is cheap but stateless; memoize one per baseUrl so the
// legacy and Next.js call sites don't allocate on every transaction.
let cachedClient: EventStreamClient | undefined;
let cachedBaseUrl: string | undefined;
function getClient(baseUrl: string): EventStreamClient {
  if (cachedClient == null || cachedBaseUrl !== baseUrl) {
    cachedClient = new EventStreamClient({ baseUrl });
    cachedBaseUrl = baseUrl;
  }
  return cachedClient;
}

/**
 * Sends the transaction's Core Web Vitals to the event stream
 * (experience-signals-ingest -> Superset, table `ingest_proto.web_vitals`) as a
 * single WebVitals event (one row per page load; each vital is an optional typed
 * column). Shared by the legacy .NET sentry component and the Next.js client
 * Sentry init; each passes its own event-stream base URL (apiGatewayUrl), the
 * user id, and the internal page name.
 *
 * LCP/FCP/TTFB/INP are in milliseconds; CLS is a unitless score. No-ops when the
 * transaction carries none of the tracked vitals (e.g. navigations).
 */
export function sendWebVitals(
  baseUrl: string,
  measurements: WebVitalMeasurements,
  userId: string | number | bigint | null | undefined,
  pageName: string | undefined,
): void {
  if (!measurements) {
    return;
  }

  const lcpMs = measurements.lcp?.value;
  const fcpMs = measurements.fcp?.value;
  const ttfbMs = measurements.ttfb?.value;
  const cls = measurements.cls?.value;
  const inpMs = measurements.inp?.value;

  // Nothing to report (e.g. navigation transactions have no web vitals).
  if (![lcpMs, fcpMs, ttfbMs, cls, inpMs].some(value => typeof value === "number")) {
    return;
  }

  try {
    // Fire-and-forget; the client sends with keepalive so this survives page hide
    // and already logs its own errors, so we only guard the returned promise here.
    getClient(baseUrl)
      .sendEvent(WebVitalsSchema, {
        localTimestamp: new Date().toISOString(),
        // userId is set explicitly; ingest populates the rest of user_event_base
        // (user_key, etc.) from the id.
        userEventBase: { userId: toUserId(userId) },
        page: pageName,
        url: typeof window === "undefined" ? undefined : window.location.href,
        lcpMs,
        fcpMs,
        ttfbMs,
        cls,
        inpMs,
      })
      .catch(() => {
        // Best-effort telemetry; the client already logs its own failures.
      });
  } catch (error) {
    console.error("[PERF] Failed to send web vitals:", error);
  }
}

/**
 * web-vitals reports TTFB only after `load` and, unlike LCP/CLS/INP/FCP, has no
 * page-hide fallback — so it's missing on sessions backgrounded before load,
 * even though `responseStart` is available from the first byte. Read it directly
 * (matching onTTFB: `responseStart - activationStart`, clamped at 0).
 *
 * Returns `undefined` (no backfill) when TTFB is already set, no other vital was
 * captured (avoids TTFB-only rows), or the value is unavailable.
 */
export function getFallbackTtfb(
  measurements: Record<string, { value: number }>,
): { value: number } | undefined {
  if (measurements.ttfb != null || Object.keys(measurements).length === 0) {
    return undefined;
  }
  if (typeof performance === "undefined") {
    return undefined;
  }
  const [nav] = performance.getEntriesByType("navigation");
  if (nav && nav.responseStart > 0) {
    const activationStart = (nav as { activationStart?: number }).activationStart ?? 0;
    return { value: Math.max(nav.responseStart - activationStart, 0) };
  }
  return undefined;
}

/**
 * Captures Core Web Vitals for the current page load at 100% — independent of
 * Sentry/OTEL trace sampling — and sends a single WebVitals event on page hide.
 *
 * `getUserId`/`getPageName` are read at flush time so they reflect the final page
 * state (e.g. the current route's internal page name). Call once per page load;
 * no-ops outside the browser.
 */
export function reportWebVitals(
  baseUrl: string,
  getUserId: () => string | number | bigint | null | undefined,
  getPageName: () => string | undefined,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const measurements: Record<string, { value: number }> = {};
  const record = (key: string) => (metric: { value: number }) => {
    measurements[key] = { value: metric.value };
  };

  // web-vitals finalizes LCP/CLS/INP when the page is backgrounded and reports
  // FCP/TTFB earlier; each callback fires once with the final value.
  onLCP(record("lcp"));
  onFCP(record("fcp"));
  onTTFB(record("ttfb"));
  onCLS(record("cls"));
  onINP(record("inp"));

  let sent = false;
  const flush = (): void => {
    if (sent) {
      return;
    }
    sent = true;
    const ttfb = getFallbackTtfb(measurements);
    if (ttfb) {
      measurements.ttfb = ttfb;
    }
    sendWebVitals(baseUrl, measurements, getUserId(), getPageName());
  };

  // Flush once when the page is hidden/unloaded — after web-vitals has finalized
  // the deferred metrics. Registered after the onX handlers so those run first.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flush();
    }
  });
  window.addEventListener("pagehide", flush);
}
