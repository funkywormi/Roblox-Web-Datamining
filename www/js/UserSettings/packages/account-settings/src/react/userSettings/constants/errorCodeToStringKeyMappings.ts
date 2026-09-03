import {
  AccountSettingsContactErrorCode,
  AccountSettingsExperienceJoinSettingsErrorCode,
  AccountSettingsTradeSettingsErrorCode,
  EmailErrorCode,
  ContactsErrorCode,
  BlockUserErrorCode,
  PromotionChannelsErrorCode,
  ChangePasswordErrorCode,
  UsernameValidateErrorCode,
  UsernameResponseErrorCode,
  GenderErrorCode,
} from "../../../enums/errorCodes";

export const accountSettingsContactErrorCodeToStringKeys: {
  [key in AccountSettingsContactErrorCode]: string;
} = {
  [AccountSettingsContactErrorCode.AccountLocked]: "Label.ToolTip.PinLocked",
  [AccountSettingsContactErrorCode.InvalidSettingOption]: "Message.Error.InvalidSettingOption",
};

export const accountSettingsExperienceJoinSettingsErrorCodeToStringKeys: {
  [key in AccountSettingsExperienceJoinSettingsErrorCode]: string;
} = {
  [AccountSettingsExperienceJoinSettingsErrorCode.AccountLocked]: "Label.ToolTip.PinLocked",
  [AccountSettingsExperienceJoinSettingsErrorCode.InvalidPermission]:
    "Message.Error.InvalidSettingOption",
};

export const accountSettingsTradeSettingsErrorCodeToStringKeys: {
  [key in AccountSettingsTradeSettingsErrorCode]: string;
} = {
  [AccountSettingsTradeSettingsErrorCode.AccountLocked]: "Label.ToolTip.PinLocked",
  [AccountSettingsTradeSettingsErrorCode.InvalidTradeValue]: "Message.Error.InvalidSettingOption",
  [AccountSettingsTradeSettingsErrorCode.InvalidTradePrivacy]: "Message.Error.InvalidSettingOption",
  [AccountSettingsTradeSettingsErrorCode.UserCannotTrade]: "Message.Error.UserCannotTrade",
};

export const accountSettingsEmailErrorCodeToStringKeys: {
  [key in EmailErrorCode]: string;
} = {
  [EmailErrorCode.Unknown]: "Message.Error.Email.Unknown",
  [EmailErrorCode.PinLocked]: "Message.Error.Email.PinLocked",
  [EmailErrorCode.FeatureDisabled]: "Message.Error.Email.FeatureDisabled",
  [EmailErrorCode.TooManyAccounts]: "Message.Error.Email.TooManyAccounts",
  [EmailErrorCode.SameEmail]: "Message.Error.Email.SameEmail",
  [EmailErrorCode.AlreadyVerified]: "Message.Error.Email.AlreadyVerified",
  [EmailErrorCode.TooManyUpdates]: "Message.Error.Email.TooManyUpdates",
  [EmailErrorCode.TooManyVerify]: "Message.Error.Email.TooManyVerify",
  [EmailErrorCode.IncorrectPassword]: "Message.Error.Email.IncorrectPassword",
  [EmailErrorCode.InvalidEmail]: "Message.Error.Email.InvalidEmail",
  [EmailErrorCode.NoEmailAssociated]: "Message.Error.Email.NoEmailAssociated",
  [EmailErrorCode.RequiresCorpNetwork]: "Message.Error.Email.RequiresCorpNetwork",
};

export const contactsErrorCodeToStringKeys: {
  [key in ContactsErrorCode]: string;
} = {
  [ContactsErrorCode.TooManyRequests]: "Message.Error.TooManyRequests",
};

export const blockUserErrorCodeToStringKeys: {
  [key in BlockUserErrorCode]: string;
} = {
  [BlockUserErrorCode.TargetNotBlocked]: "Message.Error.BlockUser.TargetNotBlocked",
  [BlockUserErrorCode.TargetBlockedOnPlatform]: "Message.Error.BlockUser.TargetBlockedOnPlatform",
};

export const promotionChannelsErrorCodeToStringKeys: {
  [key in PromotionChannelsErrorCode]: string;
} = {
  [PromotionChannelsErrorCode.InvalidFacebookUrl]: "Message.Error.InvalidFacebookUrl",
  [PromotionChannelsErrorCode.InvalidXTwitterUrl]: "Message.Error.InvalidXTwitterHandle",
  [PromotionChannelsErrorCode.InvalidYoutubeUrl]: "Message.Error.InvalidYouTubeUrl",
  [PromotionChannelsErrorCode.InvalidTwitchUrl]: "Message.Error.InvalidTwitchUrl",
  [PromotionChannelsErrorCode.InvalidGuildedUrl]: "Message.Error.InvalidGuildedUrl",
};

export const changePasswordErrorCodeToStringKeys: {
  [key in ChangePasswordErrorCode]: string;
} = {
  [ChangePasswordErrorCode.Unknown]: "Message.Error.Default",
  [ChangePasswordErrorCode.TooManyRequests]: "MessageTooManyAttemptsError",
  [ChangePasswordErrorCode.InvalidPassword]: "Response.Dialog.InvalidPasswordError",
  [ChangePasswordErrorCode.InvalidCurrentPassword]:
    "Response.Dialog.ChangePasswordIncorrectPassword",
  [ChangePasswordErrorCode.PinLocked]: "MessagePinLockedError",
};

export const usernameValidateErrorCodeToStringKeys: {
  [key in UsernameValidateErrorCode]: string;
} = {
  [UsernameValidateErrorCode.AlreadyTaken]: "Response.UsernameAlreadyInUse",
  [UsernameValidateErrorCode.CantBeUsed]: "Response.BadUsername",
  [UsernameValidateErrorCode.InvalidLengthError]: "Response.UsernameInvalidLength",
  [UsernameValidateErrorCode.StartsOrEndsWithUnderscoreError]: "Response.UsernameInvalidUnderscore",
  [UsernameValidateErrorCode.TooManyUnderscoresError]: "Response.UsernameTooManyUnderscores",
  [UsernameValidateErrorCode.ContainsSpacesError]: "Response.SpaceOrSpecialCharaterError",
  [UsernameValidateErrorCode.InvalidCharactersError]: "Response.UsernameAllowedCharactersError",
  [UsernameValidateErrorCode.CantBeUsedPII]: "Response.UsernamePrivateInfo",
  [UsernameValidateErrorCode.ContainsReservedUsernameError]: "Response.UsernameNotAvailable",
};

export const usernameResponseErrorCodeToStringKeys: {
  [key in UsernameResponseErrorCode]: string;
} = {
  [UsernameResponseErrorCode.InvalidUsername]: "Response.SpaceOrSpecialCharaterError",
};

export const genderErrorCodeToStringKeys: {
  [key in GenderErrorCode]: string;
} = {
  [GenderErrorCode.PinLocked]: "Label.ToolTip.PinLocked",
  [GenderErrorCode.InvalidGender]: "Message.Error.InvalidSettingOption",
};
