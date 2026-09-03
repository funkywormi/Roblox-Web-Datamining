import { sendEventStreamEvent } from "../sendrNotificationStream/services/NotificationStreamService";

export const NOTIFICATION_STREAM_ERROR_EVENT = "nsError";

// Functional-regression telemetry for the React stream (independent of the IXP scorecard): fire an
// EventStream failure count keyed by scope (for dashboards/alerts) and, when Sentry is present, a
// captured exception (for error aggregation). Best-effort: never throws into the caller.
export const reportNotificationStreamError = (scope: string, error: unknown): void => {
  try {
    sendEventStreamEvent(NOTIFICATION_STREAM_ERROR_EVENT, "error", { scope });
  } catch {
    // swallow telemetry failures
  }
  const normalized = error instanceof Error ? error : new Error(String(error));
  window.Sentry?.captureException(normalized, {
    tags: { feature: "notificationStream", scope },
  });
};

export default reportNotificationStreamError;
