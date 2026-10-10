import type { RegistryInput } from "@rbx/observability-framework/schema";
import type { MakeObservabilityTypes } from "@rbx/observability-framework/types";
import { createTrackers } from "@rbx/observability-framework/trackers";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";

export const observabilityRegistry = {
  featureName: "Subscriptions",
  team: "Economy > Payments & Fraud > Subscriptions",

  features: {
    listSubscriptions: {
      counters: [
        { name: "ListSubscriptionsV2Called", dimensions: ["productType"] },
        { name: "ListSubscriptionsV2Succeeded", dimensions: ["productType"] },
        { name: "ListSubscriptionsV2Failed", dimensions: ["productType"] },
      ],
    },
  },
} as const satisfies RegistryInput;

type Obs = MakeObservabilityTypes<typeof observabilityRegistry>;

export type CounterName = Obs["CounterName"];
export type DimensionsFor<N extends CounterName> = Obs["DimensionsFor"][N];

export const publishMetric = createFireTelemetryCounter(observabilityRegistry.featureName);

export const { trackCounter } = createTrackers(observabilityRegistry, {
  publish: publishMetric,
});
