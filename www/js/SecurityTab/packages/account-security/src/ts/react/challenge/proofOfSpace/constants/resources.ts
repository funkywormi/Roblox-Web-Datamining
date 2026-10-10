import type { Translator } from "@rbx/www-common/i18n";
import * as ProofOfSpace from "../../../../common/request/types/proofOfSpace";
import { ErrorCode } from "../interface";

export const getResources = (translate: Translator<"Feature.ProofOfSpaceChallenge">) =>
  ({
    Description: {
      VerificationError: translate("Description.VerificationError"),
      VerificationSuccess: translate("Description.VerificationSuccess"),
      VerifyingYouAreNotBot: translate("Description.VerifyingYouAreNotBot"),
    },
  }) as const;

export type ProofOfSpaceResources = ReturnType<typeof getResources>;

export const mapProofOfSpaceErrorToChallengeErrorCode = (
  error: ProofOfSpace.ProofOfSpaceError | null,
): ErrorCode => {
  switch (error) {
    case ProofOfSpace.ProofOfSpaceError.INVALID_SESSION:
      return ErrorCode.SESSION_INVALID;
    default:
      return ErrorCode.UNKNOWN;
  }
};
