import type { RegistryInput } from "@rbx/observability-framework/schema";
import type { MakeObservabilityTypes } from "@rbx/observability-framework/types";
import { createTrackers } from "@rbx/observability-framework/trackers";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";
import type ChallengeType from "../challenge/generic/interface/challengeType";
import type ModalState from "../accountSecurityPrompt/store/modalState";
import type { UpdateAction } from "../../common/request/types/promptAssignments";

export const observabilityRegistry = {
  featureName: "AccountSecurity",
  team: "User > Consumer Apps > Platforms - Web & Backend",

  features: {
    // Completed, Abandoned and Invalidated are keyed by the challenge the request first raised;
    // Shown and RenderFailed by each challenge rendered, follow-up challenges included.
    challenge: {
      counters: [
        { name: "ChallengeShown", dimensions: ["host", "challengeType"] },
        { name: "ChallengeCompleted", dimensions: ["host", "challengeType"] },
        { name: "ChallengeAbandoned", dimensions: ["host", "challengeType"] },
        { name: "ChallengeInvalidated", dimensions: ["host", "challengeType"] },
      ],
      errors: [{ name: "ChallengeParseFailed", dimensions: ["host"] }],
      criticalErrors: [{ name: "ChallengeRenderFailed", dimensions: ["host", "challengeType"] }],
      flows: [
        {
          id: "account_security_challenge",
          title: "Challenges (outcome vs shown)",
          steps: [
            {
              counter: "ChallengeShown",
              role: "start",
              title: "Shown",
              dimensions: ["challengeType"],
            },
            {
              counter: "ChallengeCompleted",
              role: "success",
              title: "Completed",
              dimensions: ["challengeType"],
            },
            {
              counter: "ChallengeAbandoned",
              role: "drop",
              title: "Abandoned",
              dimensions: ["challengeType"],
            },
            {
              counter: "ChallengeInvalidated",
              role: "error",
              title: "Invalidated",
              dimensions: ["challengeType"],
            },
          ],
        },
      ],
    },
    prompt: {
      counters: [
        { name: "PromptShown", dimensions: ["host", "promptType"] },
        { name: "PromptModalViewed", dimensions: ["host", "promptType", "state"] },
        { name: "PromptUpdated", dimensions: ["host", "promptType", "action"] },
      ],
      errors: [
        { name: "PromptAssignmentsFetchFailed", dimensions: ["host"] },
        { name: "PromptUpdateFailed", dimensions: ["host", "promptType", "action"] },
      ],
    },
  },
} as const satisfies RegistryInput;

type Obs = MakeObservabilityTypes<typeof observabilityRegistry>;

export type CounterName = Obs["CounterName"];
export type ErrorName = Obs["ErrorName"];
export type CriticalErrorName = Obs["CriticalErrorName"];

// Every event carries `host` so .NET and Next.js traffic can be compared during the cutover.
// Inlined by Next.js; the Rspack build leaves it undefined.
export const host = process.env.NEXT_PUBLIC_IS_NEXTJS === "true" ? "nextjs" : "dotnet";

export const { trackCounter, trackError, trackCriticalError } = createTrackers(
  observabilityRegistry,
  {
    publish: createFireTelemetryCounter(observabilityRegistry.featureName),
    featureName: observabilityRegistry.featureName,
  },
);

export const trackChallengeShown = (challengeType: ChallengeType): void => {
  trackCounter("ChallengeShown", { host, challengeType });
};

export const trackChallengeCompleted = (challengeType: ChallengeType): void => {
  trackCounter("ChallengeCompleted", { host, challengeType });
};

export const trackChallengeAbandoned = (challengeType: ChallengeType): void => {
  trackCounter("ChallengeAbandoned", { host, challengeType });
};

export const trackChallengeInvalidated = (challengeType: ChallengeType): void => {
  trackCounter("ChallengeInvalidated", { host, challengeType });
};

export const trackChallengeParseFailed = (): void => {
  trackError("ChallengeParseFailed", { host });
};

export const trackChallengeRenderFailed = (challengeType: ChallengeType, error?: unknown): void => {
  trackCriticalError("ChallengeRenderFailed", { host, challengeType }, error);
};

export const trackPromptShown = (promptType: string): void => {
  trackCounter("PromptShown", { host, promptType });
};

export const trackPromptModalViewed = (promptType: string, state: ModalState): void => {
  trackCounter("PromptModalViewed", { host, promptType, state });
};

export const trackPromptUpdated = (promptType: string, action: UpdateAction): void => {
  trackCounter("PromptUpdated", { host, promptType, action });
};

export const trackPromptUpdateFailed = (promptType: string, action: UpdateAction): void => {
  trackError("PromptUpdateFailed", { host, promptType, action });
};

export const trackPromptAssignmentsFetchFailed = (): void => {
  trackError("PromptAssignmentsFetchFailed", { host });
};
