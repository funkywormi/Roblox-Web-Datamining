import { TranslationConfig } from "react-utilities";

/**
 * Language resource keys for Biometric challenge that are requested
 * dynamically.
 */
export const FEATURE_NAME = "Biometric" as const;
export const LOG_PREFIX = "Biometric:" as const;

/**
 * Translation configuration for Biometric challenge.
 */
export const TRANSLATION_CONFIG: TranslationConfig = {
  common: ["CommonUI.Messages"],
  feature: "Feature.BiometricChallenge",
};

/**
 * Language resource keys for biometric challenge that are requested dynamically.
 */
export const BIOMETRIC_LANGUAGE_RESOURCES = [
  "Title.ConfirmHuman",
  "Content.LivenessHostedPrompt",
  "Content.Loading",
  "Action.Cancel",
  "Action.Continue",
  "Action.Close",
  "Title.QRHandoff",
  "Content.ScanQR",
  "Content.QRHelpPrompt",
  "Content.QRHelpFull",
] as const;

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
 * Constants for event stream events.
 */
export const EVENT_CONSTANTS = {
  eventName: "accountSecurityChallengeBiometricEvent",
  context: {
    challengeInitialized: "challengeInitialized",
    challengeDisplayed: "challengeDisplayed",
    challengeCompleted: "challengeCompleted",
    challengeInvalidated: "challengeInvalidated",
    challengeAbandoned: "challengeAbandoned",
  },
} as const;
