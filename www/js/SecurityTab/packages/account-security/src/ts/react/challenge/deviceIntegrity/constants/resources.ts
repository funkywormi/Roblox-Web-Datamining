import type { Translator } from "@rbx/www-common/i18n";

export const getResources = (translate: Translator<"Feature.DeviceIntegrityChallenge">) =>
  ({
    Description: {
      VerificationError: translate("Description.VerificationError"),
      VerificationSuccess: translate("Description.VerificationSuccess"),
      VerifyingYouAreNotBot: translate("Description.VerifyingYouAreNotBot"),
    },
  }) as const;

export type DeviceIntegrityResources = ReturnType<typeof getResources>;
