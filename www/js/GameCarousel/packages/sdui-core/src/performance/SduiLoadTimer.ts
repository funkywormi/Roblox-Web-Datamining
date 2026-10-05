import {
  buildSduiPageEventDescriptor,
  SDUI_PAGE_LOAD_TIMER_EVENT_NAME,
} from "../analytics/pageAnalyticsDescriptors";
import { SduiErrorName } from "../errors/SduiErrors";
import { reportError } from "../errors/SduiLogger";
import {
  SDUI_PAGE_LOAD_LCP_FALLBACK_DELAY_MS,
  SDUI_PAGE_LOAD_NO_PAINT_FALLBACK_DELAY_MS,
  SduiLoadPhase,
  SduiLoadTimerMilestone,
  type CreateSduiLoadTimerOptions,
  type SduiLoadTimer,
  type SduiLoadTimerStatus,
  type SduiRequestStatus,
  type SduiWebVitalsSnapshot,
} from "../types";
import { buildPageLoadFields, isFirstPageLoad, shouldEmitPageLoad } from "./pageLoadEmit";
import { perfMark, perfMeasure, perfNow } from "./userTiming";

type PaintState = "Waiting" | "Recorded" | "InvalidatedByHidden";

function markName(pageKey: string, milestone: SduiLoadTimerMilestone): string {
  return `sdui_${milestone}[${pageKey}]`;
}

function measureName(pageKey: string, phase: SduiLoadPhase): string {
  return `sdui_${phase}[${pageKey}]`;
}

export function createSduiLoadTimer(
  pageKey: string,
  options?: CreateSduiLoadTimerOptions,
): SduiLoadTimer {
  let startTime: number | undefined;
  let startSource: string | undefined;
  let requestStatus: SduiRequestStatus | undefined;
  let timerStatus: SduiLoadTimerStatus = "NotStarted";
  let hasFinishedLoadPipeline = false;
  let paintState: PaintState = "Waiting";
  let canEmitWithoutLcp = false;
  let hasEmittedPageLoadEvent = false;
  let isDisposed = false;
  const timestamps = new Map<SduiLoadTimerMilestone, number>();
  let webVitals: SduiWebVitalsSnapshot = {};
  let stopObservingWebVitals: (() => void) | undefined;
  let stopObservingPageHidden: (() => void) | undefined;
  const {
    pageContext,
    errorReporter,
    analyticsReporter,
    observeWebVitals,
    pageLoadPlatformAdapter,
  } = options ?? {};
  const lcpFallbackDelayMs = options?.lcpFallbackDelayMs ?? SDUI_PAGE_LOAD_LCP_FALLBACK_DELAY_MS;
  const noPaintFallbackDelayMs =
    options?.noPaintFallbackDelayMs ?? SDUI_PAGE_LOAD_NO_PAINT_FALLBACK_DELAY_MS;
  let cancelLcpWaitTimeout: (() => void) | undefined;
  let cancelNoPaintWaitTimeout: (() => void) | undefined;

  function logTimestamp(milestone: SduiLoadTimerMilestone): void {
    timestamps.set(milestone, perfNow());
    perfMark(markName(pageKey, milestone));
  }

  function measurePhase(
    phase: SduiLoadPhase,
    startMilestone: SduiLoadTimerMilestone,
    endMilestone: SduiLoadTimerMilestone,
  ): void {
    perfMeasure(
      measureName(pageKey, phase),
      markName(pageKey, startMilestone),
      markName(pageKey, endMilestone),
    );
  }

  function emitPhaseMeasures(): void {
    measurePhase(
      SduiLoadPhase.NetworkInflight,
      SduiLoadTimerMilestone.RequestSent,
      SduiLoadTimerMilestone.ResponseReceived,
    );
    measurePhase(
      SduiLoadPhase.ResponseDecode,
      SduiLoadTimerMilestone.ResponseDecodeBegin,
      SduiLoadTimerMilestone.ResponseDecodeEnd,
    );
    measurePhase(
      SduiLoadPhase.DataUpdate,
      SduiLoadTimerMilestone.DataUpdateBegin,
      SduiLoadTimerMilestone.DataUpdateEnd,
    );
    measurePhase(
      SduiLoadPhase.ConfigBuild,
      SduiLoadTimerMilestone.ConfigBuildBegin,
      SduiLoadTimerMilestone.ConfigBuildEnd,
    );
  }

  function clearLcpWaitTimeout(): void {
    cancelLcpWaitTimeout?.();
    cancelLcpWaitTimeout = undefined;
  }

  function clearNoPaintWaitTimeout(): void {
    cancelNoPaintWaitTimeout?.();
    cancelNoPaintWaitTimeout = undefined;
  }

  function stopListeningForPageHidden(): void {
    stopObservingPageHidden?.();
    stopObservingPageHidden = undefined;
  }

  function emitPageLoadEventIfReady(): void {
    if (
      !shouldEmitPageLoad({
        isDisposed,
        hasEmittedPageLoadEvent,
        hasAnalyticsReporter: Boolean(analyticsReporter),
        startSource,
        requestStatus,
        hasFinishedLoadPipeline,
        hasRecordedFirstPaint: paintState === "Recorded",
        lcp: webVitals.lcp,
        canEmitWithoutLcp,
      })
    ) {
      return;
    }

    hasEmittedPageLoadEvent = true;
    clearLcpWaitTimeout();
    clearNoPaintWaitTimeout();
    stopListeningForPageHidden();
    stopObservingWebVitals?.();
    stopObservingWebVitals = undefined;

    analyticsReporter?.logEvent(
      buildSduiPageEventDescriptor(SDUI_PAGE_LOAD_TIMER_EVENT_NAME, pageContext),
      buildPageLoadFields({
        pageKey,
        startSource,
        requestStatus,
        startTime,
        timestamps,
        webVitals,
      }),
    );
  }

  function onPageHidden(): void {
    // Sticky: any hide before a recorded paint permanently drops paint
    // timings (rAF after foreground includes background time).
    if (paintState === "Waiting") {
      paintState = "InvalidatedByHidden";
    }
    canEmitWithoutLcp = true;
    emitPageLoadEventIfReady();
  }

  function listenForPageHidden(): void {
    if (!pageLoadPlatformAdapter || !isFirstPageLoad(startSource)) return;
    stopObservingPageHidden = pageLoadPlatformAdapter.observePageHidden(onPageHidden);
  }

  function scheduleEmitTimeout(delayMs: number): (() => void) | undefined {
    if (!pageLoadPlatformAdapter || !isFirstPageLoad(startSource)) return undefined;
    const emitWithoutWaiting = (): void => {
      canEmitWithoutLcp = true;
      emitPageLoadEventIfReady();
    };
    return pageLoadPlatformAdapter.scheduleFallback(emitWithoutWaiting, delayMs);
  }

  /** Paint-relative: wait for LCP after first SDUI paint. */
  function scheduleEmitWithoutLcp(): void {
    if (cancelLcpWaitTimeout != null) return;
    cancelLcpWaitTimeout = scheduleEmitTimeout(lcpFallbackDelayMs);
  }

  /** Finish-relative: emit when no paint ever arrives (empty / background). */
  function scheduleEmitWithoutPaint(): void {
    if (cancelNoPaintWaitTimeout != null || paintState === "Recorded") return;
    cancelNoPaintWaitTimeout = scheduleEmitTimeout(noPaintFallbackDelayMs);
  }

  function start(source: string): void {
    if (timerStatus !== "NotStarted") return;
    startTime = perfNow();
    startSource = source;
    timerStatus = "Running";
    if (isFirstPageLoad(source)) {
      if (pageLoadPlatformAdapter?.isPageHidden() === true) {
        // A later rAF would include background time, so this pageview can no
        // longer produce a trustworthy first-paint timestamp.
        paintState = "InvalidatedByHidden";
      }
      listenForPageHidden();
      if (observeWebVitals) {
        stopObservingWebVitals = observeWebVitals(snapshot => {
          webVitals = { ...webVitals, ...snapshot };
          emitPageLoadEventIfReady();
        });
      }
    }
  }

  function finish(): void {
    if (timerStatus !== "Running" || startTime == null) return;

    timerStatus = "Finished";
    hasFinishedLoadPipeline = true;
    logTimestamp(SduiLoadTimerMilestone.LoadPipelineFinished);
    emitPhaseMeasures();
    // Separate no-paint backstop — does not move the paint-relative LCP wait.
    scheduleEmitWithoutPaint();
    emitPageLoadEventIfReady();
  }

  function dispose(): void {
    isDisposed = true;
    clearLcpWaitTimeout();
    clearNoPaintWaitTimeout();
    stopListeningForPageHidden();
    stopObservingWebVitals?.();
    stopObservingWebVitals = undefined;
  }

  return {
    start,

    finish,

    dispose,

    logUiRequestQueued() {
      if (timerStatus === "NotStarted") {
        start("initial");
      }
      logTimestamp(SduiLoadTimerMilestone.RequestQueued);
    },

    logUiRequestSent() {
      if (timerStatus === "NotStarted") {
        start("initial");
      }
      logTimestamp(SduiLoadTimerMilestone.RequestSent);
    },

    logUiResponseReceived() {
      logTimestamp(SduiLoadTimerMilestone.ResponseReceived);
    },

    logResponseDecodeBegin() {
      logTimestamp(SduiLoadTimerMilestone.ResponseDecodeBegin);
    },

    logResponseDecodeEnd() {
      logTimestamp(SduiLoadTimerMilestone.ResponseDecodeEnd);
    },

    logResponseDataStoreUpdateBegin() {
      logTimestamp(SduiLoadTimerMilestone.DataUpdateBegin);
    },

    logResponseDataStoreUpdateEnd() {
      logTimestamp(SduiLoadTimerMilestone.DataUpdateEnd);
    },

    logConfigBuildBegin() {
      logTimestamp(SduiLoadTimerMilestone.ConfigBuildBegin);
    },

    logConfigBuildEnd() {
      logTimestamp(SduiLoadTimerMilestone.ConfigBuildEnd);
    },

    logComponentMounted() {
      logTimestamp(SduiLoadTimerMilestone.ComponentMounted);
    },

    logComponentPainted() {
      if (paintState !== "Waiting") return;
      paintState = "Recorded";
      clearNoPaintWaitTimeout();
      logTimestamp(SduiLoadTimerMilestone.ComponentPainted);
      scheduleEmitWithoutLcp();
      emitPageLoadEventIfReady();
    },

    logRefreshComplete() {
      logTimestamp(SduiLoadTimerMilestone.RefreshComplete);
      if (timerStatus === "Running") {
        finish();
        return;
      }
      // Should not happen in normal operation: a refresh-complete on a timer
      // that never started (or already finished) means the timing data is
      // dropped.
      reportError(
        SduiErrorName.LoadTimerNotRunningOnRefreshComplete,
        `logRefreshComplete called for ${pageKey} while timer status is "${timerStatus}"; timing data not reported`,
        pageContext,
        { name: pageKey },
        errorReporter,
      );
    },

    updateRequestStatus(status: SduiRequestStatus) {
      requestStatus = status;
    },

    setWebVitals(snapshot: SduiWebVitalsSnapshot) {
      webVitals = { ...webVitals, ...snapshot };
      emitPageLoadEventIfReady();
    },
  };
}
