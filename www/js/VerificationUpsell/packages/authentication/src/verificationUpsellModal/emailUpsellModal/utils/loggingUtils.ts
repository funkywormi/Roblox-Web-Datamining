import verificationUpsellConstants from "../constants/verificationUpsellConstants";
import { sectionValues } from "../../common/constants/loggingConstants";

export const getSectionValueForPage = pageType => {
  switch (pageType) {
    case verificationUpsellConstants.Verification:
      return sectionValues.verifyEmail;
    case verificationUpsellConstants.UpdateEmail:
      return sectionValues.addEmail;
    default:
      return "";
  }
};
