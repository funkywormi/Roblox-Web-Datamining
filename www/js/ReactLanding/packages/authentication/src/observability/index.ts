import type { RegistryInput } from "@rbx/observability-framework/schema";
import type { MakeObservabilityTypes } from "@rbx/observability-framework/types";
import { createTrackers } from "@rbx/observability-framework/trackers";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";

// Keep existing WebAuthentication event names for dashboard continuity.
export const observabilityRegistry = {
  featureName: "WebAuthentication",
  team: "Safety > Accounts > Authentication",
  features: {
    authFlow: {
      counters: [
        { name: "PageMounted", dimensions: ["flow", "source", "variant"] },
        {
          name: "FormReady",
          dimensions: ["flow", "source", "variant", "primaryActionEnabled"],
        },
        {
          name: "PrimaryActionClicked",
          dimensions: ["flow", "source", "variant", "method"],
        },
        {
          name: "SubmissionBlocked",
          dimensions: ["flow", "source", "variant", "method", "reason"],
        },
        {
          name: "RequestStarted",
          dimensions: ["flow", "source", "variant", "method", "isUserInitiated"],
        },
        {
          name: "RequestSucceeded",
          dimensions: ["flow", "source", "variant", "method", "nextStep", "isUserInitiated"],
        },
        {
          name: "RequestFailed",
          dimensions: ["flow", "source", "variant", "method", "reason", "isUserInitiated"],
        },
        { name: "StepReached", dimensions: ["flow", "source", "variant", "stage"] },
        { name: "FlowCompleted", dimensions: ["flow", "source", "variant", "method"] },
        { name: "FlowAbandoned", dimensions: ["flow", "source", "variant", "stage"] },
      ],
      flows: [
        {
          id: "authentication-flow",
          title: "Authentication flow (login and signup)",
          steps: [
            { counter: "PageMounted", role: "start", dimensions: ["flow"] },
            { counter: "RequestStarted", role: "neutral", dimensions: ["flow"] },
            { counter: "RequestSucceeded", role: "neutral", dimensions: ["flow"] },
            { counter: "FlowCompleted", role: "success", dimensions: ["flow"] },
            { counter: "RequestFailed", role: "error", dimensions: ["flow"] },
            { counter: "FlowAbandoned", role: "drop", dimensions: ["flow"] },
          ],
        },
      ],
    },
  },
} as const satisfies RegistryInput;

type Obs = MakeObservabilityTypes<typeof observabilityRegistry>;

export type CounterName = Obs["CounterName"];

const publishMetric = createFireTelemetryCounter(observabilityRegistry.featureName);

export const { trackCounter } = createTrackers(observabilityRegistry, { publish: publishMetric });
