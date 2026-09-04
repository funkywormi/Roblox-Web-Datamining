import {
  SduiLoadPhase,
  SduiLoadTimerMilestone,
  type CreateSduiLoadTimerOptions,
  type SduiLoadTimer,
  type SduiLoadTimerStatus,
  type SduiRequestStatus,
} from "../types";
import { SduiErrorName } from "../errors/SduiErrors";
import { reportError } from "../errors/SduiLogger";
import { perfMark, perfMeasure, perfNow } from "./userTiming";

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
  let timerStatus: SduiLoadTimerStatus = "NotStarted";
  const { pageContext, errorReporter } = options ?? {};

  function logTimestamp(milestone: SduiLoadTimerMilestone): void {
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

  function start(_source: string): void {
    startTime = perfNow();
    timerStatus = "Running";
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

  function finish(): void {
    if (timerStatus !== "Running" || startTime == null) return;

    timerStatus = "Finished";
    emitPhaseMeasures();
  }

  return {
    start,

    finish,

    logUiRequestQueued() {
      if (timerStatus === "NotStarted") {
        start(SduiLoadTimerMilestone.RequestQueued);
      }
      logTimestamp(SduiLoadTimerMilestone.RequestQueued);
    },

    logUiRequestSent() {
      if (timerStatus === "NotStarted") {
        start(SduiLoadTimerMilestone.RequestSent);
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

    updateRequestStatus(_status: SduiRequestStatus) {
      // Retained for API compatibility with SduiApiStore; not used for User Timing.
    },
  };
}
