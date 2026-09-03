import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import { getTrafficSource } from "./captureTrafficSource";
import { AppealsEventType } from "./eventTypes";

export const SAFETY_DASHBOARD_ENTRY_TAG = "safetyDashboard";

/**
 * The Violations page and Violation Details page both currently emit events to the old, separate
 * appeals portal data lake. We use a separate event wrapper to make it easier to identify where
 * each event is going.
 */
export const sendAppealsEvent = (
  eventName: AppealsEventType,
  context: string,
  additionalProperties: Record<string, unknown>,
): void => {
  sendEventWithTarget(
    eventName,
    context,
    {
      // To keep the table structure simple and consistent, we'll dump the additional properties into a single JSON field.
      meta: JSON.stringify({
        ...additionalProperties,
        source: getTrafficSource(),
        entryPoint: SAFETY_DASHBOARD_ENTRY_TAG,
      }),
    },
    targetTypes.WWW,
  );
};
