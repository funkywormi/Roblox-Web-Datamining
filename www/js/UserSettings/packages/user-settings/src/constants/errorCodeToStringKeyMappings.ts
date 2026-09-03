import {
  UserSettingsServiceErrorCode,
  ScreentimeSettingsErrorCode,
  ValidateDisplayNameErrorCode,
} from "../enums/errorCodes";

export const userSettingsServiceErrorCodeToStringKeys: Record<
  UserSettingsServiceErrorCode,
  string
> = {
  [UserSettingsServiceErrorCode.TooManyRequests]: "Message.Error.TooManyRequests",
  [UserSettingsServiceErrorCode.FeatureDisabled]: "Response.FeatureDisabled",
};

export const screentimeErrorCodeToStringKeysStringKeys: Record<
  ScreentimeSettingsErrorCode,
  string
> = {
  [ScreentimeSettingsErrorCode.InvalidParameters]: "Message.Error.InvalidSettingOption",
  [ScreentimeSettingsErrorCode.InvalidBody]: "Message.Error.InvalidSettingOption",
  [ScreentimeSettingsErrorCode.Unauthorized]: "Message.Error.Unauthorized",
  [ScreentimeSettingsErrorCode.Forbidden]: "Response.FeatureDisabled",
  [ScreentimeSettingsErrorCode.NullRequiredParameters]: "Message.Error.InvalidSettingOption",
};

export const validateDisplayNameErrorCodeToStringKeys: Record<
  ValidateDisplayNameErrorCode,
  string
> = {
  [ValidateDisplayNameErrorCode.TooShort]: "ErrorMessage.NameTooShort",
  [ValidateDisplayNameErrorCode.TooLong]: "ErrorMessage.NameTooLong",
  [ValidateDisplayNameErrorCode.InvalidCharacters]: "ErrorMessage.NameUnsupportedChars",
  [ValidateDisplayNameErrorCode.Moderated]: "ErrorMessage.NameInappropriate",
  [ValidateDisplayNameErrorCode.Throttled]: "ErrorMessage.NameHasChanged",
  [ValidateDisplayNameErrorCode.InvalidCharacterSetCombination]:
    "ErrorMessage.NameUnsupportedChars",
  [ValidateDisplayNameErrorCode.NameNotAvailable]: "ErrorMessage.NameNotAvailable",
};

export const validateAgedUpDisplayNameErrorCodeToStringKeys: Record<
  ValidateDisplayNameErrorCode,
  string
> = {
  [ValidateDisplayNameErrorCode.TooShort]: "ErrorMessage.AgedUpNameTooShort",
  [ValidateDisplayNameErrorCode.TooLong]: "ErrorMessage.AgedUpNameTooLong",
  [ValidateDisplayNameErrorCode.InvalidCharacters]: "ErrorMessage.AgedUpNameUnsupportedChars",
  [ValidateDisplayNameErrorCode.Moderated]: "ErrorMessage.AgedUpNameInappropriate",
  [ValidateDisplayNameErrorCode.Throttled]: "ErrorMessage.AgedUpNameHasChanged",
  [ValidateDisplayNameErrorCode.InvalidCharacterSetCombination]:
    "ErrorMessage.NameMoreThanOneCharacterKind",
  [ValidateDisplayNameErrorCode.NameNotAvailable]: "ErrorMessage.AgedUpNameNotAvailable",
};

export const defaultErrorMessage = "Message.Error.Default";
