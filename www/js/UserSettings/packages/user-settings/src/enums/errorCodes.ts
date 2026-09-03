export const ChallengeAbandonedError = "ChallengeAbandonedError";
export const UnknownError = "UnknownError";

export enum UserSettingsServiceErrorCode {
  TooManyRequests = 5,
  FeatureDisabled = 7,
}

export enum UpdateInventoryTradePrivacyErrorCode {
  SettingsConflict = 1,
}

export enum ScreentimeSettingsErrorCode {
  InvalidParameters = 1,
  InvalidBody = 2,
  Unauthorized = 3,
  Forbidden = 4,
  NullRequiredParameters = 13,
}

export enum ParentalControlsErrorCode {
  // comes from parental-controls-api ParentalControlsErrorCode enum
  // only included the error codes that require user-facing messages here
  UserBlockingLimitReached = "UserBlockingLimitReached",
  ExperienceBlockingLimitReached = "ExperienceBlockingLimitReached",
  ParentNotVerified = "ParentNotVerified",
}

export enum CancelPendingConsentErrorCode {
  ConsentAlreadyApplied = "ConsentAlreadyApplied",
  AlreadyLinked = "AlreadyLinked",
  Unknown = "Unknown",
}

export enum ValidateDisplayNameErrorCode {
  TooShort = 1,
  TooLong = 2,
  InvalidCharacters = 3,
  Moderated = 4,
  Throttled = 5,
  InvalidCharacterSetCombination = 8,
  NameNotAvailable = 9,
}
