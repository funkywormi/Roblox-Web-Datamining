import { TranslationConfig } from "@rbx/core-scripts/react";

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
 * Translations required by this web app (remember to also edit
 * `bundle.config.js` if changing this configuration). We reuse the existing
 * captcha translation feature since it already contains the shared strings.
 */
export const TRANSLATION_CONFIG: TranslationConfig = ["Authentication.Captcha"];

/**
 * Language resource keys for turnstile that are requested dynamically.
 */
export const TURNSTILE_LANGUAGE_RESOURCES = ["Description.VerifyingYouAreNotBot"] as const;
