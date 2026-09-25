import { createFireTelemetryCounter } from "@rbx/web-telemetry/fire";
import { createFireTelemetryHistogram } from "@rbx/web-telemetry/histogram";

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
  variant?: AuthVariant;
};

const fireCounter = createFireTelemetryCounter("WebAuthentication");
const fireHistogram = createFireTelemetryHistogram("WebAuthentication", {});

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
    ...(variant ? { variant } : {}),
  };
  let flowStartedAt: number | undefined;
  let requestStartedAt: number | undefined;
  let requestIsUserInitiated = true;
  let isFlowCompleted = false;

  const recordCounter = (
    name: (typeof authTelemetryCounters)[keyof typeof authTelemetryCounters],
    attributes?: Record<string, string | boolean>,
  ): void => {
    suppressTelemetryFailure(() => {
      fireCounter(name, { ...baseAttributes, ...attributes });
    });
  };

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
        { ...baseAttributes, method, ...attributes },
        Math.max(0, now() - startedAt),
      );
    });
  };

  return {
    pageMounted: () => {
      flowStartedAt = now();
      isFlowCompleted = false;
      recordCounter(authTelemetryCounters.pageMounted);
    },
    formReady: (primaryActionEnabled = true) => {
      recordCounter(authTelemetryCounters.formReady, { primaryActionEnabled });
    },
    primaryActionClicked: method => {
      recordCounter(authTelemetryCounters.primaryActionClicked, { method });
    },
    submissionBlocked: (method, reason) => {
      recordCounter(authTelemetryCounters.submissionBlocked, { method, reason });
    },
    requestStarted: (method, isUserInitiated = true) => {
      requestStartedAt = now();
      requestIsUserInitiated = isUserInitiated;
      recordCounter(authTelemetryCounters.requestStarted, { method, isUserInitiated });
    },
    requestSucceeded: (method, nextStep = authNextStep.complete) => {
      recordDuration(authTelemetryHistograms.requestDurationMs, requestStartedAt, method, {
        isUserInitiated: requestIsUserInitiated,
      });
      requestStartedAt = undefined;
      recordCounter(authTelemetryCounters.requestSucceeded, {
        method,
        nextStep,
        isUserInitiated: requestIsUserInitiated,
      });
    },
    requestFailed: (method, reason) => {
      recordDuration(authTelemetryHistograms.requestDurationMs, requestStartedAt, method, {
        isUserInitiated: requestIsUserInitiated,
      });
      requestStartedAt = undefined;
      recordCounter(authTelemetryCounters.requestFailed, {
        method,
        reason,
        isUserInitiated: requestIsUserInitiated,
      });
    },
    stepReached: stage => {
      recordCounter(authTelemetryCounters.stepReached, { stage });
    },
    flowCompleted: method => {
      if (isFlowCompleted) {
        return;
      }
      recordDuration(authTelemetryHistograms.flowCompletionDurationMs, flowStartedAt, method);
      recordCounter(authTelemetryCounters.flowCompleted, { method });
      isFlowCompleted = true;
    },
    flowAbandoned: stage => {
      if (isFlowCompleted) {
        return;
      }
      recordCounter(authTelemetryCounters.flowAbandoned, { stage });
    },
  };
};
