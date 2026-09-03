import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import { getTrafficSource } from "./captureTrafficSource";
import { SafetyDashboardEventType } from "./eventTypes";

/**
 * Separated from the call sites so tests can mock at this boundary. `source` is
 * attached to every event; the `status`/`worstIntervention` columns are promoted to
 * first-class columns and attached only when provided, so events can be sliced by the
 * user's standing without parsing `meta`. Sections that don't read account standing
 * (e.g. a violation row) simply omit them rather than depending on standing. The
 * event-specific long tail goes in `meta`.
 */
export const sendSafetyDashboardEvent = (
  eventType: SafetyDashboardEventType,
  meta: Record<string, unknown> = {},
  status?: string,
  worstIntervention?: string,
): void => {
  sendEventWithTarget(
    "safetyDashboardEvent",
    "AccountStatusPage",
    {
      eventType,
      ...(status !== undefined && { status }),
      ...(worstIntervention !== undefined && { worstIntervention }),
      source: getTrafficSource(),
      meta: JSON.stringify(meta),
    },
    targetTypes.WWW,
  );
};
