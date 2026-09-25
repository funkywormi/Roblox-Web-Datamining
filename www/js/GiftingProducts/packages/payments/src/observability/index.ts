import type { RegistryInput } from "@rbx/observability-framework/schema";
import type { MakeObservabilityTypes } from "@rbx/observability-framework/types";
import { createTrackers } from "@rbx/observability-framework/trackers";
import { createObsErrorBoundary } from "@rbx/observability-framework/react";
import { captureException } from "@rbx/payments/error";
import { createWithApiMetricsV2 } from "@rbx/payments/withApiMetrics";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/fire";

export const observabilityRegistry = {
  featureName: "PaymentsPackage",
  team: "Economy > Payments & Fraud",

  features: {
    PriceTag: {
      counters: [{ name: "PriceTag_ArabicLocaleTriggered" }],
      criticalErrors: [
        { name: "PriceTag_NumberFormatLocaleException" },
        { name: "PriceTag_DataNotValid", dimensions: ["currencyCode"] },
      ],
    },
    RobuxBalance: {
      counters: [{ name: "RobuxBalance_UpdatedOnRefetch" }],
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

export const ObsErrorBoundary = createObsErrorBoundary({
  publish: publishMetric,
  captureException,
  featureName: observabilityRegistry.featureName,
});
