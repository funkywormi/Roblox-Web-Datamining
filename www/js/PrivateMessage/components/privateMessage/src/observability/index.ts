import type { RegistryInput } from "@rbx/observability-framework/schema";
import type { MakeObservabilityTypes } from "@rbx/observability-framework/types";
import { createTrackers, type PublishFn } from "@rbx/observability-framework/trackers";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";

export const observabilityRegistry = {
  featureName: "PrivateMessage",
  team: "User > Communication > Communication Platform",
  // Matches .NET PageNameProvider.Messages and the Next.js route's pageName.
  internalPageName: "Messages",

  features: {
    health: {
      counters: [{ name: "PageView", dimensions: ["host", "tab"] }],
      criticalErrors: [{ name: "LoadFailed", dimensions: ["host", "tab", "statusCode"] }],
    },
    messages: {
      counters: [{ name: "OpenTab", dimensions: ["tab"] }, "OpenMessage"],
      errors: [
        { name: "MarkReadFailed", dimensions: ["statusCode"] },
        { name: "ArchiveFailed", dimensions: ["statusCode"] },
        { name: "RulesLoadFailed", dimensions: ["statusCode"] },
        { name: "NewsCountLoadFailed", dimensions: ["statusCode"] },
      ],
    },
  },
} as const satisfies RegistryInput;

type Obs = MakeObservabilityTypes<typeof observabilityRegistry>;

export type CounterName = Obs["CounterName"];
export type ErrorName = Obs["ErrorName"];
export type CriticalErrorName = Obs["CriticalErrorName"];

// Same inlining as the HTTP transport switch; the Rspack SCS build leaves it undefined.
export const host = process.env.NEXT_PUBLIC_IS_NEXTJS === "true" ? "nextjs" : "dotnet";

const fireTelemetryCounter = createFireTelemetryCounter(observabilityRegistry.featureName);

// Every event carries `host` so .NET and Next.js traffic can be compared during the cutover.
export const publishMetric: PublishFn = (name, dimensions) => {
  fireTelemetryCounter(name, { ...dimensions, host });
};

export const { trackCounter, trackError, trackCriticalError } = createTrackers(
  observabilityRegistry,
  { publish: publishMetric, featureName: observabilityRegistry.featureName },
);
