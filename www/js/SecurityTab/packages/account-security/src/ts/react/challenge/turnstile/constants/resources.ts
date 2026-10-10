import type { Translator } from "@rbx/www-common/i18n";

export const getResources = (translate: Translator<"Authentication.Captcha">) =>
  ({
    Description: {
      VerifyingYouAreNotBot: translate("Description.VerifyingYouAreNotBot"),
    },
  }) as const;

export type TurnstileResources = ReturnType<typeof getResources>;
