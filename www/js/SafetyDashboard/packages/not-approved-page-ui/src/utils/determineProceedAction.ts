import canReactivate from "./canReactivate";
import { VERIFICATION_CATEGORIES } from "./constants";
import { ProceedAction, TPunishment } from "./types";

function determineProceedAction(punishmentData: TPunishment): ProceedAction | null {
  const { punishmentTypeDescription, endDate, verificationCategory } = punishmentData;

  switch (verificationCategory) {
    case VERIFICATION_CATEGORIES.Email:
      return ProceedAction.VerifyEmail;
    case VERIFICATION_CATEGORIES.VPC:
      return ProceedAction.VerifyVPC;
    default:
      return canReactivate(punishmentTypeDescription, endDate, verificationCategory)
        ? ProceedAction.Reactivate
        : ProceedAction.Paused;
  }
}

export default determineProceedAction;
