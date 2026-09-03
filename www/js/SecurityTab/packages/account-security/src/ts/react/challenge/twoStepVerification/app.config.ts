import { TranslationConfig } from "react-utilities";

export const FEATURE_NAME = "TwoStepVerification" as const;
export const LOG_PREFIX = "Two-Step Verification:" as const;
export const TIMEOUT_BEFORE_CALLBACK_MILLISECONDS = 100;

/**
 * Translations required by this web app (remember to also edit
 * `bundle.config.js` if changing this configuration).
 */
export const TRANSLATION_CONFIG: TranslationConfig = {
  common: [],
  feature: "Authentication.TwoStepVerification",
};

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

/**
 * Language resource keys for 2SV that are requested dynamically.
 */
export const TWO_STEP_VERIFICATION_LANGUAGE_RESOURCES = [
  "Action.ChangeMediaType",
  "Action.Okay",
  "Action.Recover",
  "Action.Reload",
  "Action.Resend",
  "Action.Retry",
  "Action.Verify",
  "Action.Continue",
  "Description.Denied",
  "Description.Expired",
  "Description.LoginDenied",
  "Description.LoginExpired",
  "Description.QuickLogin",
  "Description.QuickLoginUA",
  "Heading.LoginDenied",
  "Heading.LoginError",
  "Label.AlternateDelayedMethod",
  "Label.ApproveWithDevice",
  "Label.AuthenticatorMediaType",
  "Label.ChooseAMediaType",
  "Label.ChooseAlternateMediaType",
  "Label.CharacterCodeInputPlaceholderText",
  "Label.CodeInputPlaceholderText",
  "Label.DayWait",
  "Label.DelayedVerification.TryAgainOnTrustedDevicePrefix",
  "Label.DelayedVerification.TryAgainOnTrustedDeviceSuffix",
  "Label.DelayedVerification.WaitDays",
  "Label.DelayedVerification.WaitHours",
  "Label.DelayedVerification.WaitMinutes",
  "Label.EmailMediaType",
  "Label.SecurityKeyDirections",
  "Label.SecurityKeyMediaType",
  "Label.SmsMediaType",
  "Label.EnterAuthenticatorCode",
  "Label.EnterEmailCode",
  "Label.EnterEmailCodeSanitizedEmail",
  "Label.EnterEmailCodeSanitizedEmailU13",
  "Label.EnterPassword",
  "Label.EnterRecoveryCode",
  "Label.EnterTextCode",
  "Label.HelpCenter",
  "Label.HelpCenterLink",
  "Label.HourWait",
  "Label.LearnMore",
  "Label.MinuteWait",
  "Label.NewLogin",
  "Label.NeedHelpContactSupport",
  "Label.NoWait",
  "Label.PasskeyDirections",
  "Label.PasskeyMediaType",
  "Label.Password",
  "Label.PasswordPlaceholder",
  "Label.RecoveryCodeMediaType",
  "Label.RobloxSupport",
  "Label.SimpleDay",
  "Label.SimpleHour",
  "Label.SimpleMinute",
  "Label.TrustThisDevice",
  "Label.TryAgainNow",
  "Label.TwoStepVerification",
  "Label.UnableToCalculateDelay",
  "Label.UseOneOfThese",
  "Label.UseYourDevice",
  "Label.VerifyWithPasskey",
  "Label.VerifyWithSecurityKey",
  "Label.WeNeedYouToWait",
  "Response.AuthenticatorCodeAlreadyUsed",
  "Response.CodeSent",
  "Response.DefaultError",
  "Response.FeatureNotAvailable",
  "Response.InvalidCode",
  "Response.InvalidPassword",
  "Response.SessionExpired",
  "Response.SystemErrorSwitchingToEmail",
  "Response.TooManyAttempts",
  "Response.VerificationError",
  "Title.UseAnotherDevice",
] as const;

/**
 * Language resource keys for 2SV that are requested dynamically.
 *
 * This array should contain newly-added keys that are likely to have partial
 * translations across languages. Eventually, these keys may be moved into the
 * previous map as translations complete.
 */
export const TWO_STEP_VERIFICATION_LANGUAGE_RESOURCES_NEW = [
  "Description.SecurityWarningShort",
  "Description.SecurityWarningShortBackupCodes",
] as const;
