import type { RegistryInput } from "@rbx/observability-framework/schema";
import type { MakeObservabilityTypes } from "@rbx/observability-framework/types";
import { createTrackers } from "@rbx/observability-framework/trackers";
import { createPageLifecycle } from "@rbx/observability-framework/page-lifecycle";
import { createObsErrorBoundary } from "@rbx/observability-framework/react";
import { captureObservabilityException as captureException } from "@rbx/core-scripts/sentry/observability";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";

export const observabilityRegistry = {
  featureName: "FavoritesButton",
  team: "Economy > Marketplace",

  features: {
    health: {
      counters: ["PageLoad", "PageView"],
      criticalErrors: ["ReactCrash"],
    },
  },
} as const satisfies RegistryInput;

type Obs = MakeObservabilityTypes<typeof observabilityRegistry>;
export type CounterName = Obs["CounterName"];
export type CriticalErrorName = Obs["CriticalErrorName"];

export const publishMetric = createFireTelemetryCounter(observabilityRegistry.featureName);

export const { reportPageLoad, reportPageView } = createPageLifecycle(observabilityRegistry, {
  publishCounter: publishMetric,
});

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
