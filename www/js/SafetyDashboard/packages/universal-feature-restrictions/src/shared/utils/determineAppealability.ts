import { NANOSECONDS_PER_SECOND } from "./time";

// 30 minutes, expressed in seconds (30 minutes * 60 seconds).
export const APPEALS_THRESHOLD_SECONDS = 30 * 60;

export interface DetermineAppealabilityParams {
  beginDate: string | undefined;
  endDate: string | undefined;
  acknowledgeable: boolean;
  onAppeal: (() => void) | undefined;
}

export interface AppealsState {
  isAppealable: boolean;
  shouldOpenAppealsPortal: boolean;
}

/**
 * Determines whether a restriction is appealable purely from its duration: it must
 * strictly exceed the 30-minute threshold.
 */
export function isDurationAppealable(durationNs: number): boolean {
  if (durationNs <= 0) {
    return false;
  }

  return durationNs / NANOSECONDS_PER_SECOND > APPEALS_THRESHOLD_SECONDS;
}

/**
 * Determines the appeals state for an override-backed restriction from its duration.
 */
export function determineDurationAppealsState(
  durationNs: number,
  onAppeal: (() => void) | undefined,
): AppealsState {
  const shouldOpenAppealsPortal = isDurationAppealable(durationNs);

  return {
    isAppealable: shouldOpenAppealsPortal || onAppeal !== undefined,
    shouldOpenAppealsPortal,
  };
}

/**
 * Determines whether a restriction is appealable and requires navigation based on its duration.
 *
 * If either date is empty or unparseable, the function falls back to the
 * consumer callback and `acknowledgeable` field — this covers permanent bans
 * and nudges where no meaningful duration exists.
 *
 * Otherwise, navigation is mandatory when the duration (endDate - beginDate)
 * strictly exceeds the 30-minute threshold; shorter restrictions are appealable
 * only when the consumer supplies a callback.
 */
export function determineAppealability({
  beginDate,
  endDate,
  acknowledgeable,
  onAppeal,
}: DetermineAppealabilityParams): AppealsState {
  if (!beginDate || !endDate) {
    return {
      isAppealable: onAppeal !== undefined || acknowledgeable,
      shouldOpenAppealsPortal: acknowledgeable,
    };
  }

  const beginTimestamp = new Date(beginDate).getTime();
  const endTimestamp = new Date(endDate).getTime();

  if (Number.isNaN(beginTimestamp) || Number.isNaN(endTimestamp)) {
    return {
      isAppealable: onAppeal !== undefined || acknowledgeable,
      shouldOpenAppealsPortal: acknowledgeable,
    };
  }

  const durationSeconds = (endTimestamp - beginTimestamp) / 1000;
  const shouldOpenAppealsPortal = durationSeconds > APPEALS_THRESHOLD_SECONDS;

  return {
    isAppealable: shouldOpenAppealsPortal || onAppeal !== undefined,
    shouldOpenAppealsPortal,
  };
}
