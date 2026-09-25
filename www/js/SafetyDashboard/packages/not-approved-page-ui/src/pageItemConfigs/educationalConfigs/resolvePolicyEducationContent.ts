import type { PolicyEducationContent } from "../ConfigTypes";
import KIDS_CONTENT_BY_ABUSE_KEY from "./kidsContentRegistry";
import POLICY_EDUCATION_CONTENT_REGISTRY from "./policyEducationContentRegistry";

/**
 * Resolves focused Kids education when available and otherwise preserves the standard policy
 * education for the violation.
 */
const resolvePolicyEducationContent = (
  violationTypeKey: string,
  isKidsTreatment: boolean,
): PolicyEducationContent | undefined => {
  if (isKidsTreatment) {
    const kidsContent = KIDS_CONTENT_BY_ABUSE_KEY[violationTypeKey];
    if (kidsContent) {
      return kidsContent.education;
    }
  }

  return POLICY_EDUCATION_CONTENT_REGISTRY[violationTypeKey];
};

export default resolvePolicyEducationContent;
