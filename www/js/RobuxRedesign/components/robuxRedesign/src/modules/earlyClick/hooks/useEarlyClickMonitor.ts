import { useEffect } from "react";
import { document, window } from "@rbx/core-lib/browser";
import { isNextJs } from "../../../utils/isNextJs";
import { EARLY_CLICK_EVENT } from "../utils/capture";
import {
  reportDiscardedEarlyClicks,
  reportEarlyClickHeld,
  reportEarlyClickOutcome,
  reportExpiredEarlyClicks,
  type TrackEarlyClick,
} from "../utils/reporting";

/**
 * Page-level reporting for held taps that no row resolves: `held` as soon as React sees a tap
 * (at mount, or when the script catches one later), `expired` when the script gives up,
 * `dropped` or `replaced` when the script discards a tap because the user moved on, and
 * `abandoned` when the page is hidden while a tap is still held. A tap that leaves before this
 * mounts is reported by the inline script instead; the shared flags keep that from being sent
 * twice. A leave with no tap, before this mounts, is reported by the script as `noTap`. Mount once,
 * above the rows.
 */
export const useEarlyClickMonitor = (trackEarlyClick: TrackEarlyClick) => {
  useEffect(() => {
    // Nothing holds a tap on the .NET page, so there is nothing to listen for.
    if (!isNextJs() || !window || !document) {
      return undefined;
    }
    const currentWindow = window;
    const currentDocument = document;

    // The inline script treats a later leave as React's, including a leave with no tap.
    currentWindow.robuxEarlyClickReactReady = true;
    const reportPending = () => {
      const state = currentWindow.robuxEarlyClick;
      if (state) {
        reportEarlyClickHeld(trackEarlyClick, state);
      }
      reportExpiredEarlyClicks(trackEarlyClick);
      reportDiscardedEarlyClicks(trackEarlyClick);
    };
    const reportAbandoned = () => {
      const state = currentWindow.robuxEarlyClick;
      if (currentDocument.visibilityState === "hidden" && state) {
        reportEarlyClickOutcome(trackEarlyClick, "abandoned", state);
      }
    };

    reportPending();
    currentWindow.addEventListener(EARLY_CLICK_EVENT, reportPending);
    // Capture on window runs before the telemetry batcher's document listener, which sends what is
    // queued with a beacon when the page is hidden; listening later would leave this report behind.
    currentWindow.addEventListener("visibilitychange", reportAbandoned, true);
    return () => {
      currentWindow.removeEventListener(EARLY_CLICK_EVENT, reportPending);
      currentWindow.removeEventListener("visibilitychange", reportAbandoned, true);
    };
  }, [trackEarlyClick]);
};
