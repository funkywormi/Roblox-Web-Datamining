import type { RegistryInput } from "@rbx/observability-framework/schema";
import type { MakeObservabilityTypes } from "@rbx/observability-framework/types";
import { createTrackers, type PublishFn } from "@rbx/observability-framework/trackers";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";
import { getStatusCode } from "../utils/getStatusCode";

export const observabilityRegistry = {
  featureName: "Chat",
  team: "User > Communication > Communication Platform",

  features: {
    health: {
      criticalErrors: [{ name: "ChatLoadFailed", dimensions: ["statusCode"] }],
      errors: [
        { name: "ConversationsLoadFailed", dimensions: ["statusCode"] },
        { name: "SettingsRefreshFailed", dimensions: ["statusCode"] },
        "RealtimeDisconnected",
      ],
    },
    conversations: {
      counters: ["ChatOpened", "ConversationOpened", "MessageSent"],
      errors: [
        { name: "MessagesLoadFailed", dimensions: ["statusCode"] },
        { name: "SendFailed", dimensions: ["statusCode"] },
        { name: "StartConversationFailed", dimensions: ["statusCode"] },
        { name: "GroupActionFailed", dimensions: ["action", "statusCode"] },
        { name: "GameCardLoadFailed", dimensions: ["statusCode"] },
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

type TGroupAction =
  | "create"
  | "leave"
  | "rename"
  | "addParticipants"
  | "removeParticipant"
  | "removeTrustedConnection";

export const trackGroupActionFailed = (action: TGroupAction, error: unknown): void => {
  trackError("GroupActionFailed", { action, statusCode: getStatusCode(error) }, error);
};
