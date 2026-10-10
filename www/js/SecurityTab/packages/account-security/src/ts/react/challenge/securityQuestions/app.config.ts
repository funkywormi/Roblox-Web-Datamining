export const FEATURE_NAME = "SecurityQuestions" as const;
export const LOG_PREFIX = "Security Questions:" as const;

// Constants used in specific contexts:
// The path of the Security Notification page on WWW.
export const SECURITY_NOTIFICATION_PATH = "/login/securityNotification" as const;

/**
 * Translation namespaces used by this web app. Keep in sync with the challenge
 * SCC's `component.json` (.NET) and `www-nextjs/src/i18n/config.ts` (Next.js).
 */
export const TRANSLATION_NAMESPACES = ["Feature.SecurityQuestions", "CommonUI.Messages"] as const;

/**
 * Constants for event stream events.
 */
export const EVENT_CONSTANTS = {
  eventName: "securityQuestionsEvent",
  context: {
    answerChoicesFailedToLoad: "answerChoicesFailedToLoad",
  },
} as const;

/**
 * Constants for metrics.
 */
export const METRIC_CONSTANTS = {
  event: {
    initialized: "Initialized",
    errored: "Errored",
    solved: "Solved",
    incorrect: "Incorrect",
    failed: "Failed",
  },
} as const;
