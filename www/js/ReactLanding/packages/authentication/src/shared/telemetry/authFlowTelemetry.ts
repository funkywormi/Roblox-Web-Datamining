import { createFireTelemetryHistogram } from "@rbx/web-telemetry/v2/histogram";
import { observabilityRegistry, trackCounter } from "../../observability";

export const authFlow = {
  login: "login",
  signup: "signup",
} as const;

export type AuthFlow = (typeof authFlow)[keyof typeof authFlow];

export const authSource = {
  legacy: "legacy",
  signupV2: "signupV2",
} as const;

export type AuthSource = (typeof authSource)[keyof typeof authSource];

export const authVariant = {
  control: "control",
  passwordFirst: "passwordFirst",
  passkeyFirst: "passkeyFirst",
  foundationControl: "foundationControl",
} as const;

export type AuthVariant = (typeof authVariant)[keyof typeof authVariant];

export const authMethod = {
  unspecified: "unspecified",
  password: "password",
  passkey: "passkey",
  otp: "otp",
  authToken: "authToken",
  magicLink: "magicLink",
} as const;

export type AuthMethod = (typeof authMethod)[keyof typeof authMethod];

export const authNextStep = {
  complete: "complete",
  twoStep: "twoStep",
  identityVerification: "identityVerification",
} as const;

export type AuthNextStep = (typeof authNextStep)[keyof typeof authNextStep];

export const authFailureReason = {
  clientValidation: "clientValidation",
  credentials: "credentials",
  captcha: "captcha",
  challenge: "challenge",
  accountRestriction: "accountRestriction",
  passkeyBind: "passkeyBind",
  rateLimited: "rateLimited",
  network: "network",
  server: "server",
  unknown: "unknown",
} as const;

export type AuthFailureReason = (typeof authFailureReason)[keyof typeof authFailureReason];

export const authStage = {
  form: "form",
  addAuthMethod: "addAuthMethod",
  awaitingCeremony: "awaitingCeremony",
  awaitingChoice: "awaitingChoice",
  formIncomplete: "formIncomplete",
} as const;

export type AuthStage = (typeof authStage)[keyof typeof authStage];

export const authTelemetryCounters = {
  pageMounted: "PageMounted",
  formReady: "FormReady",
  primaryActionClicked: "PrimaryActionClicked",
  submissionBlocked: "SubmissionBlocked",
  requestStarted: "RequestStarted",
  requestSucceeded: "RequestSucceeded",
  requestFailed: "RequestFailed",
  stepReached: "StepReached",
  flowCompleted: "FlowCompleted",
  flowAbandoned: "FlowAbandoned",
} as const;

export const authTelemetryHistograms = {
  requestDurationMs: "RequestDurationMs",
  flowCompletionDurationMs: "FlowCompletionDurationMs",
} as const;

export type AuthFlowTelemetry = {
  pageMounted: () => void;
  formReady: (primaryActionEnabled?: boolean) => void;
  primaryActionClicked: (method: AuthMethod) => void;
  submissionBlocked: (method: AuthMethod, reason: AuthFailureReason) => void;
  requestStarted: (method: AuthMethod, isUserInitiated?: boolean) => void;
  requestSucceeded: (method: AuthMethod, nextStep?: AuthNextStep) => void;
  requestFailed: (method: AuthMethod, reason: AuthFailureReason) => void;
  stepReached: (stage: AuthStage) => void;
  flowCompleted: (method: AuthMethod) => void;
  flowAbandoned: (stage: AuthStage) => void;
};

export type AuthFlowTelemetryConfig = {
  flow: AuthFlow;
  source: AuthSource;
  variant?: AuthVariant;
  now?: () => number;
};

type BaseAttributes = {
  flow: AuthFlow;
  source: AuthSource;
  variant: AuthVariant | "unspecified";
};

const fireHistogram = createFireTelemetryHistogram(observabilityRegistry.featureName, {});

const suppressTelemetryFailure = (send: () => void): void => {
  try {
    send();
  } catch {
    // Telemetry must never interrupt authentication.
  }
};

export const createAuthFlowTelemetry = ({
  flow,
  source,
  variant,
  now = Date.now,
}: AuthFlowTelemetryConfig): AuthFlowTelemetry => {
  const baseAttributes: BaseAttributes = {
    flow,
    source,
    variant: variant ?? "unspecified",
  };
  // Histograms are not tracked by the framework; retain their existing labels.
  const histogramAttributes = { flow, source, ...(variant ? { variant } : {}) };
  let flowStartedAt: number | undefined;
  let requestStartedAt: number | undefined;
  let requestIsUserInitiated = true;
  let isFlowCompleted = false;

  const recordDuration = (
    name: (typeof authTelemetryHistograms)[keyof typeof authTelemetryHistograms],
    startedAt: number | undefined,
    method: AuthMethod,
    attributes?: Record<string, boolean>,
  ): void => {
    if (startedAt === undefined) {
      return;
    }
    suppressTelemetryFailure(() => {
      fireHistogram(
        name,
        { ...histogramAttributes, method, ...attributes },
        Math.max(0, now() - startedAt),
      );
    });
  };

  return {
    pageMounted: () => {
      flowStartedAt = now();
      isFlowCompleted = false;
      suppressTelemetryFailure(() =>
        trackCounter(authTelemetryCounters.pageMounted, baseAttributes),
      );
    },
    formReady: (primaryActionEnabled = true) => {
      suppressTelemetryFailure(() =>
        trackCounter(authTelemetryCounters.formReady, {
          ...baseAttributes,
          primaryActionEnabled: String(primaryActionEnabled),
        }),
      );
    },
    primaryActionClicked: method => {
      suppressTelemetryFailure(() =>
        trackCounter(authTelemetryCounters.primaryActionClicked, { ...baseAttributes, method }),
      );
    },
    submissionBlocked: (method, reason) => {
      suppressTelemetryFailure(() =>
        trackCounter(authTelemetryCounters.submissionBlocked, {
          ...baseAttributes,
          method,
          reason,
        }),
      );
    },
    requestStarted: (method, isUserInitiated = true) => {
      requestStartedAt = now();
      requestIsUserInitiated = isUserInitiated;
      suppressTelemetryFailure(() =>
        trackCounter(authTelemetryCounters.requestStarted, {
          ...baseAttributes,
          method,
          isUserInitiated: String(isUserInitiated),
        }),
      );
    },
    requestSucceeded: (method, nextStep = authNextStep.complete) => {
      recordDuration(authTelemetryHistograms.requestDurationMs, requestStartedAt, method, {
        isUserInitiated: requestIsUserInitiated,
      });
      requestStartedAt = undefined;
      suppressTelemetryFailure(() =>
        trackCounter(authTelemetryCounters.requestSucceeded, {
          ...baseAttributes,
          method,
          nextStep,
          isUserInitiated: String(requestIsUserInitiated),
        }),
      );
    },
    requestFailed: (method, reason) => {
      recordDuration(authTelemetryHistograms.requestDurationMs, requestStartedAt, method, {
        isUserInitiated: requestIsUserInitiated,
      });
      requestStartedAt = undefined;
      suppressTelemetryFailure(() =>
        trackCounter(authTelemetryCounters.requestFailed, {
          ...baseAttributes,
          method,
          reason,
          isUserInitiated: String(requestIsUserInitiated),
        }),
      );
    },
    stepReached: stage => {
      suppressTelemetryFailure(() =>
        trackCounter(authTelemetryCounters.stepReached, { ...baseAttributes, stage }),
      );
    },
    flowCompleted: method => {
      if (isFlowCompleted) {
        return;
      }
      recordDuration(authTelemetryHistograms.flowCompletionDurationMs, flowStartedAt, method);
      suppressTelemetryFailure(() =>
        trackCounter(authTelemetryCounters.flowCompleted, { ...baseAttributes, method }),
      );
      isFlowCompleted = true;
    },
    flowAbandoned: stage => {
      if (isFlowCompleted) {
        return;
      }
      suppressTelemetryFailure(() =>
        trackCounter(authTelemetryCounters.flowAbandoned, { ...baseAttributes, stage }),
      );
    },
  };
};
