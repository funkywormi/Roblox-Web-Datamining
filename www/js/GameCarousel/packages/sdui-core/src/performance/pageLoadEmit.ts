import {
  SduiLoadTimerMilestone,
  type SduiRequestStatus,
  type SduiWebVitalsSnapshot,
} from "../types";

export function isFirstPageLoad(startSource: string | undefined): boolean {
  return startSource === "initial" || startSource === "seed";
}

export interface PageLoadEmitGate {
  isDisposed: boolean;
  hasEmittedPageLoadEvent: boolean;
  hasAnalyticsReporter: boolean;
  startSource: string | undefined;
  requestStatus: SduiRequestStatus | undefined;
  hasFinishedLoadPipeline: boolean;
  hasRecordedFirstPaint: boolean;
  lcp: number | undefined;
  canEmitWithoutLcp: boolean;
}

export function shouldEmitPageLoad(gate: PageLoadEmitGate): boolean {
  if (gate.isDisposed || gate.hasEmittedPageLoadEvent || !gate.hasAnalyticsReporter) return false;
  if (!isFirstPageLoad(gate.startSource)) return false;
  if (gate.requestStatus === "FailedToLoad") return gate.hasFinishedLoadPipeline;
  // Paint is preferred, but background tabs / empty successful loads may never
  // paint. `canEmitWithoutLcp` (pagehide, post-paint LCP fallback, or
  // post-finish no-paint backstop) closes the gate so listeners are released
  // and a row is still emitted.
  return (
    gate.hasFinishedLoadPipeline &&
    (gate.hasRecordedFirstPaint || gate.canEmitWithoutLcp) &&
    (gate.lcp != null || gate.canEmitWithoutLcp)
  );
}

function durationBetween(
  timestamps: Map<SduiLoadTimerMilestone, number>,
  startMilestone: SduiLoadTimerMilestone,
  endMilestone: SduiLoadTimerMilestone,
): number | undefined {
  const start = timestamps.get(startMilestone);
  const end = timestamps.get(endMilestone);
  if (start == null || end == null) return undefined;
  return end - start;
}

function latestTimestamp(
  first: number | undefined,
  second: number | undefined,
): number | undefined {
  if (first == null) return second;
  if (second == null) return first;
  return Math.max(first, second);
}

function isNavigationTiming(entry: PerformanceEntry): entry is PerformanceNavigationTiming {
  return entry.entryType === "navigation";
}

/**
 * Navigation-timing TTFB when web-vitals has not reported yet.
 * Unlike `getFallbackTtfb` in `@rbx/www-common/webVitals`, this does not
 * suppress TTFB-only snapshots: a page-load row is still a load-timer event.
 */
export function backfillTtfb(snapshot: SduiWebVitalsSnapshot): SduiWebVitalsSnapshot {
  if (snapshot.ttfb != null || typeof performance === "undefined") {
    return snapshot;
  }
  if (typeof performance.getEntriesByType !== "function") {
    return snapshot;
  }
  const nav = performance.getEntriesByType("navigation").find(isNavigationTiming);
  if (!nav || !(nav.responseStart > 0)) {
    return snapshot;
  }
  const activationStart =
    "activationStart" in nav && typeof nav.activationStart === "number" ? nav.activationStart : 0;
  return { ...snapshot, ttfb: Math.max(nav.responseStart - activationStart, 0) };
}

export interface PageLoadFieldInput {
  pageKey: string;
  startSource: string | undefined;
  requestStatus: SduiRequestStatus | undefined;
  startTime: number | undefined;
  timestamps: Map<SduiLoadTimerMilestone, number>;
  webVitals: SduiWebVitalsSnapshot;
}

export function buildPageLoadFields(input: PageLoadFieldInput): Record<string, string | number> {
  const snapshot = backfillTtfb(input.webVitals);
  const fields: Record<string, string | number> = {
    pageKey: input.pageKey,
    startSource: input.startSource ?? "unknown",
  };
  if (input.requestStatus) {
    fields.requestStatus = input.requestStatus;
  }
  const setFinite = (key: string, value: number | undefined): void => {
    if (value != null && Number.isFinite(value)) {
      fields[key] = value;
    }
  };
  const pipelineFinishedAt = input.timestamps.get(SduiLoadTimerMilestone.LoadPipelineFinished);
  const paintedAt = input.timestamps.get(SduiLoadTimerMilestone.ComponentPainted);
  const successfulLoadCompletedAt = latestTimestamp(pipelineFinishedAt, paintedAt);
  const loadCompletedAt =
    input.requestStatus === "FailedToLoad" ? pipelineFinishedAt : successfulLoadCompletedAt;
  setFinite(
    "totalDurationMs",
    input.startTime == null || loadCompletedAt == null
      ? undefined
      : loadCompletedAt - input.startTime,
  );
  setFinite(
    "uiRequestDurationMs",
    durationBetween(
      input.timestamps,
      SduiLoadTimerMilestone.RequestQueued,
      SduiLoadTimerMilestone.ResponseReceived,
    ),
  );
  setFinite(
    "responseDecodeDurationMs",
    durationBetween(
      input.timestamps,
      SduiLoadTimerMilestone.ResponseDecodeBegin,
      SduiLoadTimerMilestone.ResponseDecodeEnd,
    ),
  );
  setFinite(
    "sduiTreeBuildDurationMs",
    durationBetween(
      input.timestamps,
      SduiLoadTimerMilestone.ConfigBuildBegin,
      SduiLoadTimerMilestone.ConfigBuildEnd,
    ),
  );
  setFinite(
    "dataUpdateDurationMs",
    durationBetween(
      input.timestamps,
      SduiLoadTimerMilestone.DataUpdateBegin,
      SduiLoadTimerMilestone.DataUpdateEnd,
    ),
  );
  setFinite(
    "timeToFirstSduiPaintMs",
    input.startTime == null || paintedAt == null ? undefined : paintedAt - input.startTime,
  );
  setFinite("lcp", snapshot.lcp);
  setFinite("fcp", snapshot.fcp);
  setFinite("ttfb", snapshot.ttfb);
  setFinite("cls", snapshot.cls);
  setFinite("inp", snapshot.inp);
  return fields;
}
