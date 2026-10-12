export const FEATURE_NAME = "TwoStepVerification" as const;
export const LOG_PREFIX = "Two-Step Verification:" as const;
export const TIMEOUT_BEFORE_CALLBACK_MILLISECONDS = 100;

/**
 * Translation namespaces required by this web app. Keep in sync with the challenge SCC's
 * `component.json` (.NET) and `www-nextjs/src/i18n/config.ts` (Next.js).
 */
export const TRANSLATION_NAMESPACES = ["Authentication.TwoStepVerification"] as const;

/**
 * Constants for event stream events.
 */
export const EVENT_CONSTANTS = {
  eventName: "accountSecurityChallengeTwoStepVerificationEvent",
  context: {
    challengeInitialized: "challengeInitialized",
    userConfigurationLoaded: "userConfigurationLoaded",
    challengeInvalidated: "challengeInvalidated",
    challengeAbandoned: "challengeAbandoned",
    emailResendRequested: "emailResendRequested",
    smsResendRequested: "smsResendRequested",
    mediaTypeChanged: "mediaTypeChanged",
    codeSubmitted: "codeSubmitted",
    codeVerificationFailed: "codeVerificationFailed",
    codeVerified: "codeVerified",
    noEnabledMethodsReturned: "noEnabledMethodsReturned",
    tryToSwitchMediaType: "switchMediaType",
  },
} as const;

/**
 * Constants for event tracker metrics.
 */
export const METRICS_CONSTANTS = {
  event: {
    initialized: "Initialized",
    verified: "Verified",
    invalidated: "Invalidated",
    abandoned: "Abandoned",
  },
  sequence: {
    solveTime: "SolveTime",
  },
} as const;
