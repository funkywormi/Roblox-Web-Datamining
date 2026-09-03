import type { AccountStandingFeature, AccountStandingIntervention } from "../../types/api";

/**
 * A feature whose `intervention` is present (it carries an active or expired restriction).
 */
export type RestrictedFeature = AccountStandingFeature & {
  intervention: AccountStandingIntervention;
};

const NANOSECONDS_PER_MILLISECOND = 1_000_000;
const NANOSECONDS_PER_DAY = 86_400_000_000_000;

/**
 *  Rounds a nanosecond suspension duration up to whole days, with a 1-day floor.
 */
export const interventionDurationDays = (durationNs = 0): number =>
  Math.max(1, Math.ceil(durationNs / NANOSECONDS_PER_DAY));

/**
 * Derives an ISO end date from an intervention's RFC3339 start time and its nanosecond duration.
 * Returns undefined when the intervention has no duration or an unparseable start time.
 */
export const interventionEndDate = (
  intervention: AccountStandingIntervention,
): string | undefined => {
  if (intervention.duration === undefined) {
    return undefined;
  }

  const startMs = new Date(intervention.startTime).getTime();
  if (Number.isNaN(startMs)) {
    return undefined;
  }

  return new Date(startMs + intervention.duration / NANOSECONDS_PER_MILLISECOND).toISOString();
};

/**
 * Reports whether an intervention has already elapsed. Interventions without an end date
 * (e.g. a Warning, which has no duration) never expire and are always considered active.
 * This lets callers decide layout up front and stay consistent with what a row ultimately
 * renders, rather than discovering expiry only when the row mounts.
 */
export const isInterventionExpired = (intervention: AccountStandingIntervention): boolean => {
  const endDate = interventionEndDate(intervention);
  if (endDate === undefined) {
    return false;
  }

  return new Date(endDate).getTime() <= Date.now();
};

/**
 * Selects the features that are currently restricted: they have an intervention that hasn't yet
 * expired. This is the single source of truth for "active feature restrictions", shared by the
 * timeouts list (which feature rows to render) and the page-view telemetry (how many a user had
 * at the time), so the two never drift apart.
 */
export const activeRestrictedFeatures = (features: AccountStandingFeature[]): RestrictedFeature[] =>
  features.filter((feature): feature is RestrictedFeature => {
    if (!feature.intervention) {
      return false;
    }

    return !isInterventionExpired(feature.intervention);
  });
