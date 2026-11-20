// Probe outcomes, reported through web-telemetry v2 as `WasmDeviceProbe_<Name>` metrics. See the
// WEB-3600 tech spec's Telemetry section. Labels are low-cardinality: `browser` is the family only,
// and no scores are sent.
import {
  type Attributes,
  createFireTelemetryCounter,
  type FireTelemetryCounterFn,
} from "@rbx/web-telemetry/v2/fire";
import {
  createFireTelemetryHistogram,
  type FireTelemetryHistogramFn,
  flushTelemetryHistograms,
} from "@rbx/web-telemetry/v2/histogram";
import { document } from "@rbx/core-lib/browser";
import type { ProbeFailureReason } from "./cache";
import type { RequiredSpecRule } from "./requiredSpec";

/**
 * Why the probe couldn't finish: it posted an error, failed to load or couldn't start (`error`),
 * posted nothing in time (`timeout`), an earlier run never settled (`crashed`), the tab was hidden
 * (`hidden`), or it measured while the tab was hidden, so its CPU scores are throttled
 * (`throttled`).
 */
export type DeviceProbeFailureReason = ProbeFailureReason | "hidden" | "throttled";

export type DeviceProbeStartedEvent = {
  /** From `browserCacheKey()`, such as `Chrome/141`. Only the family is sent. */
  browser: string;
};

export type DeviceProbeFailedEvent = {
  reason: DeviceProbeFailureReason;
  /** From the run's start; `null` when no run started here or it's an earlier run (`crashed`). */
  durationMs: number | null;
  browser: string;
  /** `null` when the probe didn't post scores. */
  isolated: boolean | null;
};

export type DeviceProbeCompletedEvent = {
  durationMs: number;
  browser: string;
  isolated: boolean;
  /** The required-spec rules the scores failed; empty when the device meets the spec. */
  failedRules: RequiredSpecRule[];
};

export type DeviceProbeSkippedEvent = {
  /** The reason of the failure entry that's backing off. */
  reason: ProbeFailureReason;
  browser: string;
};

const FEATURE_NAME = "WasmDeviceProbe";

let counter: FireTelemetryCounterFn | null = null;
let histogram: FireTelemetryHistogramFn | null = null;

// Each metric is created on the first report that uses it, not on import: each one adds page
// listeners. Counters aren't batched: the library has no public counter flush, so a report made as
// the page goes away (a run the tab hid) would otherwise wait on the batch timer. Runs are rare,
// so a request each is fine.
const count = (name: string, attributes: Attributes): void => {
  counter ??= createFireTelemetryCounter(FEATURE_NAME, { batchSize: 1 });
  counter(name, attributes);
};

// Flushed at once while the page is hidden: the histogram's own flush on hide may already have
// run, and its timer won't fire once the page unloads.
const record = (name: string, attributes: Attributes, value: number): void => {
  histogram ??= createFireTelemetryHistogram(FEATURE_NAME, {});
  histogram(name, attributes, value);
  if (document?.visibilityState === "hidden") {
    flushTelemetryHistograms();
  }
};

// `feature:jspi` → `SpecNotMet_feature_jspi`. The rule is in the name, not a label: the backend
// keeps only the top 10 values of a label, and there are more rules than that.
const specNotMetName = (rule: string): string =>
  `SpecNotMet_${rule.replace(/[^A-Za-z0-9_]/g, "_")}`;

// `Chrome/141` → `Chrome`: the major version would multiply every series.
const browserFamily = (browser: string): string => browser.split("/", 1)[0] ?? browser;

// `isolated` is left out when it isn't known, rather than given a third value.
const labels = (browser: string, isolated: boolean | null): Attributes =>
  isolated == null
    ? { browser: browserFamily(browser) }
    : { browser: browserFamily(browser), isolated };

/** Each event fires once per probe run, except `probeSkipped`: once per call a failure answers. */
export const deviceProbeTelemetry = {
  /** A run wrote its crash marker and is about to mount the iframe. */
  probeStarted: ({ browser }: DeviceProbeStartedEvent): void => {
    count("ProbeStarted", labels(browser, null));
  },
  probeFailed: ({ reason, durationMs, browser, isolated }: DeviceProbeFailedEvent): void => {
    count("ProbeFailed", { reason, ...labels(browser, isolated) });
    if (durationMs != null) {
      record("ProbeFailedDurationMs", { reason }, durationMs);
    }
  },
  /** The probe finished, whether or not the device meets the required spec. */
  probeCompleted: ({ durationMs, browser, isolated, failedRules }: DeviceProbeCompletedEvent) => {
    const common = labels(browser, isolated);
    count("ProbeCompleted", { meets: failedRules.length === 0, ...common });
    record("ProbeDurationMs", { isolated }, durationMs);
    for (const rule of failedRules) {
      count(specNotMetName(rule), common);
    }
  },
  /** A recent failure on this device answered a `meetsRequiredSpec()` call no without probing. */
  probeSkipped: ({ reason, browser }: DeviceProbeSkippedEvent): void => {
    count("ProbeSkipped", { reason, browser: browserFamily(browser) });
  },
};

export type DeviceProbeTelemetry = typeof deviceProbeTelemetry;
