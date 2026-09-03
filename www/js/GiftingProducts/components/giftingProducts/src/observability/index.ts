import type { RegistryInput } from "@rbx/observability-framework/schema";
import type { MakeObservabilityTypes } from "@rbx/observability-framework/types";
import { createTrackers } from "@rbx/observability-framework/trackers";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/fire";
import { captureException } from "@rbx/payments/error";

export const observabilityRegistry = {
  featureName: "RobuxGifting",
  team: "Economy > Payments & Fraud",

  features: {
    health: {
      counters: ["PageView"],
      criticalErrors: ["Error_ReactCrash", "NoRoot"],
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

export const { trackCounter, trackError, trackCriticalError } = createTrackers(
  observabilityRegistry,
  { publish: publishMetric, captureException, featureName: observabilityRegistry.featureName },
);
