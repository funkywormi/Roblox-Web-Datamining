export const FEATURE_NAME = "PrivateAccessToken" as const;
export const LOG_PREFIX = "Private-Access-Token:" as const;

/**
 * Translation namespaces used by this web app. Keep in sync with the challenge
 * SCC's `component.json` (.NET) and `www-nextjs/src/i18n/config.ts` (Next.js).
 */
export const TRANSLATION_NAMESPACES = ["Feature.PrivateAccessTokenChallenge"] as const;

/**
 * Constants for event stream events.
 */
export const EVENT_CONSTANTS = {
  eventName: "accountSecurityChallengePrivateAccessTokenEvent",
  context: {
    challengeInitialized: "challengeInitialized",
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
    challengeCompleted: "ChallengeCompleted",
    challengeInvalidated: "ChallengeInvalidated",
    challengeAbandoned: "ChallengeAbandoned",
  },
  sequence: {
    challengeSolveTime: "ChallengeSolveTime",
  },
} as const;
