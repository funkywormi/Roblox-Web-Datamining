export const FEATURE_NAME = "PhoneVerification" as const;
export const LOG_PREFIX = "PhoneVerification:" as const;
export const UPSELL_ORIGIN = "challenge" as const;

export const PHONE_ROOT_ELEMENT_ID = "phoneverification-challenge-container" as const;

/**
 * Translation namespaces used by this web app. Keep in sync with the challenge
 * SCC's `component.json` (.NET) and `www-nextjs/src/i18n/config.ts` (Next.js).
 */
export const TRANSLATION_NAMESPACES = ["Feature.PhoneVerificationChallenge"] as const;

export const VERIFICATION_UPSELL_TRASLATION_KEY = {
  Description: {
    SuspiciousActivityPhoneVerification: "Description.SuspiciousActivityPhoneVerificationV1",
    LegalText: "Description.ChallengeLegalDisclaimerV1",
  },
  Header: {
    VerifyYourAccountHeader: "Header.VerifyYourAccountHeader",
  },
};

/**
 * Constants for event stream events.
 */
export const EVENT_CONSTANTS = {
  eventName: "accountSecurityChallengePhoneVerificationEvent",
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
