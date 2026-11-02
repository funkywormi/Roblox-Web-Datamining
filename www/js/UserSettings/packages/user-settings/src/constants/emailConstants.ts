import { EnvironmentUrls } from "@rbx/core-scripts/legacy/Roblox";
import { EmailErrorCode } from "../enums/emailErrorCodes";

export const emailRegex = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

/** Wait after POST before callers refetch account info, as the email takes a while to settle. */
export const emailSettleDelayMs = 1000;

export const emailErrorCodeToTranslationKey: Record<EmailErrorCode, string> = {
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

export const unknownErrorTranslationKey = "MessageUnknownError";
export const closeTranslationKey = "Action.Dialog.Close";
export const invalidEmailTranslationKey = "Response.Dialog.InvalidEmailAddress";
export const enterEmailTranslationKey = "Label.EnterEmail";

export const emailMarketingConsentName = "allowMarketingEmailCheckboxEmailVerification";
export const emailMarketingConsentSurface = "email-marketing-checkbox-during-email-verification";

export const getUpdateEmailUrl = (): string => `${EnvironmentUrls.accountSettingsApi}/v1/email`;
