export const FEATURE_NAME = "ProofOfWork" as const;
export const LOG_PREFIX = "Proof-of-Work:" as const;

/**
 * Translation namespaces used by this web app. Keep in sync with the challenge
 * SCC's `component.json` (.NET) and `www-nextjs/src/i18n/config.ts` (Next.js).
 */
export const TRANSLATION_NAMESPACES = ["Feature.ProofOfWorkChallenge"] as const;

/**
 * Constants for event stream events.
 */
export const EVENT_CONSTANTS = {
  eventName: "accountSecurityChallengeProofOfWorkEvent",
  context: {
    challengeInitialized: "challengeInitialized",
    puzzleInitialized: "puzzleInitialized",
    puzzleCompleted: "puzzleCompleted",
    challengeCompleted: "challengeCompleted",
    challengeInvalidated: "challengeInvalidated",
    challengeAbandoned: "challengeAbandoned",
    challengeTimeout: "challengeTimeout",
  },
} as const;

/**
 * Constants for event tracker metrics.
 */
export const METRICS_CONSTANTS = {
  event: {
    challengeInitialized: "ChallengeInitialized",
    puzzleInitialized: "PuzzleInitialized",
    puzzleCompleted: "PuzzleCompleted",
    challengeCompleted: "ChallengeCompleted",
    challengeInvalidated: "ChallengeInvalidated",
    challengeAbandoned: "ChallengeAbandoned",
    challengeTimeout: "ChallengeTimeout",
  },
  sequence: {
    puzzleWorkingTime: "PuzzleWorkingTime",
    challengeSolveTime: "ChallengeSolveTime",
  },
} as const;
