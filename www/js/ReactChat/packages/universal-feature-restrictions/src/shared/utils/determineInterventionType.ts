import { INTERVENTION_UFR_NUDGE, INTERVENTION_UFR_TIMEOUT } from "../../telemetry/eventConstants";
import type { InterventionType } from "../../types/api";

/**
 * Determines the UFR intervention type from the moderation detail API response and
 * derives the analytics intervention type from it. This is the single source of truth
 * for categorizing a restriction; both the displayed content and the analytics
 * intervention type are returned together.
 *
 * 1. If the description contains "nudge" (case-insensitive) → Nudge
 * 2. Else if the duration is a positive finite number → Suspended
 * 3. Else → Banned
 *
 * Both suspensions and bans are reported as timeouts for analytics.
 */
export const determineInterventionType = ({
  punishmentTypeDescription,
  durationNs,
}: {
  punishmentTypeDescription?: string;
  durationNs: number;
}): { interventionType: InterventionType; interventionTypeForAnalytics: string } => {
  let interventionType: InterventionType;

  if (punishmentTypeDescription?.toLowerCase().includes("nudge")) {
    interventionType = "Nudge";
  } else if (Number.isFinite(durationNs) && durationNs > 0) {
    interventionType = "Suspended";
  } else {
    interventionType = "Banned";
  }

  const interventionTypeForAnalytics =
    interventionType === "Nudge" ? INTERVENTION_UFR_NUDGE : INTERVENTION_UFR_TIMEOUT;

  return { interventionType, interventionTypeForAnalytics };
};
