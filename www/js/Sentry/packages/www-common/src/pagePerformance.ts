import {
  createFireTelemetryHistogram,
  flushTelemetryHistograms,
} from "@rbx/web-telemetry/v2/histogram";
import { getDeviceClient } from "./device/getDeviceClient";
import type { WebVitalMeasurements } from "./webVitals";

const publishHistogram = createFireTelemetryHistogram("WWW_PageTelemetry", {});

/** Share of page loads that publish PagePerf histograms when a page has no override. */
export const DEFAULT_PAGE_PERFORMANCE_SAMPLE_RATE = 0.05;

/**
 * Per-page overrides keyed by internal page name, from 0 (off) to 1 (every
 * load). Lower these for high-traffic pages so they don't overwhelm the
 * telemetry backend.
 */
export const PAGE_PERFORMANCE_SAMPLE_RATES: Readonly<Record<string, number>> = {};

export const UNKNOWN_PAGE_NAME = "Unknown";

// Metric names only allow [A-Za-z0-9_]; anything else would drop the observation.
const INVALID_METRIC_NAME_CHARS = /[^A-Za-z0-9_]/g;

// Measurement key -> histogram name segment. Times are in ms; CLS is unitless.
const PERF_METRICS = {
  ttfb: "TTFB",
  fcp: "FCP",
  lcp: "LCP",
  inp: "INP",
  cls: "CLS",
} as const;

export function getPagePerformanceSampleRate(pageName: string): number {
  return PAGE_PERFORMANCE_SAMPLE_RATES[pageName] ?? DEFAULT_PAGE_PERFORMANCE_SAMPLE_RATE;
}

/**
 * Publishes one page load's web vitals as `WWW_PageTelemetry_PagePerf_<Vital>_<Page>`
 * histograms, for a sampled share of loads. The page is part of the metric name
 * rather than a label because the telemetry backend keeps only the top 10 values
 * of each label and folds the rest into `__ALL_OTHERS__`. `appType` and `browser`
 * stay as labels because each has fewer than 10 values.
 * Sends immediately because this runs from the page-hide flush.
 */
export function publishPagePerformance(
  measurements: WebVitalMeasurements,
  pageName: string | undefined,
): void {
  if (!measurements) {
    return;
  }
  // An empty data-internal-page-name attribute reads as "", not undefined.
  const internalPageName = pageName === undefined || pageName === "" ? UNKNOWN_PAGE_NAME : pageName;
  if (Math.random() >= getPagePerformanceSampleRate(internalPageName)) {
    return;
  }

  const pageSegment = internalPageName.replace(INVALID_METRIC_NAME_CHARS, "_");
  const { appType, browser } = getDeviceClient();
  const attributes = { appType, browser };
  let published = false;
  for (const [key, suffix] of Object.entries(PERF_METRICS)) {
    const value = measurements[key]?.value;
    if (typeof value === "number") {
      publishHistogram(`PagePerf_${suffix}_${pageSegment}`, attributes, value);
      published = true;
    }
  }
  if (published) {
    flushTelemetryHistograms();
  }
}
