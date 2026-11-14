import type { RegistryInput } from "@rbx/observability-framework/schema";
import type { MakeObservabilityTypes } from "@rbx/observability-framework/types";
import { createTrackers } from "@rbx/observability-framework/trackers";
import { createPageLifecycle } from "@rbx/observability-framework/page-lifecycle";
import { createObsErrorBoundary } from "@rbx/observability-framework/react";
import { captureObservabilityException as captureException } from "@rbx/core-scripts/sentry/observability";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";

export const observabilityRegistry = {
  featureName: "RobuxGifting",
  team: "Economy > Payments & Fraud",
  internalPageName: "GiftingProducts",

  features: {
    health: {
      counters: ["PageLoad", "PageView"],
      criticalErrors: ["ReactCrash", "NoRoot"],
    },
  },
} as const satisfies RegistryInput;

type Obs = MakeObservabilityTypes<typeof observabilityRegistry>;

export type FeatureName = Obs["FeatureName"];
export type CounterName = Obs["CounterName"];
export type ErrorName = Obs["ErrorName"];
export type CriticalErrorName = Obs["CriticalErrorName"];
export type DimensionsFor<N extends CounterName | CriticalErrorName> = Obs["DimensionsFor"][N];

export const publishMetric = createFireTelemetryCounter(observabilityRegistry.featureName);

export const { reportPageLoad, reportPageView, reportNoRoot } = createPageLifecycle(
  observabilityRegistry,
  { publishCounter: publishMetric },
);

export const ObsErrorBoundary = createObsErrorBoundary(observabilityRegistry, {
  publish: publishMetric,
  captureException,
  featureName: observabilityRegistry.featureName,
});

export const { trackCriticalError } = createTrackers(observabilityRegistry, {
  publish: publishMetric,
  captureException,
  featureName: observabilityRegistry.featureName,
});
