import type { RegistryInput } from "@rbx/observability-framework/schema";
import type { MakeObservabilityTypes } from "@rbx/observability-framework/types";
import { createTrackers } from "@rbx/observability-framework/trackers";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";

/**
 * `featureName` is the counter series prefix. Do not rename it after dashboards exist.
 */
export const observabilityRegistry = {
  featureName: "AmpV2Wizard",
  team: "Safety > Accounts",
  features: {
    entry: {
      counters: [
        "EntryRequested",
        "EntryRejectedBusy",
        "EntryNothingToRun",
        { name: "EntryFailed", dimensions: ["cause"] },
      ],
    },
    flow: {
      counters: [
        "FlowStarted",
        { name: "NodeShown", dimensions: ["nodeType"] },
        { name: "ContinueFailed", dimensions: ["nodeType"] },
        "UnrenderableNode",
        "FlowCompleted",
        "FlowCancelled",
        "FlowErrored",
      ],
      flows: [
        {
          id: "amp_v2_wizard_flow",
          title: "UFO wizard flow",
          steps: [
            { counter: "FlowStarted", role: "start", title: "Started" },
            { counter: "FlowCompleted", role: "success", title: "Completed" },
            { counter: "FlowErrored", role: "error", title: "Errored" },
          ],
        },
      ],
    },
  },
} as const satisfies RegistryInput;

type Obs = MakeObservabilityTypes<typeof observabilityRegistry>;

export type CounterName = Obs["CounterName"];

export const publishMetric = createFireTelemetryCounter(observabilityRegistry.featureName);

export const { trackCounter } = createTrackers(observabilityRegistry, {
  publish: publishMetric,
});
