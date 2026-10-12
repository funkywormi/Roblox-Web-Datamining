import React from "react";
import type { Translator } from "@rbx/www-common/i18n";
import * as TwoStepVerification from "../../../../common/request/types/twoStepVerification";
import { ErrorCode } from "../interface";

// Newer delay keys can be untranslated in some locales, so those use `translate.dynamic` to fall
// back to English.
export const getResources = (translate: Translator<"Authentication.TwoStepVerification">) =>
  ({
    Action: {
      ChangeMediaType: translate("Action.ChangeMediaType"),
      Okay: translate("Action.Okay"),
      Recover: translate("Action.Recover"),
      Reload: translate("Action.Reload"),
      Resend: translate("Action.Resend"),
      Retry: translate("Action.Retry"),
      Verify: translate("Action.Verify"),
      Continue: translate("Action.Continue"),
    },
    Description: {
      Denied: translate("Description.Denied"),
      Expired: translate("Description.Expired"),
      LoginDenied: translate("Description.LoginDenied"),
      LoginExpired: translate("Description.LoginExpired"),
      QuickLogin: translate("Description.QuickLogin"),
      QuickLoginUA: translate("Description.QuickLoginUA"),
      SecurityWarningShort: translate("Description.SecurityWarningShort", {
        // No bolding of `IMPORTANT:` for now.
        boldStart: "",
        boldEnd: "",
      }),
      SecurityWarningShortBackupCodes: translate("Description.SecurityWarningShortBackupCodes", {
        // No bolding of `IMPORTANT:` for now.
        boldStart: "",
        boldEnd: "",
      }),
    },
    Heading: {
      LoginDenied: translate("Heading.LoginDenied"),
      LoginError: translate("Heading.LoginError"),
    },
    Label: {
      AlternateDelayedMethod: (delaySimpleText: string) =>
        translate.dynamic(
          "Label.AlternateDelayedMethod",
          { delaySimpleText },
          `This is for your account security. If you don’t want to wait, you can verify with one of these methods now.`,
        ),
      ApproveWithDevice: translate("Label.ApproveWithDevice"),
      AuthenticatorMediaType: translate("Label.AuthenticatorMediaType"),
      CrossDeviceMediaType: translate("Label.UseYourDevice"),
      ChooseAMediaType: translate("Label.ChooseAMediaType"),
      ChooseAlternateMediaType: translate("Label.ChooseAlternateMediaType"),
      CharacterCodeInputPlaceholderText: (codeLength: number) =>
        translate("Label.CharacterCodeInputPlaceholderText", { codeLength }),
      CodeInputPlaceholderText: (codeLength: number) =>
        translate("Label.CodeInputPlaceholderText", { codeLength }),
      DayWait: (numberOfDays: number) =>
        translate.dynamic("Label.DayWait", { numberOfDays }, `${numberOfDays}-day wait`),
      DelayedVerification: {
        WaitDays: (numberOfDays: number) =>
          translate.dynamic(
            "Label.DelayedVerification.WaitDays",
            { numberOfDays },
            `You'll have to wait ${numberOfDays} days after verification.`,
          ),
        WaitHours: (numberOfHours: number) =>
          translate.dynamic(
            "Label.DelayedVerification.WaitHours",
            { numberOfHours },
            `You'll have to wait ${numberOfHours} hours after verification.`,
          ),
        WaitMinutes: (numberOfMinutes: number) =>
          translate.dynamic(
            "Label.DelayedVerification.WaitMinutes",
            { numberOfMinutes },
            `You'll have to wait ${numberOfMinutes} minutes after verification.`,
          ),
        TryAgainOnTrustedDevicePrefix: (linkRef: string): React.ReactNode =>
          translate.html("Label.DelayedVerification.TryAgainOnTrustedDevicePrefix", [
            {
              opening: "linkStart",
              closing: "linkEnd",
              render: children => (
                <a href={linkRef} target="_blank" rel="noreferrer" className="underline">
                  {children}
                </a>
              ),
            },
          ]),
        TryAgainOnTrustedDeviceSuffix: (linkRef: string): React.ReactNode =>
          translate.html("Label.DelayedVerification.TryAgainOnTrustedDeviceSuffix", [
            {
              opening: "linkStart",
              closing: "linkEnd",
              render: children => (
                <a href={linkRef} target="_blank" rel="noreferrer" className="underline">
                  {children}
                </a>
              ),
            },
          ]),
      },
      EmailMediaType: translate("Label.EmailMediaType"),
      EnterAuthenticatorCode: translate("Label.EnterAuthenticatorCode"),
      EnterEmailCode: translate("Label.EnterEmailCode"),
      EnterEmailCodeSanitizedEmail: (emailSanitized: string) =>
        translate("Label.EnterEmailCodeSanitizedEmail", {
          lineBreak: "\n\n",
          emailSanitized,
        }),
      EnterEmailCodeSanitizedEmailU13: (emailSanitized: string) =>
        translate("Label.EnterEmailCodeSanitizedEmailU13", {
          lineBreak: "\n\n",
          emailSanitized,
        }),
      EnterPassword: translate("Label.EnterPassword"),
      EnterRecoveryCode: translate("Label.EnterRecoveryCode"),
      EnterTextCode: translate("Label.EnterTextCode"),
      LearnMore: translate("Label.LearnMore"),
      HelpCenter: translate("Label.HelpCenter"),
      // IMPORTANT: Do not inject user input into this variable; this content is
      // rendered as HTML.
      HelpCenterLink: (helpCenterLinkHtml: string) =>
        translate("Label.HelpCenterLink", { helpCenterLink: helpCenterLinkHtml }),
      MinuteWait: (numberOfMinutes: number) =>
        translate.dynamic(
          "Label.MinuteWait",
          { numberOfMinutes },
          `${numberOfMinutes}-minute wait`,
        ),
      HourWait: (numberOfHours: number) =>
        translate.dynamic("Label.HourWait", { numberOfHours }, `${numberOfHours}-hour wait`),
      // IMPORTANT: Do not inject user input into this variable; this content is
      // rendered as HTML.
      NeedHelpContactSupport: (supportLinkHtml: string) =>
        translate("Label.NeedHelpContactSupport", { supportLink: supportLinkHtml }),
      NewLogin: translate("Label.NewLogin"),
      NoWait: translate.dynamic("Label.NoWait", undefined, "No wait"),
      PasskeyDirections: translate("Label.PasskeyDirections"),
      PasskeyMediaType: translate("Label.PasskeyMediaType"),
      PasswordMediaType: translate("Label.Password"),
      PasswordPlaceholder: translate("Label.PasswordPlaceholder"),
      RecoveryCodeMediaType: translate("Label.RecoveryCodeMediaType"),
      RobloxSupport: translate("Label.RobloxSupport"),
      SecurityKeyDirections: translate("Label.SecurityKeyDirections"),
      SecurityKeyMediaType: translate("Label.SecurityKeyMediaType"),
      SmsMediaType: translate("Label.SmsMediaType"),
      SimpleDay: (numberOfDays: number) =>
        translate.dynamic("Label.SimpleDay", { numberOfDays }, `${numberOfDays} day(s)`),
      SimpleHour: (numberOfHours: number) =>
        translate.dynamic("Label.SimpleHour", { numberOfHours }, `${numberOfHours} hour(s)`),
      SimpleMinute: (numberOfMinutes: number) =>
        translate.dynamic(
          "Label.SimpleMinute",
          { numberOfMinutes },
          `${numberOfMinutes} minute(s)`,
        ),
      TrustThisDevice: translate("Label.TrustThisDevice"),
      TryAgainNow: translate.dynamic(
        "Label.TryAgainNow",
        undefined,
        "The delay just expired! Exit this dialog and try again.",
      ),
      TwoStepVerification: translate("Label.TwoStepVerification"),
      UnableToCalculateDelay: translate("Label.UnableToCalculateDelay"),
      UseOneOfThese: translate.dynamic("Label.UseOneOfThese", undefined, "Use one of these"),
      VerifyWithPasskey: translate("Label.VerifyWithPasskey"),
      VerifyWithSecurityKey: translate("Label.VerifyWithSecurityKey"),
      // Not in the namespace yet, so look it up at runtime and fall back to English.
      WeNeedYouToWait: (delaySimpleText: string) =>
        translate.dynamic(
          "Label.WeNeedYouToWait",
          { delaySimpleText },
          `We need you to wait ${delaySimpleText}`,
        ),
    },
    Response: {
      AuthenticatorCodeAlreadyUsed: translate("Response.AuthenticatorCodeAlreadyUsed"),
      CodeSent: translate("Response.CodeSent"),
      DefaultError: translate("Response.DefaultError"),
      FeatureNotAvailable: translate("Response.FeatureNotAvailable"),
      InvalidCode: translate("Response.InvalidCode"),
      InvalidPassword: translate("Response.InvalidPassword"),
      SessionExpired: translate("Response.SessionExpired"),
      SystemErrorSwitchingToEmail: translate("Response.SystemErrorSwitchingToEmail"),
      TooManyAttempts: translate("Response.TooManyAttempts"),
      VerificationError: translate("Response.VerificationError"),
    },
    Title: {
      UseAnotherDevice: translate("Title.UseAnotherDevice"),
    },
  }) as const;

export type TwoStepVerificationResources = ReturnType<typeof getResources>;

export const mapChallengeErrorCodeToResource = (
  resources: TwoStepVerificationResources,
  errorCode: ErrorCode,
): string => {
  switch (errorCode) {
    case ErrorCode.SESSION_EXPIRED:
      return resources.Response.SessionExpired;
    default:
      return resources.Response.DefaultError;
  }
};

export const mapTwoStepVerificationErrorToResource = (
  resources: TwoStepVerificationResources,
  error: TwoStepVerification.TwoStepVerificationError | null,
): string => {
  switch (error) {
    case TwoStepVerification.TwoStepVerificationError.FEATURE_DISABLED:
      return resources.Response.FeatureNotAvailable;
    case TwoStepVerification.TwoStepVerificationError.INVALID_CODE:
      return resources.Response.InvalidCode;
    case TwoStepVerification.TwoStepVerificationError.TOO_MANY_REQUESTS:
      return resources.Response.TooManyAttempts;
    case TwoStepVerification.TwoStepVerificationError.INVALID_CHALLENGE_ID:
      return resources.Response.SessionExpired;
    case TwoStepVerification.TwoStepVerificationError.AUTHENTICATOR_CODE_ALREADY_USED:
      return resources.Response.AuthenticatorCodeAlreadyUsed;
    case TwoStepVerification.TwoStepVerificationError.INVALID_PASSWORD:
      return resources.Response.InvalidPassword;
    default:
      return resources.Response.DefaultError;
  }
};

export const mapTwoStepVerificationErrorToChallengeErrorCode = (
  error: TwoStepVerification.TwoStepVerificationError | null,
): ErrorCode => {
  switch (error) {
    case TwoStepVerification.TwoStepVerificationError.INVALID_CHALLENGE_ID:
      return ErrorCode.SESSION_EXPIRED;
    default:
      return ErrorCode.UNKNOWN;
  }
};
