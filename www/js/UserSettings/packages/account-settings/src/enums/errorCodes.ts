export enum AccountSettingsContactErrorCode {
  AccountLocked = 1,
  InvalidSettingOption = 3,
}

export enum AccountSettingsExperienceJoinSettingsErrorCode {
  AccountLocked = 5,
  InvalidPermission = 6,
}

export enum AccountSettingsTradeSettingsErrorCode {
  AccountLocked = 1,
  UserCannotTrade = 2,
  InvalidTradeValue = 3,
  InvalidTradePrivacy = 4,
}

// error messages based on EmailErrors Enum from ApiSites\Roblox.AccountSettings.Api\Roblox.AccountSettings.Api\ResponseEnums\EmailErrors.cs
export enum EmailErrorCode {
  Unknown = 0,
  PinLocked = 1,
  FeatureDisabled = 2,
  TooManyAccounts = 3,
  SameEmail = 4,
  AlreadyVerified = 5,
  TooManyUpdates = 6,
  TooManyVerify = 7,
  IncorrectPassword = 8,
  InvalidEmail = 9,
  NoEmailAssociated = 10,
  RequiresCorpNetwork = 11,
}

export enum ContactsErrorCode {
  TooManyRequests = 429,
}

export enum BlockUserErrorCode {
  TargetNotBlocked = 4,
  TargetBlockedOnPlatform = 16,
}

export enum PromotionChannelsErrorCode {
  InvalidFacebookUrl = 11,
  InvalidXTwitterUrl = 12,
  InvalidYoutubeUrl = 13,
  InvalidTwitchUrl = 14,
  InvalidGuildedUrl = 15,
}

export enum ChangePasswordErrorCode {
  Unknown = 0,
  TooManyRequests = 2,
  InvalidPassword = 7,
  InvalidCurrentPassword = 8,
  PinLocked = 9,
}

export enum UsernameValidateErrorCode {
  AlreadyTaken = 1,
  CantBeUsed = 2,
  InvalidLengthError = 3,
  StartsOrEndsWithUnderscoreError = 4,
  TooManyUnderscoresError = 5,
  ContainsSpacesError = 6,
  InvalidCharactersError = 7,
  CantBeUsedPII = 10,
  ContainsReservedUsernameError = 12,
}

export enum UsernameResponseErrorCode {
  InvalidUsername = 1,
}

export enum GenderErrorCode {
  PinLocked = 2,
  InvalidGender = 6,
}

export enum UpdateAccountCountryErrorCodes {
  unknown = 0,
  invalidRequest = 1,
  OperationNotPermitted = 2,
  PinLocked = 3,
}

export enum PrivacyErrorCode {
  Unknown = 0,
  RequestOngoing = 1,
}
