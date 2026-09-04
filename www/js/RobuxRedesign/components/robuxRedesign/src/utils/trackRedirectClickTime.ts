import { trackCounter } from "../observability";

const MINUTE_MS = 60 * 1000;

const REDIRECT_CLICK_TIME_BUCKETS = [
  { maxMs: 2 * MINUTE_MS, label: "0-2" },
  { maxMs: 4 * MINUTE_MS, label: "2-4" },
  { maxMs: 6 * MINUTE_MS, label: "4-6" },
  { maxMs: 8 * MINUTE_MS, label: "6-8" },
  { maxMs: 10 * MINUTE_MS, label: "8-10" },
] as const;

export type RedirectClickTimeBucket = (typeof REDIRECT_CLICK_TIME_BUCKETS)[number]["label"] | "10+";

export function getRedirectClickTimeBucket(timeSincePageLoadMs: number): RedirectClickTimeBucket {
  const bucket = REDIRECT_CLICK_TIME_BUCKETS.find(({ maxMs }) => timeSincePageLoadMs <= maxMs);
  return bucket?.label ?? "10+";
}

export function trackRedirectClickTime(): void {
  try {
    trackCounter("RedirectClickTime", {
      bucket: getRedirectClickTimeBucket(performance.now()),
    });
  } catch {
    // Timing is best-effort and must not interrupt the purchase redirect.
  }
}
