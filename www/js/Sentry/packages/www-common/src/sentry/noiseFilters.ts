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
  breadcrumbs?: { message?: string; data?: JsonSerializable }[];
  exception?: {
    values?: { type?: string; value?: string }[];
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
