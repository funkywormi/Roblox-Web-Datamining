import { createFireTelemetryCounter } from "@rbx/web-telemetry/fire";
import * as NewChallengeTypes from "@rbx/generic-challenge-types";
import { ChallengeType } from "../generic/interface";
import { HybridTarget } from "./interface";

/**
 * Real-time counters fired from the Challenge Hybrid page via
 * `@rbx/web-telemetry` (engine-telemetry pipeline).
 *
 * Unlike the legacy `roblox-event-tracker.fireEvent` path, counters are not
 * pre-created in a metrics-configuration tool and platform/challenge breakdowns
 * are expressed as typed dimensions rather than baked into the counter name.
 * The feature name below is prepended to each counter at send time, e.g.
 * `ChallengeHybrid_Lifecycle`.
 */
const FEATURE_NAME = "ChallengeHybrid";

const fireTelemetryCounter = createFireTelemetryCounter(FEATURE_NAME);

const DEFAULT_APP_TYPE = "unknown";

/** Counter names (before the `ChallengeHybrid_` feature-name prefix). */
export const COUNTERS = {
  /** Challenge lifecycle counter — one per lifecycle stage that is reached. */
  LIFECYCLE: "Lifecycle",
  /** Success counter — a lifecycle stage was reached successfully. */
  SUCCESS: "Success",
  /** Error counter — a lifecycle stage failed. */
  ERROR: "Error",
  /** Platform counter — fired once per page load, broken down by app type. */
  PLATFORM: "Platform",
} as const;

/** Stable, bounded dimension value for each hybrid lifecycle target. */
const LIFECYCLE_STAGE: Record<HybridTarget, string> = {
  [HybridTarget.CHALLENGE_PAGE_LOADED]: "PageLoaded",
  [HybridTarget.CHALLENGE_PARSED]: "Parsed",
  [HybridTarget.CHALLENGE_INITIALIZED]: "Initialized",
  [HybridTarget.CHALLENGE_DISPLAYED]: "Displayed",
  [HybridTarget.CHALLENGE_COMPLETED]: "Completed",
  [HybridTarget.CHALLENGE_INVALIDATED]: "Invalidated",
};

/**
 * Determine whether a given hybrid lifecycle event represents a success or a
 * failure. Mirrors the lifecycle-success logic used for event-stream logging.
 */
const isLifecycleSuccess = (hybridTarget: HybridTarget, data: Record<string, unknown>): boolean => {
  if (hybridTarget === HybridTarget.CHALLENGE_INVALIDATED) {
    return false;
  }

  for (const key of ["parsed", "initialized", "displayed"]) {
    const value = data?.[key];
    if (typeof value === "boolean") {
      return value;
    }
  }

  return true;
};

export type RecordHybridEventCountersProps = {
  hybridTarget: HybridTarget;
  challengeType: ChallengeType | NewChallengeTypes.ChallengeType;
  data: Record<string, unknown>;
  appType: string;
};

/**
 * Fire the real-time counters for a hybrid lifecycle event. Fire & forget: the
 * telemetry client batches, retries, and never throws, so metrics cannot break
 * the challenge flow.
 *
 * For every lifecycle event we record:
 *  - a challenge lifecycle counter (the stage was reached),
 *  - a success or error counter (the outcome of the stage),
 *  - and, on page load, a platform counter (which platform loaded the page).
 *
 * `stage`, `appType`, and `challengeType` are attached as bounded dimensions so
 * each metric can be sliced by those in Grafana without cardinality blow-up.
 */
export const recordHybridEventCounters = ({
  hybridTarget,
  challengeType,
  data,
  appType,
}: RecordHybridEventCountersProps): void => {
  const stage = LIFECYCLE_STAGE[hybridTarget];
  const appTypeDimension = appType || DEFAULT_APP_TYPE;
  const dimensions = {
    stage,
    appType: appTypeDimension,
    challengeType,
  };

  // Challenge lifecycle counter.
  fireTelemetryCounter(COUNTERS.LIFECYCLE, dimensions);

  // Success / error counter.
  if (isLifecycleSuccess(hybridTarget, data)) {
    fireTelemetryCounter(COUNTERS.SUCCESS, dimensions);
  } else {
    fireTelemetryCounter(COUNTERS.ERROR, dimensions);
  }

  // Platform counter — fired once, on page load.
  if (hybridTarget === HybridTarget.CHALLENGE_PAGE_LOADED) {
    fireTelemetryCounter(COUNTERS.PLATFORM, {
      appType: appTypeDimension,
      challengeType,
    });
  }
};
