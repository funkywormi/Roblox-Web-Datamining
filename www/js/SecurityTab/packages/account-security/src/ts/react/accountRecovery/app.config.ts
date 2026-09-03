import { TranslationConfig } from "react-utilities";

export const FEATURE_NAME = "Account Recovery" as const;
export const LOG_PREFIX = "Account Recovery:" as const;

export const VERIFICATION_CODE_LENGTH = 6;
export const BACKUP_CODE_LENGTH = 9;
export const REGEX_CODE = /^[0-9]*$/;
export const SECONDS_BETWEEN_RESENDS = 30;

export const CHALLENGE_CONTAINER_ID = "account-recovery-challenge-container";

export const EVENT_CONSTANTS = {
  eventName: "accountSecurityFrontendAccountRecoveryEvent",
  context: {
    pageLoad: "pageLoad",
    recoveryInitializedFromAutofill: "recoveryInitializedFromAutofill",
    identifierSent: "identifierSent",
    contactMethodSent: "contactMethodSent",
    userSelected: "userSelected",
    passwordReset: "passwordReset",
  },
} as const;

/**
 * Translations required by this web app (remember to also edit
 * `bundle.config.js` if changing this configuration).
 */
export const TRANSLATION_CONFIG: TranslationConfig = {
  common: [],
  feature: "Authentication.AccountRecovery",
};

/**
 * Language resource keys for Account Recovery.
 */
export const ACCOUNT_RECOVERY_LANGUAGE_RESOURCES = [
  "Action.AddAPasskey",
  "Action.Continue",
  "Action.Delete",
  "Action.Next",
  "Action.Ok",
  "Action.ResetPassword",
  "Action.Save",
  "Action.SendCode",
  "Action.SkipAddingPasskey",
  "Action.UpdatePassword",
  "Action.CreateNewPassword",
  "Action.UseEmail",
  "Action.UseEmailPhone",
  "Action.UsePhone",
  "Action.UseBackupCode",
  "Description.AccountSuccessfullyRecovered",
  "Description.AddPasskeyOrCreatePassword",
  "Description.ChooseSecurityMethod",
  "Description.CreatePasswordOrAddPasskey",
  "Description.CannotRecoverAccount",
  "Description.DeviceDoesNotSupportPasskey",
  "Description.EnhancedProtectionAddPasskey",
  "Description.ChooseAccount",
  "Description.CreateNewPassword",
  "Description.CreateNewPasswordAddEmail",
  "Description.EmailCodeSent",
  "Description.EmailCodeSentForUser",
  "Description.EnterABackupCode",
  "Description.EnterContactMethodAssociatedWithYourAccount",
  "Description.EnterEmailAddress",
  "Description.EnterPhoneNumberSecondMethod",
  "Description.EnterPhoneOrAnotherEmail",
  "Description.KeepTwoStepMethodDynamic",
  "Description.PhoneCodeSent",
  "Description.PhoneCodeSentForUser",
  "Description.SendCodeContactMethodConfirmation",
  "Description.SaveTwoStepMethod",
  "Description.SomethingWentWrongVerifyAgain",
  "Description.TrustedLocationResetPassword",
  "Description.TrustedLocationResetPasswordSkip2SV",
  "Description.TrustedLocationSkip2SV",
  "Description.UpdateEmailConfirmation",
  "Description.VerifyAgain",
  "Heading.CannotRecoverAccount",
  "Heading.EnhancedProtectionProgramPostRecoveryNoPasskey",
  "Heading.EnhancedProtectionPostRecoveryPasskey",
  "Heading.ProtectYourAccount",
  "Heading.RecoverYourAccount",
  "Heading.RecoverySuccess",
  "Heading.ResetPassword",
  "Heading.RobloxAccountRecovery",
  "Heading.SaveTwoStepMethod",
  "Heading.UpdateEmail",
  "Label.AddEmail",
  "Label.Authenticator2sv",
  "Label.BackupCode",
  "Label.ConfirmNewPasswordV2",
  "Label.DoNotUseOldPassword",
  "Label.Email2sv",
  "LabelEmail",
  "Label.EmailPhone",
  "LabelPhone",
  "Label.EnterCode",
  "Label.EnterYourUsernameEmailPhone",
  "Label.NewPasswordV2",
  "Label.PreviousContactMethodVerification",
  "Label.ResendCode",
  "Label.ResendCodeTimer",
  "Label.SecurityKey2sv",
  "Label.SixDigitCode",
  "Label.UsernameEmailPhone",
  "Message.Error.AccountNotFound",
  "Message.Error.InvalidCode",
  "Message.Error.InvalidEmail",
  "Message.Error.InvalidEmailOrPhone",
  "Message.Error.InvalidPassword",
  "Message.Error.TooManyRequests",
  "Message.Error.TryADifferentOne",
  "Message.Error.PasskeyRegistrationError",
  "MessagePasswordsDoNotMatch",
  "MessageUnknownError",
  "Response.PasswordBadLength",
  "Response.PasswordComplexity",
  "Response.PasswordContainsUsernameError",
  "Heading.EnterSecondMethod",
  "Heading.PasskeyUpsellTitle",
  "Heading.PasskeyUpsellSubtitle",
  "Heading.PasskeyUpsellModalTitle",
  "Heading.PasskeyUpsellModalSubtitle",
  "Label.AddPasskey",
  "Label.Or",
  "Label.PasskeyAdded",
  "Label.SkipPasskey",
] as const;
