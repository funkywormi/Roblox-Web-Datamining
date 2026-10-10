import type { Translator } from "@rbx/www-common/i18n";
import { ErrorCode } from "../interface";

export const getResources = (translate: Translator<"Feature.EmailVerificationChallenge">) =>
  ({
    Header: {
      VerifyYourAccount: translate("Header.VerifyYourAccount"),
      EnterCode: translate("Header.EnterCode"),
      ConfirmAbandon: translate("Header.ConfirmAbandon"),
    },
    Description: {
      // TODO: key is absent from the namespace (it has the non-V1 key), so this renders blank;
      // `dynamic` keeps that behavior until the owners decide on the copy.
      SuspiciousActivityEmailVerification: translate.dynamic(
        "Description.SuspiciousActivityEmailVerificationV1",
      ),
      EnterCode: translate("Description.EnterCode"),
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

export type EmailVerificationResources = ReturnType<typeof getResources>;

export const mapChallengeErrorCodeToResource = (
  resources: EmailVerificationResources,
  errorCode: ErrorCode,
): string => {
  switch (errorCode) {
    default:
      return resources.Message.Error.Default;
  }
};
