import type { Translator } from "@rbx/www-common/i18n";
import { ErrorCode } from "../interface";

export const getResources = (translate: Translator<"Feature.PhoneVerificationChallenge">) =>
  ({
    Header: {
      ConfirmAbandon: translate("Header.ConfirmAbandon"),
    },
    Description: {
      ConfirmAbandon: translate("Description.ConfirmAbandon"),
    },
    Message: {
      Error: {
        // Absent from the namespace; `dynamic` keeps the existing empty string.
        Default: translate.dynamic("Message.Error.Default"),
      },
    },
    Label: {
      ConfirmAbandon: translate("Label.ConfirmAbandon"),
      RejectAbandon: translate("Label.RejectAbandon"),
    },
  }) as const;

export type PhoneVerificationResources = ReturnType<typeof getResources>;

export const mapChallengeErrorCodeToResource = (
  resources: PhoneVerificationResources,
  errorCode: ErrorCode,
): string => {
  switch (errorCode) {
    default:
      return resources.Message.Error.Default;
  }
};
