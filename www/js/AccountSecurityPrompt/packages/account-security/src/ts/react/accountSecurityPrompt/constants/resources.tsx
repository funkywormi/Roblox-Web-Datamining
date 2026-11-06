import React from "react";
import type { HtmlTag, Translator } from "@rbx/www-common/i18n";
import * as Email from "../../../common/request/types/email";
import * as Passwords from "../../../common/request/types/passwords";

const link = (href: string, opening = "linkStart", closing = "linkEnd"): HtmlTag => ({
  opening,
  closing,
  render: children => (
    <a href={href} className="text-link" target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
});

const BOLD_START = "\u0002";
const BOLD_END = "\u0003";

const renderBold = (text: string): React.ReactNode =>
  text.split(new RegExp(`(${BOLD_START}[^${BOLD_END}]*${BOLD_END})`)).map((part, index) =>
    part.startsWith(BOLD_START) ? (
      // Static translation segments do not reorder.
      // eslint-disable-next-line react/no-array-index-key
      <b key={index}>{part.slice(BOLD_START.length, -BOLD_END.length)}</b>
    ) : (
      part
    ),
  );

export const getPersonalizedResources = (
  translate: Translator<"Feature.AccountSecurityPrompt">,
  isUserUnder13: boolean,
) =>
  ({
    Action: {
      AbortDismissForeverAddEmail: translate("Action.AbortDismissForeverAddEmail"),
      AbortDismissForeverChangePassword: translate("Action.AbortDismissForeverChangePassword"),
      AccountRestoreOpenSettings: translate("Action.OpenSettings"),
      AuthenticatorUpsellSetupAuthenticatorButtonMessage: translate(
        "Label.AuthenticatorUpsellSetupAuthenticatorButtonMessage",
      ),
      AuthenticatorUpsellNextButtonMessage: translate(
        "Action.AuthenticatorUpsellNextButtonMessage",
      ),
      ChangeEmail: translate("Action.ChangeEmail"),
      ConfirmDismissForeverAddEmail: translate("Action.ConfirmDismissForeverAddEmail"),
      ConfirmDismissForeverChangePassword: translate("Action.ConfirmDismissForeverChangePassword"),
      ContinueAddEmail: translate("Action.ContinueAddEmail"),
      ContinueChangePassword: translate("Action.ContinueChangePassword"),
      DismissForever: translate("Action.DismissForever"),
      RemindMeLater: translate("Action.RemindMeLater"),
      ResendPasswordResetEmail: translate("Action.ResendPasswordResetEmail"),
      SecureAccount: translate("Action.SecureAccount"),
      SetUpAuthenticatorInBanner: translate("Action.SetUpAuthenticatorInBanner"),
      SetUpAuthenticatorAccountRestoresPolicyUpsell: translate(
        "Action.SetUpAuthenticatorAccountRestoresPolicyUpsell",
      ),
      SetUpEmail2SV: translate("Action.SetUpEmail2SV"),
      SubmitChangePassword: translate("Action.SubmitChangePassword"),
    },
    Message: {
      // Some of these messages show up elsewhere in `web-frontend`, but
      // there's no clean or convenient way to re-use them.
      Error: {
        /**
         * From `EmailErrors.cs` in the Account Settings API.
         */
        Email: {
          FeatureDisabled: translate("Message.Error.Email.FeatureDisabled"),
          TooManyAccountsOnEmail: translate("Message.Error.Email.TooManyAccountsOnEmail"),
          TooManyAttemptsToUpdateEmail: translate(
            "Message.Error.Email.TooManyAttemptsToUpdateEmail",
          ),
          InvalidEmailAddress: translate("Message.Error.Email.InvalidEmailAddress"),
          Default: translate("Message.Error.Email.Default"),
        },
        Input: {
          InvalidEmail: translate("Message.Error.Input.InvalidEmail"),
          PasswordsDoNotMatch: translate("Message.Error.Input.PasswordsDoNotMatch"),
        },
        /**
         * From `PasswordResponseCodes.cs` in the Authentication API.
         */
        Passwords: {
          Flooded: translate("Message.Error.Password.Flooded"),
          InvalidPassword: translate("Message.Error.Password.InvalidPassword"),
          InvalidCurrentPassword: translate("Message.Error.Password.InvalidCurrentPassword"),
          Default: translate("Message.Error.Password.Default"),
        },
        /**
         * From `PasswordResetError.cs` in the Authentication API.
         */
        PasswordReset: {
          UserDoesNotHaveEmail: translate("Message.Error.PasswordReset.UserDoesNotHaveEmail"),
          Default: translate("Message.Error.PasswordReset.Default"),
        },
        /**
         * From `PasswordValidationStatus.cs` in the Authentication API.
         */
        PasswordValidation: {
          WeakPassword: translate("Message.Error.PasswordValidation.WeakPassword"),
          ShortPassword: translate("Message.Error.PasswordValidation.ShortPassword"),
          PasswordSameAsUsername: translate(
            "Message.Error.PasswordValidation.PasswordSameAsUsername",
          ),
          ForbiddenPassword: translate("Message.Error.PasswordValidation.ForbiddenPassword"),
          DumbStrings: translate("Message.Error.PasswordValidation.DumbStrings"),
          Default: translate("Message.Error.PasswordValidation.Default"),
        },
        PromptAssignments: {
          Default: translate("Message.Error.PromptAssignments.Default"),
        },
      },
    },
    Description: {
      AccountRestoresPolicyUpdateV3: (accountSettingsSecurityDomain: string): React.ReactNode =>
        translate.html("Description.AccountRestoresPolicyUpdateV3", [
          link(accountSettingsSecurityDomain),
        ]),
      AccountRestoresPolicyUpsellMessageBody: (
        accountSettingsSecurityDomain: string,
      ): React.ReactNode =>
        translate.html("Description.AccountRestoresPolicyUpsellMessageBody", [
          link(accountSettingsSecurityDomain, "linkStartSettings", "linkEndSettings"),
        ]),
      AccountRestoresPolicyWithDate: (date: string): string =>
        translate("Description.AccountRestoresPolicyWithDate", { date }),
      AddYourEmail: translate(
        isUserUnder13 ? "Description.AddYourEmailUnder13" : "Description.AddYourEmail",
      ),
      AreYouSureDismissForeverAddEmail: translate(
        isUserUnder13
          ? "Description.AreYouSureDismissForeverAddEmailUnder13"
          : "Description.AreYouSureDismissForeverAddEmail",
      ),
      AreYouSureDismissForeverChangePassword: translate(
        "Description.AreYouSureDismissForeverChangePassword",
      ),
      AuthenticatorSetupPrompt: (helpSiteDomain: string): React.ReactNode =>
        translate.html("Description.AuthenticatorSetupPrompt", [link(helpSiteDomain)]),
      // Used for V2 of the policy banner:
      AuthenticatorSetupPromptNew: (helpSiteDomain: string): React.ReactNode =>
        translate.html("Description.AuthenticatorSetupPromptNew", [link(helpSiteDomain)]),
      ChangeYourPassword: translate("Description.ChangeYourPassword"),
      ChangeYourPasswordImmediately: translate("Description.ChangeYourPasswordImmediately"),
      ChangeYourPasswordSuccess: translate("Description.ChangeYourPasswordSuccess"),
      Email2SVUpsellMessageBody: (accountSettingsSecurityDomain: string): React.ReactNode =>
        translate.html("Description.Email2SVUpsellMessageBody", [
          link(accountSettingsSecurityDomain),
        ]),
      GenericTextOnlyBanner: (resourceId: string): string => translate.dynamic(resourceId),
      LearnMoreHere: (helpSiteDomain: string): React.ReactNode =>
        translate.html("Description.LearnMoreHere", [link(helpSiteDomain)]),
      NoChangeForceReset: (days: number): React.ReactNode =>
        // Medium-term, I will create a new text resource for the less than 1
        // day case (which is currently handled by interpolating a < sign).
        renderBold(
          translate(
            days <= 1 ? "Description.NoChangeForceResetSingular" : "Description.NoChangeForceReset",
            { days, boldStart: BOLD_START, boldEnd: BOLD_END },
          ).replace("1", days < 1 ? "< 1" : "1"),
        ),
      ReceiveSecurityCodesMessage: translate("Description.ReceiveSecurityCodesMessage"),
      UnusualActivity: translate("Description.UnusualActivity"),
    },
    Header: {
      AccountRestoresPolicyUpdate: translate("Header.AccountRestoresPolicyUpdate"),
      AccountRestoresPolicyUpdateV3: translate("Header.AccountRestoresPolicyUpdateV3"),
      AccountRestoresPolicyUpsell: translate("Header.AccountRestoresPolicyUpsell"),
      AddYourEmail: translate(isUserUnder13 ? "Header.AddYourEmailUnder13" : "Header.AddYourEmail"),
      AreYouSure: translate("Header.AreYouSure"),
      AuthenticatorUpsellDownloadAuthenticator: translate(
        "Header.AuthenticatorUpsellDownloadAuthenticator",
      ),
      AuthenticatorUpsellWelcomeMessage: translate("Header.AuthenticatorUpsellWelcomeMessage"),
      BoostYourAccountSecurity: translate("Header.BoostYourAccountSecurity"),
      ChangeYourPassword: translate("Header.ChangeYourPassword"),
      CheckYourEmail: translate(
        isUserUnder13 ? "Header.CheckYourEmailUnder13" : "Header.CheckYourEmail",
      ),
      CreateAStrongPassword: translate("Header.CreateAStrongPassword"),
      GenericTextOnlyBanner: (resourceId: string): string => translate.dynamic(resourceId),
      Email2SVUpsell: translate("Header.Email2SVUpsell"),
      KeepYourAccountSafeLong: translate("Header.KeepYourAccountSafeLong"),
      Success: translate("Header.Success"),
      UnusualActivityDetected: translate("Header.UnusualActivityDetected"),
      YourPasswordMightBeStolen: translate("Header.YourPasswordMightBeStolen"),
    },
    Label: {
      AtLeastCharacters: (count: number): string => translate("Label.AtLeastCharacters", { count }),
      AuthenticatorUpsellBadActorHeadline: translate("Label.AuthenticatorUpsellBadActorHeadline"),
      AuthenticatorUpsellBadActorMessage: translate("Label.AuthenticatorUpsellBadActorMessage"),
      AuthenticatorUpsellDownloadInstruction: translate(
        "Label.AuthenticatorUpsellDownloadInstruction",
      ),
      AuthenticatorUpsellGoogleOption: translate("Label.AuthenticatorUpsellGoogleOption"),
      AuthenticatorUpsellMicrosoftOption: translate("Label.AuthenticatorUpsellMicrosoftOption"),
      AuthenticatorUpsellProtectRobuxHeadline: translate(
        "Label.AuthenticatorUpsellProtectRobuxHeadline",
      ),
      AuthenticatorUpsellProtectRobuxMessage: translate(
        "Label.AuthenticatorUpsellProtectRobuxMessage",
      ),
      AuthenticatorUpsellTwilioOption: translate("Label.AuthenticatorUpsellTwilioOption"),
      AuthenticatorUpsellTwoFactorHeadline: translate("Label.AuthenticatorUpsellTwoFactorHeadline"),
      AuthenticatorUpsellTwoFactorMessage: translate("Label.AuthenticatorUpsellTwoFactorMessage"),
      ConfirmNewPassword: translate("Label.ConfirmNewPassword"),
      CurrentPassword: translate("Label.CurrentPassword"),
      IForgotMyPassword: translate("Label.IForgotMyPassword"),
      MinutesSeconds: (minutes: number, seconds: number): string =>
        translate("Label.MinutesSeconds", {
          minutes,
          seconds,
        }),
      NewPassword: translate("Label.NewPassword"),
      TimeRemaining: translate("Label.TimeRemaining"),
      UseAUniquePassword: translate("Label.UseAUniquePassword"),
      YourEmail: translate(isUserUnder13 ? "Label.YourEmailUnder13" : "Label.YourEmail"),
    },
    Response: {
      PasswordLowComplexity: translate("Response.PasswordLowComplexity"),
      PasswordTooSimilarToUsername: translate("Response.PasswordTooSimilarToUsername"),
    },
  }) as const;

export type AccountSecurityPromptResources = ReturnType<typeof getPersonalizedResources>;

export const mapEmailErrorToResource = (
  resources: AccountSecurityPromptResources,
  error: Email.EmailError | null,
): string => {
  switch (error) {
    case Email.EmailError.FEATURE_DISABLED:
      return resources.Message.Error.Email.FeatureDisabled;
    case Email.EmailError.TOO_MANY_ACCOUNTS_ON_EMAIL:
      return resources.Message.Error.Email.TooManyAccountsOnEmail;
    case Email.EmailError.TOO_MANY_ATTEMPTS_TO_UPDATE_EMAIL:
      return resources.Message.Error.Email.TooManyAttemptsToUpdateEmail;
    case Email.EmailError.INVALID_EMAIL_ADDRESS:
      return resources.Message.Error.Email.InvalidEmailAddress;
    default:
      return resources.Message.Error.Email.Default;
  }
};

export const mapPasswordErrorToResource = (
  resources: AccountSecurityPromptResources,
  error: Passwords.PasswordsError | null,
): string => {
  switch (error) {
    case Passwords.PasswordsError.FLOODED:
      return resources.Message.Error.Passwords.Flooded;
    case Passwords.PasswordsError.INVALID_PASSWORD:
      return resources.Message.Error.Passwords.InvalidPassword;
    case Passwords.PasswordsError.INVALID_CURRENT_PASSWORD:
      return resources.Message.Error.Passwords.InvalidCurrentPassword;
    case Passwords.PasswordsError.PASSWORD_LOW_COMPLEXITY:
      return resources.Response.PasswordLowComplexity;
    case Passwords.PasswordsError.PASSWORD_TOO_SIMILAR_TO_USERNAME:
      return resources.Response.PasswordTooSimilarToUsername;
    default:
      return resources.Message.Error.Passwords.Default;
  }
};

export const mapPasswordResetErrorToResource = (
  resources: AccountSecurityPromptResources,
  error: Passwords.ResetError | null,
): string => {
  switch (error) {
    case Passwords.ResetError.USER_DOES_NOT_HAVE_EMAIL:
      return resources.Message.Error.PasswordReset.UserDoesNotHaveEmail;
    default:
      return resources.Message.Error.PasswordReset.Default;
  }
};

export const mapPasswordValidationStatusToResource = (
  resources: AccountSecurityPromptResources,
  status: Passwords.ValidationStatus | null,
): string | null => {
  switch (status) {
    case Passwords.ValidationStatus.VALID_PASSWORD:
      return null;
    case Passwords.ValidationStatus.WEAK_PASSWORD:
      return resources.Message.Error.PasswordValidation.WeakPassword;
    case Passwords.ValidationStatus.SHORT_PASSWORD:
      return resources.Message.Error.PasswordValidation.ShortPassword;
    case Passwords.ValidationStatus.PASSWORD_SAME_AS_USERNAME:
      return resources.Message.Error.PasswordValidation.PasswordSameAsUsername;
    case Passwords.ValidationStatus.FORBIDDEN_PASSWORD:
      return resources.Message.Error.PasswordValidation.ForbiddenPassword;
    case Passwords.ValidationStatus.DUMB_STRINGS:
      return resources.Message.Error.PasswordValidation.DumbStrings;
    case Passwords.ValidationStatus.PASSWORD_LOW_COMPLEXITY:
      return resources.Response.PasswordLowComplexity;
    case Passwords.ValidationStatus.PASSWORD_TOO_SIMILAR_TO_USERNAME:
      return resources.Response.PasswordTooSimilarToUsername;
    default:
      return resources.Message.Error.PasswordValidation.Default;
  }
};
