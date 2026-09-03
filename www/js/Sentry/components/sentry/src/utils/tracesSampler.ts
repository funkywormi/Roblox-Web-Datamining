import type { BrowserOptions } from "@sentry/browser";

type TracesCtx = Parameters<NonNullable<BrowserOptions["tracesSampler"]>>[0];

const LOCALE_PREFIX_RE = /^\/[a-z]{2}(?:-[a-z]{2})\//i;
const HOME_RE = /^\/home\/?$/i;
const PROFILE_RE = /^\/users\/[^/]+\/profile/i;
const FRIENDS_RE = /^\/users\/[^/]+\/friends/i;
const COMMUNITIES_RE = /^\/communities\/[^/]+\/[^/]+/i;
const MOBILE_APP_UPGRADES_RE = /^\/mobile-app-upgrades\/.*/i;
const UPGRADES_RE = /^\/upgrades\/.*/i;
const LOGIN_REDIRECT_RE = /^\/login-redirect(?:\/[^?]*)?(?:\?.*)?$/i;
const DOWNLOAD_LANDING_RE = /^\/(?:[^/]+\/)?download$/i; // matches /download and /[any locale]/download
const SPOTLIGHT_PAGE_RE = /^\/spotlight\/.*/i;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

// Removes locale prefix from path
export function normalizeLocalePath(raw: string): string {
  return (raw || "").toLowerCase().replace(LOCALE_PREFIX_RE, "/");
}

function createTracesSampleRate(path: string, base: number): number {
  let traceSampleRate;
  if (HOME_RE.test(path)) traceSampleRate = clamp01(base * 0.1); // 90% cut
  if (PROFILE_RE.test(path)) traceSampleRate = clamp01(base * 0.2); // 80% cut
  if (FRIENDS_RE.test(path)) traceSampleRate = clamp01(base * 0.2); // 80% cut
  if (COMMUNITIES_RE.test(path)) traceSampleRate = clamp01(base * 0.2); // 80% cut
  if (MOBILE_APP_UPGRADES_RE.test(path)) traceSampleRate = 0.005; // 10x current
  if (UPGRADES_RE.test(path)) traceSampleRate = 0.005; // 10x current
  if (LOGIN_REDIRECT_RE.test(path)) traceSampleRate = 1; // 100%
  if (DOWNLOAD_LANDING_RE.test(path)) traceSampleRate = 1; // 100%
  if (SPOTLIGHT_PAGE_RE.test(path)) traceSampleRate = 0.1; // 10%
  return traceSampleRate ?? base;
}

// Uses the first 8 hex characters of a trace ID to deterministically
// generate a psuedorandom number, akin to Math.random()
export function sampleRandFromTraceId(traceId: string): number {
  return traceId ? parseInt(traceId.slice(0, 8), 16) / 0x1_0000_0000 : Math.random();
}

// Decide whether an already-sampled transaction should also be sent to Sentry.
// The trace was oversampled to the OTEL rate; downsample deterministically
// using sampleRandFromTraceId to the Sentry target rate.
export function shouldSendTraceToSentry(
  traceId: string,
  path: string,
  otelBase: number,
  sentryBase: number,
  parentSampled?: boolean,
): boolean {
  if (parentSampled) return true;

  const sentryTarget = createTracesSampleRate(path, sentryBase);
  const otelTarget = createTracesSampleRate(path, otelBase);
  return sampleRandFromTraceId(traceId) < sentryTarget / otelTarget;
}

// TODO: adjust rates as needed more details here: https://roblox.atlassian.net/wiki/spaces/UB/pages/3909976268/Sentry+Spans+Noise+Reduction
export function buildTracesSampler(perfBase: number) {
  const base = clamp01(perfBase);

  return function tracesSampler(ctx: TracesCtx): number {
    // Respect incoming distributed tracing decision
    if (ctx.parentSampled !== undefined) return ctx.parentSampled ? 1 : 0;

    // Noise-only cuts; everything else stays at base
    const raw = ctx.name || (typeof window !== "undefined" ? window.location.pathname : "") || "";
    const path = normalizeLocalePath(raw);
    return createTracesSampleRate(path, base);
  };
}
