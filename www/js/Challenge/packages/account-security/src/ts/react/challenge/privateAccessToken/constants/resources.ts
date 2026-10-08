import type { Translator } from "@rbx/www-common/i18n";
import * as PrivateAccessToken from "../../../../common/request/types/privateAccessToken";
import { ErrorCode } from "../interface";

export const getResources = (translate: Translator<"Feature.PrivateAccessTokenChallenge">) =>
  ({
    Description: {
      VerificationError: translate("Description.VerificationError"),
      VerificationSuccess: translate("Description.VerificationSuccess"),
      VerifyingYouAreNotBot: translate("Description.VerifyingYouAreNotBot"),
    },
  }) as const;

export type PrivateAccessTokenResources = ReturnType<typeof getResources>;

export const mapPrivateAccessTokenErrorToChallengeErrorCode = (
  error: PrivateAccessToken.PrivateAccessTokenError | null,
): ErrorCode => {
  switch (error) {
    default:
      return ErrorCode.UNKNOWN;
  }
};
