import type { RegistryInput } from "@rbx/observability-framework/schema";
import type { MakeObservabilityTypes } from "@rbx/observability-framework/types";
import { createTrackers } from "@rbx/observability-framework/trackers";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";

/**
 * `featureName` is the counter series prefix. Do not rename it after dashboards exist.
 */
export const observabilityRegistry = {
  featureName: "WwwCommon",
  team: "Economy > Payments & Fraud",

  features: {
    i18n: {
      errors: [
        {
          name: "TranslationKeyNotFound",
          dimensions: ["namespace", "key", "internalPageName"],
        },
        {
          name: "TranslationMalformed",
          dimensions: ["namespace", "key", "internalPageName"],
        },
      ],
    },
  },
} as const satisfies RegistryInput;

type Obs = MakeObservabilityTypes<typeof observabilityRegistry>;

export type CounterName = Obs["CounterName"];
export type ErrorName = Obs["ErrorName"];
export type CriticalErrorName = Obs["CriticalErrorName"];

export const publishMetric = createFireTelemetryCounter(observabilityRegistry.featureName);

export const { trackCounter, trackError, trackCriticalError } = createTrackers(
  observabilityRegistry,
  { publish: publishMetric },
);
