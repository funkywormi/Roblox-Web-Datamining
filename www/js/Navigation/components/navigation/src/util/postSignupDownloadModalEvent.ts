import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/fire";

export const fireTelemetryCounter = createFireTelemetryCounter("Download");

export const sendSignupDownloadModalEvent = (pageUrl: string): void => {
  sendEventWithTarget(
    "signupDownloadModal",
    "postSignupDownloadModal",
    { shownModal: "SHOWN_MODAL_SUCCESS", url: pageUrl },
    targetTypes.WWW,
  );
  fireTelemetryCounter("PostSignupDownloadModalShown");
};
