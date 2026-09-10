import { createTrackers } from "@rbx/observability-framework/trackers";
import { captureException } from "@rbx/payments/error";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/fire";

import type { RegistryInput } from "@rbx/observability-framework/schema";
import type { MakeObservabilityTypes } from "@rbx/observability-framework/types";

/**
 * Do not rename `featureName`: it is the only field passed to the counter publisher
 * (see `createFireTelemetryCounter` below), so changing it splits the metric series on
 * the frames launch dashboards. `team` is dashboard metadata only and is safe to change.
 */
export const observabilityRegistry = {
  featureName: "EditUserProfile",
  team: "Economy > Payments & Fraud > Subscriptions",

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

export type CounterName = Obs["CounterName"];
export type ErrorName = Obs["ErrorName"];

const publishMetric = createFireTelemetryCounter(observabilityRegistry.featureName);

export const { trackCounter, trackError } = createTrackers(observabilityRegistry, {
  publish: publishMetric,
  captureException,
});
