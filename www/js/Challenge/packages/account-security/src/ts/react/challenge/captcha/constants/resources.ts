import type { Translator } from "@rbx/www-common/i18n";
import { ErrorCode } from "../interface";

export const getResources = (translate: Translator<"Authentication.Captcha">) =>
  ({
    Action: {
      PleaseTryAgain: translate("Action.PleaseTryAgain"),
      Reload: translate("Action.Reload"),
    },
    Description: {
      VerifyingYouAreNotBot: translate("Description.VerifyingYouAreNotBot"),
    },
    Message: {
      Error: {
        Default: translate("Message.Error.Default"),
      },
    },
  }) as const;

export type CaptchaResources = ReturnType<typeof getResources>;

export const mapChallengeErrorCodeToResource = (
  resources: CaptchaResources,
  errorCode: ErrorCode,
): string => {
  switch (errorCode) {
    default:
      return resources.Message.Error.Default;
  }
};
