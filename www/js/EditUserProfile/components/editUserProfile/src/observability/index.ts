import type { RegistryInput } from "@rbx/observability-framework/schema";
import type { MakeObservabilityTypes } from "@rbx/observability-framework/types";
import { createTrackers } from "@rbx/observability-framework/trackers";
import { createPageLifecycle } from "@rbx/observability-framework/page-lifecycle";
import { createObsErrorBoundary } from "@rbx/observability-framework/react";
import { captureException } from "@rbx/payments/error";
import { createWithApiMetricsV2 } from "@rbx/payments/withApiMetrics";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/fire";
import { createFireTelemetryHistogram } from "@rbx/web-telemetry/histogram";

export const observabilityRegistry = {
  featureName: "EditUserProfile",
  team: "User > Connection > Profiles",

  features: {
    profileFrames: {
      counters: [
        { name: "Frames_DialogOpened", dimensions: ["hasPlus"] },
        { name: "Frames_FrameSelected", dimensions: ["hasPlus"] },
        "Frames_FrameSaved",
        "Frames_UpsellClicked",
      ],
      errors: ["Frames_SaveFailed"],
    },
  },
} as const satisfies RegistryInput;

type Obs = MakeObservabilityTypes<typeof observabilityRegistry>;

export type ApiCall = Obs["ApiCall"];
export type FeatureName = Obs["FeatureName"];
export type CounterName = Obs["CounterName"];
export type ErrorName = Obs["ErrorName"];
export type CriticalErrorName = Obs["CriticalErrorName"];
export type DimensionsFor<N extends CounterName> = Obs["DimensionsFor"][N];

export const publishMetric = createFireTelemetryCounter(observabilityRegistry.featureName);

export const { trackCounter, trackError, trackCriticalError } = createTrackers(
  observabilityRegistry,
  { publish: publishMetric, captureException },
);

/**
 * Failure-propagating variant of `withApiEvents`: captures every failure to
 * Sentry and rethrows (success type is `T`, not `T | undefined`). Prefer this
 * for new call sites so errors surface as proper error state instead of a
 * silent `undefined`.
 */
export const withApiEventsV2 = createWithApiMetricsV2<ApiCall>(publishMetric, captureException);

const publishPerformance = createFireTelemetryHistogram(observabilityRegistry.featureName, {});

export const { reportPageLoad, reportPageView } = createPageLifecycle({
  publishCounter: publishMetric,
  publishPerformance,
});

export const ObsErrorBoundary = createObsErrorBoundary({
  publish: publishMetric,
  captureException,
  featureName: observabilityRegistry.featureName,
});
