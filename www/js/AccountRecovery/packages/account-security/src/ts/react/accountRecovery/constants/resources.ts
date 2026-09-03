import { PasswordResetError } from "../../../common/request/types/auth";
import { AccountRecoveryError } from "../../../common/request/types/accountRecovery";
import { ACCOUNT_RECOVERY_LANGUAGE_RESOURCES } from "../app.config";

/**
 * A type adapted from the base type of `translate`, which we use to limit the
 * keys that can be translated.
 */
type TranslateFunction = (
  resourceId: (typeof ACCOUNT_RECOVERY_LANGUAGE_RESOURCES)[number],
  parameters?: Record<string, unknown>,
) => string;

// IMPORTANT: Add resource keys to `app.config.ts` as well.
export const getResources = (translate: TranslateFunction) =>
  ({
    Action: {
      AddAPasskey: translate("Action.AddAPasskey"),
      AddProtection: translate("Action.AddProtection"),
      Continue: translate("Action.Continue"),
      Delete: translate("Action.Delete"),
      DeleteAll: translate("Action.DeleteAll"),
      DontDeleteCredentials: translate("Action.DontDeleteCredentials"),
      Next: translate("Action.Next"),
      Ok: translate("Action.Ok"),
      ResetPassword: translate("Action.ResetPassword"),
      Save: translate("Action.Save"),
      SendCode: translate("Action.SendCode"),
      SkipAddingPasskey: translate("Action.SkipAddingPasskey"),
      UpdatePassword: translate("Action.UpdatePassword"),
      CreateNewPassword: translate("Action.CreateNewPassword"),
      UseEmail: translate("Action.UseEmail"),
      UseEmailPhone: translate("Action.UseEmailPhone"),
      UsePhone: translate("Action.UsePhone"),
      UseBackupCode: translate("Action.UseBackupCode"),
    },
    Description: {
      AccountSecuredConfirmationWeb: translate("Description.AccountSecuredConfirmationWeb"),
      ChooseAccount: translate("Description.ChooseAccount"),
      DeviceDoesNotSupportPasskey: translate("Description.DeviceDoesNotSupportPasskey"),
      EnhancedProtectionAddPasskey: (lineBreak: string) =>
        translate("Description.EnhancedProtectionAddPasskey", { lineBreak }),
      CreateNewPassword: translate("Description.CreateNewPassword"),
      CreateNewPasswordAddEmail: translate("Description.CreateNewPasswordAddEmail"),
      EmailCodeSent: translate("Description.EmailCodeSent"),
      EmailCodeSentForUser: translate("Description.EmailCodeSentForUser"),
      EmailUnavailableInfo: translate("Description.EmailUnavailableInfo"),
      EnterABackupCode: translate("Description.EnterABackupCode"),
      EnterContactMethodAssociatedWithYourAccount: translate(
        "Description.EnterContactMethodAssociatedWithYourAccount",
      ),
      EnterContactMethodAssociatedWithYourAccountV2: translate(
        "Description.EnterContactMethodAssociatedWithYourAccount.V2",
      ),
      EnterEmailAddress: translate("Description.EnterEmailAddress"),
      EnterPhoneNumberSecondMethod: translate("Description.EnterPhoneNumberSecondMethod"),
      EnterPhoneOrAnotherEmail: translate("Description.EnterPhoneOrAnotherEmail"),
      InvalidateCredentialInfo: translate("Description.InvalidateCredentialInfo"),
      InvalidateCredentialsIntro: translate("Description.InvalidateCredentialsIntro"),
      InvalidateCredentialsWarning: translate("Description.InvalidateCredentialsWarning"),
      KeepTwoStepMethodDynamic: (twoStepMethod: string) =>
        translate("Description.KeepTwoStepMethodDynamic", { twoStepMethod }),
      NoChangesMade: translate("Description.NoChangesMade"),
      PhoneCodeSent: translate("Description.PhoneCodeSent"),
      PhoneCodeSentForUser: translate("Description.PhoneCodeSentForUser"),
      SendCodeContactMethodConfirmation: translate("Description.SendCodeContactMethodConfirmation"),
      SaveTwoStepMethod: translate("Description.SaveTwoStepMethod"),
      SomethingWentWrongVerifyAgain: translate("Description.SomethingWentWrongVerifyAgain"),
      VerifyRecoveryIntent: translate("Description.VerifyRecoveryIntent"),
      VerifyRecoveryIntentPolling: translate("Description.VerifyRecoveryIntentPolling"),
      TrustedLocationResetPassword: (username: string) =>
        translate("Description.TrustedLocationResetPassword", { username }),
      TrustedLocationResetPasswordSkip2SV: (username: string) =>
        translate("Description.TrustedLocationResetPasswordSkip2SV", { username }),
      TrustedLocationSkip2SV: (username: string) =>
        translate("Description.TrustedLocationSkip2SV", { username }),
      UpdateEmailConfirmation: (email: string) =>
        translate("Description.UpdateEmailConfirmation", { email }),
      VerifyAgain: translate("Description.VerifyAgain"),
      AccountSuccessfullyRecovered: translate("Description.AccountSuccessfullyRecovered"),
      AddPasskeyOrCreatePassword: translate("Description.AddPasskeyOrCreatePassword"),
      ChooseSecurityMethod: translate("Description.ChooseSecurityMethod"),
      CreatePasswordOrAddPasskey: translate("Description.CreatePasswordOrAddPasskey"),
      CannotRecoverAccount: translate("Description.CannotRecoverAccount"),
    },
    Heading: {
      AccountSecuredConfirmation: translate("Heading.AccountSecuredConfirmation"),
      BackupCodesGenerated: translate("Heading.BackupCodesGenerated"),
      BillingEmailAdded: translate("Heading.BillingEmailAdded"),
      EmailAdded: translate("Heading.EmailAdded"),
      EnhancedProtectionProgramPostRecoveryNoPasskey: translate(
        "Heading.EnhancedProtectionProgramPostRecoveryNoPasskey",
      ),
      EnhancedProtectionPostRecoveryPasskey: translate(
        "Heading.EnhancedProtectionPostRecoveryPasskey",
      ),
      EnrolledInEnhancedProtection: translate("Heading.EnrolledInEnhancedProtection"),
      EnterSecondMethod: translate("Heading.EnterSecondMethod"),
      InvalidateCredential: translate("Heading.InvalidateCredential"),
      InvalidateCredentials: translate("Heading.InvalidateCredentials"),
      NoChangesMade: translate("Heading.NoChangesMade"),
      PasskeyAdded: translate("Heading.PasskeyAdded"),
      PhoneNumberAdded: translate("Heading.PhoneNumberAdded"),
      TwoStepMethodAdded: (value: string) => translate("Heading.TwoStepMethodAdded", { value }),
      ProtectYourAccount: translate("Heading.ProtectYourAccount"),
      RecoverYourAccount: translate("Heading.RecoverYourAccount"),
      RecoverySuccess: translate("Heading.RecoverySuccess"),
      ResetPassword: translate("Heading.ResetPassword"),
      RobloxAccountRecovery: translate("Heading.RobloxAccountRecovery"),
      UpdateEmail: translate("Heading.UpdateEmail"),
      PasskeyUpsellTitle: translate("Heading.PasskeyUpsellTitle"),
      PasskeyUpsellSubtitle: translate("Heading.PasskeyUpsellSubtitle"),
      PasskeyUpsellModalTitle: translate("Heading.PasskeyUpsellModalTitle"),
      PasskeyUpsellModalSubtitle: translate("Heading.PasskeyUpsellModalSubtitle"),
      SaveTwoStepMethod: translate("Heading.SaveTwoStepMethod"),
      CannotRecoverAccount: translate("Heading.CannotRecoverAccount"),
    },
    Label: {
      Authenticator2sv: translate("Label.Authenticator2sv"),
      Authenticator2svCapitalized: translate("Label.Authenticator2svCapitalized"),
      Email2sv: translate("Label.Email2sv"),
      Email2svCapitalized: translate("Label.Email2svCapitalized"),
      EmailUnavailable: translate("Label.EmailUnavailable"),
      Email: translate("LabelEmail"),
      AddEmail: translate("Label.AddEmail"),
      BackupCode: translate("Label.BackupCode"),
      ConfirmNewPasswordV2: translate("Label.ConfirmNewPasswordV2"),
      DoNotUseOldPassword: translate("Label.DoNotUseOldPassword"),
      EmailPhone: translate("Label.EmailPhone"),
      EmailPhoneRecoveryAccount: translate("Label.EmailPhoneRecoveryAccount"),
      Phone: translate("LabelPhone"),
      EnterCode: translate("Label.EnterCode"),
      EnterYourUsernameEmailPhone: translate("Label.EnterYourUsernameEmailPhone"),
      NewPasswordV2: translate("Label.NewPasswordV2"),
      PreviousContactMethodVerification: (contactMethod: string) =>
        translate("Label.PreviousContactMethodVerification", { contactMethod }),
      ResendCode: translate("Label.ResendCode"),
      ResendCodeTimer: (timeLeft: number) => translate("Label.ResendCodeTimer", { timeLeft }),
      SecurityKey2sv: translate("Label.SecurityKey2sv"),
      SecurityKey2svCapitalized: translate("Label.SecurityKey2svCapitalized"),
      SixDigitCode: translate("Label.SixDigitCode"),
      UsernameEmailPhone: translate("Label.UsernameEmailPhone"),
      AddPasskey: translate("Label.AddPasskey"),
      Or: translate("Label.Or"),
      PasskeyAdded: translate("Label.PasskeyAdded"),
      SkipPasskey: translate("Label.SkipPasskey"),
    },
    Message: {
      Error: {
        AccountNotFound: translate("Message.Error.AccountNotFound"),
        InvalidCode: translate("Message.Error.InvalidCode"),
        InvalidEmail: translate("Message.Error.InvalidEmail"),
        InvalidEmailOrPhone: translate("Message.Error.InvalidEmailOrPhone"),
        InvalidEmailOrPhoneOrRecoveryAccount: translate(
          "Message.Error.InvalidEmailOrPhoneOrRecoveryAccount",
        ),
        InvalidPassword: translate("Message.Error.InvalidPassword"),
        RecoveryIntentDenied: translate("Message.Error.RecoveryIntentDenied"),
        TooManyRequests: translate("Message.Error.TooManyRequests"),
        TryADifferentOne: translate("Message.Error.TryADifferentOne"),
        PasskeyRegistrationError: translate("Message.Error.PasskeyRegistrationError"),
      },
      PasswordsDoNotMatch: translate("MessagePasswordsDoNotMatch"),
      RecoveryIntentPending: translate("Message.RecoveryIntentPending"),
      UnknownError: translate("MessageUnknownError"),
    },
    Response: {
      PasswordBadLength: translate("Response.PasswordBadLength"),
      PasswordComplexity: translate("Response.PasswordComplexity"),
      PasswordContainsUsernameError: translate("Response.PasswordContainsUsernameError"),
    },
  }) as const;

export type AccountRecoveryResources = ReturnType<typeof getResources>;

export const mapAccountRecoveryErrorToResource = (
  resources: AccountRecoveryResources,
  error: AccountRecoveryError | null,
): string => {
  switch (error) {
    case AccountRecoveryError.UNKNOWN:
      return resources.Message.UnknownError;

    case AccountRecoveryError.IDENTIFIER_INVALID:
      return resources.Message.Error.AccountNotFound;

    case AccountRecoveryError.TOO_MANY_REQUESTS:
      return resources.Message.Error.TooManyRequests;

    case AccountRecoveryError.INVALID_CODE:
      return resources.Message.Error.InvalidCode;

    case AccountRecoveryError.TRY_A_DIFFERENT_CONTACT_METHOD:
      return resources.Message.Error.TryADifferentOne;

    default:
      return resources.Message.UnknownError;
  }
};

export const mapPasswordErrorToResource = (
  resources: AccountRecoveryResources,
  error: string,
): string => {
  switch (error) {
    case "Response.PasswordBadLength":
      return resources.Response.PasswordBadLength;
    case "Response.PasswordComplexity":
      return resources.Response.PasswordComplexity;
    case "Response.PasswordContainsUsernameError":
      return resources.Response.PasswordContainsUsernameError;
    default:
      return resources.Message.UnknownError;
  }
};

export const mapPasswordResetErrorToResource = (
  resources: AccountRecoveryResources,
  error: PasswordResetError | null,
): string => {
  switch (error) {
    case PasswordResetError.UNKNOWN:
      return resources.Message.UnknownError;
    case PasswordResetError.FLOODED:
      return resources.Message.Error.TooManyRequests;
    case PasswordResetError.INVALID_PASSWORD:
      return resources.Message.Error.InvalidPassword;
    case PasswordResetError.PASSWORDS_DO_NOT_MATCH:
      return resources.Message.PasswordsDoNotMatch;
    default:
      return resources.Message.UnknownError;
  }
};
