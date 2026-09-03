import * as TwoStepVerificationApiTypes from "../../../common/request/types/twoStepVerification";
import * as EmailApiTypes from "../../../common/request/types/email";
import * as PhoneApiTypes from "../../../common/request/types/phone";
import { ACCOUNT_SETTINGS_LANGUAGE_RESOURCES } from "../app.config";

/**
 * A type adapted from the base type of `translate`, which we use to limit the
 * keys that can be translated.
 */
type TranslateFunction = (
  resourceId: (typeof ACCOUNT_SETTINGS_LANGUAGE_RESOURCES)[number],
  parameters?: Record<string, unknown>,
) => string;

// IMPORTANT: Add resource keys to `app.config.ts` as well.
export const getPersonalizedResources = (translate: TranslateFunction, isUnder13: boolean) =>
  ({
    Action: {
      Add: translate("Action.Add") || "Add",
      AddSecurityKey: translate("Action.AddSecurityKey"),
      AddPasskey: translate("Action.AddPasskey"),
      DeleteSecurityKey: translate("Action.DeleteSecurityKey"),
      Dialog: {
        AddEmail: translate("Action.Dialog.AddEmail"),
        AddPhone: translate("Action.Dialog.AddPhone"),
        AuthenticatorHelpMessage: translate("Action.Dialog.AuthenticatorHelpMessage"),
        AuthenticatorSetupViewManualEntryKey: translate(
          "Action.Dialog.AuthenticatorSetupViewManualEntryKey",
        ),
        AuthenticatorSetupViewQRCode: translate("Action.Dialog.AuthenticatorSetupViewQRCode"),
        Cancel: translate("Action.Dialog.Cancel"),
        Close: translate("Action.Dialog.Close"),
        Continue: translate("Action.Dialog.Continue"),
        EditEmail: translate("Action.Dialog.EditEmail") || "Edit Email",
        EditPhone: translate("Action.Dialog.EditPhonePrimary"),
        EnterPhoneNumber: translate("Action.Dialog.EnterPhoneNumber") || "Enter phone number",
        EnterSentCode: (codeSentLocation: string) =>
          translate("Action.Dialog.EnterSentCode", {
            codeSentLocation,
          }) || `Enter the code we just sent to ${codeSentLocation}`,
        ForgotYourPassword: translate("Action.Dialog.ForgotYourPassword"),
        PendingEmailVerification:
          translate("Action.Dialog.PendingEmailVerification") || "Pending email verification",
        ResendCode: translate("Action.Dialog.ResendCode") || "Resend code",
        ResendCodeWithTimer: (seconds: number) =>
          translate("Action.Dialog.ResendCodeWithTimer", { seconds }) ||
          `Resend code in (${seconds}s)`,
        SixDigitCode: translate("Action.Dialog.SixDigitCode") || "6-digit code",
        Success: translate("Action.Dialog.Success"),
        Verify: translate("Action.Dialog.Verify"),
        VerifyCode: translate("Action.Dialog.VerifyCode") || "Verify Code",
      },
      Clear: translate("Action.Clear") || "Clear",
      Create: translate("Action.Create") || "Create",
      Delete: translate("Action.Delete") || "Delete",
      Done: translate("Action.Done"),
      Edit: translate("Action.Edit") || "Edit",
      CreateAgain: translate("Action.CreateAgain") || "Create again",
      EnableEnhancedProtectionProgram:
        translate("Action.EnableEnhancedProtectionProgram") ||
        "Enroll in Enhanced Protection Program",
      Generate: translate("Action.Generate"),
      ManagePasskey: translate("Action.ManagePasskey"),
      SocialDisconnect: translate("Action.SocialDisconnect"),
      TurnOff: translate("Action.TurnOff"),
      TurnOffEnhancedProtectionProgram:
        translate("Action.TurnOffEnhancedProtectionProgram") || "Turn off Enhanced Protection",
    },
    Body: {
      Enrolled: translate("Body.Enrolled"),
      Unenrolled: translate("Body.Unenrolled"),
    },
    Description: {
      ClearRecoveryCodesWarning:
        translate("Description.ClearRecoveryCodesWarning") ||
        "Are you sure you want to clear your recovery codes?",
      EnhancedProtectionProgram: translate("Description.EnhancedProtectionProgram"),
      CardEnhancedProtectionProgramDetails:
        translate("Description.CardEnhancedProtectionProgramDetails") ||
        "Add email, phone number, and at least 1 passkey to turn on. These allow you to recover your account safely if needed.",
      Dialog: {
        AuthenticatorSetupManualEntryKey: translate(
          "Description.Dialog.AuthenticatorSetupManualEntryKey",
        ),
        AuthenticatorSetupQRCode: translate("Description.Dialog.AuthenticatorSetupQRCode"),
        EnterYourPassword: translate("Description.Dialog.EnterYourPassword"),
        MissingEmailTwoStepVerification: translate(
          isUnder13
            ? "Description.Dialog.MissingEmailTwoStepVerificationU13"
            : "Description.Dialog.MissingEmailTwoStepVerification",
        ),
        MissingPhoneTwoStepVerification: translate(
          "Description.Dialog.MissingPhoneTwoStepVerification",
        ),
        ChangeEmailWarning: translate("Description.Dialog.ChangeEmailWarning"),
        RecoveryCodesGenerated: translate("Description.Dialog.RecoveryCodesGenerated"),
        SmsInstructions:
          translate("Description.Dialog.SmsInstructions") ||
          "You will receive a one-time verification code via WhatsApp or SMS. Message and data rates may apply.",
        ShortCodeLegalDisclaimer: translate("Description.Dialog.ShortCodeLegalDisclaimer", {
          linkTagWithSmsTos:
            '<a href="https://en.help.roblox.com/hc/articles/9483830673556-Roblox-SMS-Terms-of-Service">',
          linkTagWithPrivacyPolicy:
            '<a href="https://en.help.roblox.com/hc/articles/115004630823">',
          linkTagEnd: "</a>",
        }),
        UnverifiedEmailOrPhoneTwoStepVerification: translate(
          "Description.Dialog.UnverifiedEmailOrPhoneTwoStepVerification",
        ),
      },
      SecurityKey: {
        AuthenticatorOff: translate("Description.SecurityKey.AuthenticatorOff"),
        AuthenticatorDeletion: translate("Description.SecurityKey.Delete"),
        AuthenticatorDeletionAlternate: translate("Description.SecurityKey.DeleteWarning"),
        DeleteSuccess: (deletedKeyList: string) =>
          translate("Description.SecurityKey.DeleteSuccess", { deletedKeyList }),
        Deletion: translate("Description.SecurityKey.Deletion"),
        NameKey: translate("Description.SecurityKey.NameKey"),
        Register2SV: translate("Description.SecurityKey.Register2SV"),
        SetupError: translate("Description.SecurityKey.SetupError"),
        Warning: translate("Description.SecurityKey.Warning"),
        WebOnly: translate("Description.SecurityKey.WebOnly"),
      },
      SecurityWarning: (boldStart: string, boldEnd: string) =>
        translate("Description.SecurityWarning", { boldStart, boldEnd }),
      SecurityWarningShort: (boldStart: string, boldEnd: string) =>
        translate("Description.SecurityWarningShort", { boldStart, boldEnd }),
      SmsTwoStepVerificationSecondaryEnabled: (phoneNumber: string) =>
        translate("Description.SmsTwoStepVerificationSecondaryEnabled", { phoneNumber }),
      TurnOffEnhancedProtectionProgram: translate("Description.TurnOffEnhancedProtectionProgram"),
      TurnOnLowerSecurity2SVMethod: translate("Description.TurnOnLowerSecurity2SVMethod"),
      TwoStepVerificationSecondaryEnabled: (email: string) =>
        translate("Description.TwoStepverificationSecondaryEnabled", { email }),
    },
    Heading: {
      ClearRecoveryCodes: translate("Heading.ClearRecoveryCodes") || "Clear Recovery Codes",
      DeleteSecurityKey: translate("Heading.DeleteSecurityKey"),
      DeleteSecurityKeySuccess: translate("Heading.DeleteSecurityKeySuccess"),
      Dialog: {
        AreYouSure: translate("Heading.Dialog.AreYouSure"),
        AuthenticatorSetup: translate("Heading.Dialog.AuthenticatorSetup"),
        DefaultError: translate("Heading.Dialog.DefaultError"),
        OneOptionAtATime: translate("Heading.Dialog.OneOptionAtATime"),
        PasswordVerification: translate("Heading.Dialog.PasswordVerification"),
        VerifiedEmailOrPhoneRequired: translate("Heading.Dialog.VerifiedEmailOrPhoneRequired"),
        VerifiedPhoneRequired: translate("Heading.Dialog.VerifiedPhoneRequired"),
      },
      GenerateNewRecoveryCodes: translate("Heading.GenerateNewRecoveryCodes"),
      ManageYourKeys: translate("Heading.ManageYourKeys"),
      NameSecurityKey: translate("Heading.NameSecurityKey"),
      PlayStation: translate("Heading.PlayStation"),
      RecoveryCodesGenerated: translate("Heading.RecoveryCodesGenerated"),
      RegisterSecurityKey: translate("Heading.RegisterSecurityKey"),
      EnhancedProtectionProgram: translate("Heading.EnhancedProtectionProgram"),
      Security: translate("Heading.Tab.Security"),
      SecurityKey: {
        SecurityKey: translate("Heading.SecurityKey"),
        SecurityKey2: translate("Heading.SecurityKey2"),
        PlatformNotSupported: translate("Heading.SecurityKey.PlatformNotSupported"),
      },
      SecurityKeyRegistered: translate("Heading.SecurityKeyRegistered"),
      SomethingWentWrong: translate("Heading.SomethingWentWrong"),
      TurnOnAuthenticator: translate("Heading.TurnOnAuthenticator"),
      TwoStepVerification: translate("Heading.TwoStepVerification"),
      Xbox: translate("Heading.Xbox"),
    },
    Label: {
      AuthenticatorDisabledHelpText: translate("Label.AuthenticatorDisabledHelpText"),
      AuthenticatorHelpText: translate("Label.AuthenticatorHelpText"),
      AuthenticatorTwoStepVerificationCodes: translate(
        "Label.AuthenticatorTwoStepVerificationCodes",
      ),
      Cancel: translate("Label.Cancel"),
      Dialog: {
        AuthenticatorSetupCodeInputPlaceholder: (codeLength: number) =>
          translate("Label.Dialog.AuthenticatorSetupCodeInputPlaceholder", { codeLength }),
        Confirm: translate("Label.Dialog.Confirm"),
        EmailRequired: translate("Label.Dialog.EmailRequired"),
        GenerateNewRecoveryCodesClearNotice: (activeCodeCount: number) =>
          translate("Label.Dialog.GenerateNewRecoveryCodesClearNotice", { activeCodeCount }),
        RecoveryCodesSavedConfirmation: translate("Label.Dialog.RecoveryCodesSavedConfirmation"),
        YourPassword: translate("Label.Dialog.YourPassword"),
      },
      DisableAuthenticator: {
        Acknowledge: translate("Label.DisableAuthenticator.Acknowledge"),
      },
      EmailTwoStepVerificationCodes: translate("Label.EmailTwoStepVerificationCodes"),
      EnterEmail: translate("Label.EnterEmail"),
      GenerateNewRecoveryCodes: translate("Label.GenerateNewRecoveryCodes"),
      GenerateRecoveryCodes: translate("Label.GenerateRecoveryCodes"),
      AddBothOfThese: translate("Label.AddBothOfThese") || "Add both of these:",
      BackupCodes: translate("Label.BackupCodes") || "Backup codes",
      BackupCodesDescription:
        translate("Label.BackupCodesDescription") || "Create and store codes.",
      ChooseOneOfThese: translate("Label.ChooseOneOfThese") || "Choose one of these:",
      DoNotShare: translate("Label.DoNotShare") || "Do not share your backup codes with anyone.",
      HavePasskeys: translate("Label.HavePasskeys"),
      HaveVerifiedEmail: translate("Label.HaveVerifiedEmail"),
      HaveVerifiedPhone: translate("Label.HaveVerifiedPhone"),
      Loading: translate("Label.Loading") || "Loading...",
      Manage: translate("Label.Manage"),
      None: translate("Label.DropDown.None"),
      NoneDescription: translate("Description.TwoStepVerificationNone"),
      NoneDescriptionNew: translate("Description.NewNoneDescription2SV"),
      PasskeyAdded: translate("Label.PasskeyAdded") || "Passkey added",
      AddPasskeyEnsureAccess:
        translate("Label.AddPasskeyEnsureAccess") || "Add a passkey you will always have access to",
      PasskeysAddedEnsureAccess: (passkeyCount: number) =>
        translate("Label.PasskeysAddedEnsureAccess", { passkeyCount }) ||
        `${passkeyCount} passkey(s) added. Make sure you will always have access to at least one of them`,
      PlayStationConnected: translate("Label.PlayStationConnected"),
      RecoveryCodesHelpText: translate("Label.RecoveryCodesHelpText"),
      SecurityKey: {
        SecurityKey: translate("Label.SecurityKey"),
        SecurityKeyAndAuthenticator: translate("Label.SecurityKeyAuthenticator"),
        BiometricKey: translate("Label.SecurityKey.BiometricKey"),
        Name: translate("Label.SecurityKey.Name"),
        PhysicalKey: translate("Label.SecurityKey.PhysicalKey"),
        RegisteredKey: (registeredKeysCount: number, totalKeysCount: number) =>
          translate("Label.SecurityKey.RegisteredKey", { registeredKeysCount, totalKeysCount }),
        RegisteredKeysAtCapacity: (registeredKeysCount: number, totalKeysCount: number) =>
          translate("Label.SecurityKey.RegisteredKeysAtCapacity", {
            registeredKeysCount,
            totalKeysCount,
          }),
        TurnOnAuthenticator: translate("Label.SecurityKey.TurnOnAuthenticator"),
      },
      SmsTwoStepPrerequisite: translate("Label.SmsTwoStepPrerequisite"),
      SmsTwoStepVerificationCodes: translate("Label.SmsTwoStepVerificationCodes"),
      TwoStepPrerequisite: translate("Label.TwoStepPrerequisite"),
      TwoStepVerificationDescription: translate("Label.TwoStepVerificationDescription"),
      TwoStepVerificationEmailWarningNew: translate("Label.TwoStepVerificationEmailWarningNew"),
      TwoStepVerificationPopUpEmailWarning: translate("Label.TwoStepVerificationPopUpEmailWarning"),
      TwoStepVerificationSingleMethodDescription: translate(
        "Label.TwoStepVerificationSingleMethodDescription",
      ),
      UnusedRecoveryCodes: (activeCodeCount: number) =>
        translate("Label.UnusedRecoveryCodes", { activeCodeCount }),
      Verify: translate("Label.Verify"),
      XboxConnected: translate("Label.XboxConnected"),
    },
    Message: {
      Error: {
        AlreadyEnabled: translate("Message.Error.AlreadyEnabled"),
        Email: {
          IncorrectPassword: translate("Message.Error.Email.IncorrectPassword"),
          PinLocked: translate("Message.Error.Email.PinLocked"),
        },
        EmailAlreadyRegisteredToAccount:
          translate("Message.Error.EmailAlreadyRegisteredToAccount") ||
          "Email already registered to account",
        ExceededRegisteredKeysLimit: translate("Message.Error.ExceededRegisteredKeysLimit"),
        InvalidCredentialNickname: translate("Message.Error.InvalidCredentialNickname"),
        InvalidEmail: translate("Message.Error.InvalidEmail") || "Invalid email",
        NoVerifiedEmail: translate("Message.Error.NoVerifiedEmail"),
        ReauthenticationRequired: translate("Message.Error.ReauthenticationRequired"),
        TooManyRequests: translate("Message.Error.TooManyRequests"),
      },
      ItemTradeTwoStepVerificationMessage: translate("Message.ItemTradeTwoStepVerificationMessage"),
      ManualKeyCopied: translate("Message.ManualKeyCopied"),
      ResaleTwoStepVerificationMessage: translate("Message.ResaleTwoStepVerificationMessage"),
      RobuxSpendTwoStepVerificationMessage: translate(
        "Message.RobuxSpendTwoStepVerificationMessage",
      ),
    },
    MessageUnknownError: translate("MessageUnknownError"),
    Response: {
      Dialog: {
        AuthenticatorSessionExpired: translate("Response.Dialog.AuthenticatorSessionExpired"),
        DefaultErrorMessage: translate("Response.Dialog.DefaultErrorMessage"),
        DisconnectPlayStationError: translate("Response.Dialog.DisconnectPlayStationError"),
        DisconnectXBoxError: translate("Response.Dialog.DisconnectXBoxError"),
        EnableTwoStepVerificationSingleMethodWarning: translate(
          "Response.Dialog.EnableTwoStepVerificationSingleMethodWarning",
        ),
        InvalidCodeError: translate("Response.Dialog.InvalidCodeError"),
        InvalidPhoneNumber: translate("Response.Dialog.InvalidPhoneNumber"),
        TwoStepDisableAdditionalWarningAuthenticator: translate(
          "Response.Dialog.TwoStepDisableAdditionalWarningAuthenticator",
        ),
        TwoStepDisableAdditionalWarningAuthenticatorGeneric: translate(
          "Response.Dialog.TwoStepDisableAdditionalWarningAuthenticatorGeneric",
        ),
        TwoStepDisableWarning: translate("Response.Dialog.TwoStepDisableWarning"),
        TwoStepDisableWarningAuthenticator: translate(
          "Response.Dialog.TwoStepDisableWarningAuthenticator",
        ),
        TwoStepDisableWarningEmail: translate("Response.Dialog.TwoStepDisableWarningEmail"),
        Warning: translate("Response.Dialog.Warning"),
        DeleteSecurityKeyWarning: translate("Response.Dialog.DeleteSecurityKeyWarning"),
      },
      FeatureDisabled: translate("Response.FeatureDisabled"),
      GeneralError: translate("Response.GeneralError"),
      PasskeyAlreadyCreated: translate("Response.PasskeyAlreadyCreated"),
      PasskeyCreatedSuccessfully: translate("Response.PasskeyCreatedSuccessfully"),
      PasskeyRemovedSuccessfully: translate("Response.PasskeyRemovedSuccessfully"),
      SuccessfulVerificationV2: translate("Response.SuccessfulVerificationV2"),
      VerificationError: translate("Response.VerificationError"),
    },
  }) as const;

export type SecurityTabResources = ReturnType<typeof getPersonalizedResources>;

export const mapTwoStepVerificationErrorToResource = (
  resources: SecurityTabResources,
  error: TwoStepVerificationApiTypes.TwoStepVerificationError | null,
): string => {
  switch (error) {
    case TwoStepVerificationApiTypes.TwoStepVerificationError.INVALID_EMAIL:
      return resources.Message.Error.NoVerifiedEmail;

    case TwoStepVerificationApiTypes.TwoStepVerificationError.INVALID_PASSWORD:
      return resources.Message.Error.Email.IncorrectPassword;

    case TwoStepVerificationApiTypes.TwoStepVerificationError.TOO_MANY_REQUESTS:
      return resources.Message.Error.TooManyRequests;

    case TwoStepVerificationApiTypes.TwoStepVerificationError.PIN_LOCKED:
      return resources.Message.Error.Email.PinLocked;

    case TwoStepVerificationApiTypes.TwoStepVerificationError.FEATURE_DISABLED:
      return resources.Response.FeatureDisabled;

    case TwoStepVerificationApiTypes.TwoStepVerificationError.INVALID_CODE:
      return resources.Response.Dialog.InvalidCodeError;

    case TwoStepVerificationApiTypes.TwoStepVerificationError.CONFIGURATION_ALREADY_ENABLED:
      return resources.Message.Error.AlreadyEnabled;

    case TwoStepVerificationApiTypes.TwoStepVerificationError.INVALID_SETUP_TOKEN:
      return resources.Response.Dialog.AuthenticatorSessionExpired;

    case TwoStepVerificationApiTypes.TwoStepVerificationError.REAUTHENTICATION_REQUIRED:
      return resources.Message.Error.ReauthenticationRequired;

    case TwoStepVerificationApiTypes.TwoStepVerificationError.INVALID_PHONE_NUMBER:
      return resources.Response.Dialog.InvalidPhoneNumber;

    case TwoStepVerificationApiTypes.TwoStepVerificationError.EXCEEDED_REGISTERED_KEYS_LIMIT:
      return resources.Message.Error.ExceededRegisteredKeysLimit;

    case TwoStepVerificationApiTypes.TwoStepVerificationError.INVALID_CREDENTIAL_NICKNAME:
      return resources.Message.Error.InvalidCredentialNickname;

    default:
      return resources.MessageUnknownError;
  }
};

export const mapEmailErrorToResource = (
  resources: SecurityTabResources,
  error: EmailApiTypes.EmailError,
): string => {
  switch (error) {
    case EmailApiTypes.EmailError.INVALID_EMAIL_ADDRESS:
      return resources.Message.Error.InvalidEmail;
    case EmailApiTypes.EmailError.UPDATED_EMAIL_IS_EXISTING_EMAIL:
      return resources.Message.Error.EmailAlreadyRegisteredToAccount;
    default: {
      return resources.MessageUnknownError;
    }
  }
};

export const mapPhoneErrorToResource = (
  resources: SecurityTabResources,
  error: PhoneApiTypes.UpdatePhoneError,
): string => {
  switch (error) {
    case PhoneApiTypes.UpdatePhoneError.INVALID:
      return resources.Response.Dialog.InvalidPhoneNumber;
    default: {
      return resources.MessageUnknownError;
    }
  }
};

export const mapPhoneVerificationErrorToResource = (
  resources: SecurityTabResources,
  error: PhoneApiTypes.VerifyCodeError,
): string => {
  switch (error) {
    case PhoneApiTypes.VerifyCodeError.INVALID:
      return resources.Response.Dialog.InvalidCodeError;
    default: {
      return resources.MessageUnknownError;
    }
  }
};

export const mapResendCodeErrorToResource = (
  resources: SecurityTabResources,
  error: PhoneApiTypes.ResendCodeError,
): string => {
  switch (error) {
    default: {
      return resources.MessageUnknownError;
    }
  }
};
