import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";
import type { SduiWebVitalsObserver, SduiWebVitalsSnapshot } from "@rbx/sdui-core";

const REPORT_ALL_CHANGES = { reportAllChanges: true } as const;

let started = false;
const snapshot: SduiWebVitalsSnapshot = {};
const listeners = new Set<(next: SduiWebVitalsSnapshot) => void>();

function publish(): void {
  const next = { ...snapshot };
  for (const listener of listeners) {
    listener(next);
  }
}

function record(key: keyof SduiWebVitalsSnapshot) {
  return (metric: Metric) => {
    snapshot[key] = metric.value;
    publish();
  };
}

function ensureStarted(): void {
  if (started) return;
  started = true;
  onLCP(record("lcp"), REPORT_ALL_CHANGES);
  onFCP(record("fcp"), REPORT_ALL_CHANGES);
  onTTFB(record("ttfb"), REPORT_ALL_CHANGES);
  onCLS(record("cls"), REPORT_ALL_CHANGES);
  onINP(record("inp"), REPORT_ALL_CHANGES);
}

/**
 * Subscribes to Core Web Vitals with `reportAllChanges` so the SDUI page-load
 * timer can snapshot values at paint+LCP instead of waiting for page hide.
 *
 * One `web-vitals` registration per module instance (per bundle). Later
 * subscribers share that registration and immediately receive the latest
 * snapshot. `stop` only drops that subscriber; observers stay for the page.
 */
export const observeSduiWebVitals: SduiWebVitalsObserver = onChange => {
  listeners.add(onChange);
  ensureStarted();
  if (Object.keys(snapshot).length > 0) {
    onChange({ ...snapshot });
  }
  return () => {
    listeners.delete(onChange);
  };
};
