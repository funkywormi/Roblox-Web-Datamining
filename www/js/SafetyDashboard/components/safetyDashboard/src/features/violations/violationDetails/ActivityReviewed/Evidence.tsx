import { EnrichedViolation } from "../../util/violations";
import { isValidatedPlatformEvidence } from "../../util/types";
import PlatformEvidenceInfo from "./PlatformEvidenceInfo";
import LegacyItemInfo from "./LegacyItemInfo";
import DetailsUnavailable from "../DetailsUnavailable";

/**
 * Displays evidence for a specific violation. The component handles determining if the
 * more modern, platform evdience data should be shown or if we should fallback to the legacy.
 *
 * Additionally, if the violation is limited, the component will display a generic fallback message
 * letting the user we can't show any details about the violation.
 */
const Evidence = ({ violation }: { violation: EnrichedViolation }) => {
  const { content, evidence, create_time: createTime } = violation;

  if (violation.isLimited) {
    return <DetailsUnavailable />;
  }

  if (isValidatedPlatformEvidence(evidence)) {
    return <PlatformEvidenceInfo evidence={evidence} createTime={createTime} />;
  }

  return <LegacyItemInfo content={content} createTime={createTime} />;
};

export default Evidence;
