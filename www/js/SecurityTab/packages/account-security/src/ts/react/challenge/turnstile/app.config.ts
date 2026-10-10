export const FEATURE_NAME = "Turnstile" as const;
export const LOG_PREFIX = "Turnstile:" as const;

/**
 * Constants for event stream events.
 */
export const EVENT_CONSTANTS = {
  eventName: "accountSecurityChallengeTurnstileEvent",
  context: {
    challengeInitialized: "challengeInitialized",
    challengeDisplayed: "challengeDisplayed",
    challengeCompleted: "challengeCompleted",
    challengeInvalidated: "challengeInvalidated",
    challengeAbandoned: "challengeAbandoned",
  },
} as const;

/**
 * Constants for event tracker metrics.
 */
export const METRICS_CONSTANTS = {
  event: {
    challengeInitialized: "ChallengeInitialized",
    challengeDisplayed: "ChallengeDisplayed",
    challengeCompleted: "ChallengeCompleted",
    challengeInvalidated: "ChallengeInvalidated",
    challengeAbandoned: "ChallengeAbandoned",
  },
  sequence: {
    challengeSolveTime: "ChallengeSolveTime",
  },
} as const;

/**
 * Translation namespaces used by this web app. Keep in sync with the challenge
 * SCC's `component.json` (.NET) and `www-nextjs/src/i18n/config.ts` (Next.js).
 */
export const TRANSLATION_NAMESPACES = ["Authentication.Captcha"] as const;
