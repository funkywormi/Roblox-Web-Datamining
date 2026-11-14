import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";

export const NOTIFICATION_STREAM_ERROR_EVENT = "nsError";

type CaptureException = (
  error: Error,
  context: { tags: { feature: string; scope: string } },
) => void;

let captureException: CaptureException = (error, context) => {
  window.Sentry?.captureException(error, context);
};

export const registerNotificationStreamErrorCapture = (capture: CaptureException): void => {
  captureException = capture;
};

// Functional-regression telemetry for the React stream (independent of the IXP scorecard): fire an
// EventStream failure count keyed by scope (for dashboards/alerts) and, when Sentry is present, a
// captured exception (for error aggregation). Best-effort: never throws into the caller.
export const reportNotificationStreamError = (scope: string, error: unknown): void => {
  try {
    sendEventWithTarget(NOTIFICATION_STREAM_ERROR_EVENT, "error", { scope });
  } catch {
    // swallow telemetry failures
  }
  const normalized = error instanceof Error ? error : new Error(String(error));
  captureException(normalized, {
    tags: { feature: "notificationStream", scope },
  });
};

export default reportNotificationStreamError;
