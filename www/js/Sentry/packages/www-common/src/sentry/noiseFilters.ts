// Client-side Sentry noise filters shared by the legacy (.NET) sentry SCS and Next.js.
// Anything dropped here never leaves the browser, so it does not count against the
// Sentry Cloud or self-hosted rate limits.

import { serialize, type JsonSerializable } from "@rbx/core-lib/json";
import { defaultUrlOptions } from "@rbx/core-lib/url";

/**
 * Hosts and markers from injected scripts / extensions — not Roblox www code.
 * Used for denyUrls, ignoreErrors, and breadcrumb checks.
 */
const THIRD_PARTY_NOISE_PATTERNS: RegExp[] = [
  /get663\.com/i,
  /\bg663/i, // e.g. g663storage, g663pixel in browser.runtime.sendMessage breadcrumbs
];

/** Script URLs that are never Roblox code (browser extensions, blobs, injected scripts). */
export const NOISE_DENY_URLS: RegExp[] = [
  /extensions\//i,
  /^chrome(-extensions?)?:\/\//i,
  /^moz-extension:\/\//i,
  /^safari(-web)?-extension:\/\//i,
  /^blob:/i,
  ...THIRD_PARTY_NOISE_PATTERNS,
];

/** Error messages that are never actionable. */
export const NOISE_IGNORE_ERRORS: RegExp[] = [
  ...THIRD_PARTY_NOISE_PATTERNS,
  // Exception titles that omit the host but still indicate extension fetch noise.
  /Failed to fetch \(get663\.com\)/i,
  // DuckDuckGo Mobile injects WKScriptMessageHandlerWithReply handlers; when pages navigate away
  // before the reply is sent, WebKit rejects the pending Promise with this error. Not actionable.
  /WKWebView API client did not respond to this postMessage/i,
  // Benign layout warnings; the browser re-delivers the observations next frame.
  /ResizeObserver loop limit exceeded/i,
  /ResizeObserver loop completed with undelivered notifications/i,
  // Cross-origin script errors are redacted by the browser: no message, no stack.
  /^Script error\.?$/i,
  // Promises rejected with nothing carry no information to debug.
  /Non-Error promise rejection captured with value: (undefined|null)$/i,
];

/**
 * Fetch failures as reported by the Sentry SDK, which appends the request host by default
 * (`enhanceFetchErrorMessages: "always"`), e.g. "Failed to fetch (apis.roblox.com)".
 */
const NETWORK_ERROR_PATTERN =
  /^(?:Failed to fetch|Load failed|NetworkError when attempting to fetch resource\.) \(([^)]+)\)$/i;

/**
 * Hosts we own; fetch failures to these are kept so real API failures still report.
 * Reuses the site-wide first-party allowlist (".x" = x and any subdomain, otherwise exact),
 * plus the CDN and sitetest collector hosts it doesn't cover.
 */
const FIRST_PARTY_DOMAINS = [...defaultUrlOptions.domainAllowlist, ".rbxcdn.com", ".simulpong.com"];

function isFirstPartyHost(hostWithPort: string): boolean {
  const host = hostWithPort.replace(/:\d+$/, "").toLowerCase();
  return FIRST_PARTY_DOMAINS.some(domain =>
    domain.startsWith(".") ? host === domain.slice(1) || host.endsWith(domain) : host === domain,
  );
}

type NoiseEvent = {
  message?: string;
  breadcrumbs?: { message?: string; data?: JsonSerializable }[];
  exception?: {
    values?: {
      type?: string;
      value?: string;
      stacktrace?: { frames?: { filename?: string; function?: string }[] };
    }[];
  };
};

function breadcrumbText(event: NoiseEvent): string {
  return (
    event.breadcrumbs
      ?.map(b => {
        const dataText = b.data != null ? serialize(b.data).getOrDefault("") : "";
        return [b.message, dataText].filter(Boolean).join(" ");
      })
      .join(" ") ?? ""
  );
}

/** Fetch failures to hosts we don't own (trackers, ads, extensions) are not actionable. */
function isThirdPartyNetworkError(event: NoiseEvent): boolean {
  const values = event.exception?.values;
  if (values == null || values.length === 0) return false;
  return values.every(v => {
    if (v.type !== "TypeError") return false;
    const host = NETWORK_ERROR_PATTERN.exec(v.value ?? "")?.[1];
    return host != null && !isFirstPartyHost(host);
  });
}

/**
 * Checks that need the full event (not just the message or script URL).
 * Call from `beforeSend` and return null when true.
 */
export function isNoiseEvent(event: NoiseEvent): boolean {
  const text = breadcrumbText(event);
  if (text.length > 0 && THIRD_PARTY_NOISE_PATTERNS.some(pattern => pattern.test(text))) {
    return true;
  }
  return isThirdPartyNetworkError(event);
}

/** Events kept per distinct error; a render-loop bug otherwise sends one per occurrence. */
const MAX_EVENTS_PER_ERROR = 3;
/** Events kept per page load across all errors. */
const MAX_EVENTS_PER_PAGE = 50;

function errorKey(event: NoiseEvent): string {
  const values = event.exception?.values;
  const exception = values?.[values.length - 1];
  if (exception == null) return event.message ?? "";
  // Sentry lists frames oldest first, so the last one is where the error was thrown. Including
  // it keeps the same message from different code as separate errors.
  const frames = exception.stacktrace?.frames;
  const frame = frames?.[frames.length - 1];
  const location = frame == null ? "" : ` @ ${frame.filename ?? ""}:${frame.function ?? ""}`;
  return `${exception.type ?? ""}: ${exception.value ?? ""}${location}`;
}

/**
 * Returns a check that is true once an error repeats past the per-error cap, or once the
 * page has sent its total budget. Counts live for the page (one per Sentry init), so each
 * issue still records the users it affects but not every repeat from the same page.
 * Call from `beforeSend` after the noise checks and return null when true.
 */
export function createRepeatCap(
  maxPerError = MAX_EVENTS_PER_ERROR,
  maxPerPage = MAX_EVENTS_PER_PAGE,
): (event: NoiseEvent) => boolean {
  const counts = new Map<string, number>();
  let total = 0;
  return event => {
    if (total >= maxPerPage) return true;
    const key = errorKey(event);
    const count = counts.get(key) ?? 0;
    if (count >= maxPerError) return true;
    counts.set(key, count + 1);
    total += 1;
    return false;
  };
}
