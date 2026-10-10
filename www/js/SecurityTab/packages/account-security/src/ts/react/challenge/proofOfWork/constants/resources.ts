import type { Translator } from "@rbx/www-common/i18n";
import * as ProofOfWork from "../../../../common/request/types/proofOfWork";
import { ErrorCode } from "../interface";

export const getResources = (translate: Translator<"Feature.ProofOfWorkChallenge">) =>
  ({
    Description: {
      VerificationError: translate("Description.VerificationError"),
      VerificationSuccess: translate("Description.VerificationSuccess"),
      VerifyingYouAreNotBot: translate("Description.VerifyingYouAreNotBot"),
    },
  }) as const;

export type ProofOfWorkResources = ReturnType<typeof getResources>;

export const mapProofOfWorkErrorToChallengeErrorCode = (
  error: ProofOfWork.ProofOfWorkError | null,
): ErrorCode => {
  switch (error) {
    case ProofOfWork.ProofOfWorkError.SESSION_INACTIVE:
      return ErrorCode.SESSION_INVALID;
    default:
      return ErrorCode.UNKNOWN;
  }
};
