import { useTranslation } from "@rbx/core-scripts/react";
import { EnrichedViolation } from "../../util/violations";
import EvidenceField from "../EvidenceField";
import getFilteredAbuseTypes from "../../util/getFilteredAbuseTypes";
import DetailsUnavailable from "../DetailsUnavailable";

/**
 * Used to explain to the user what happened initially in regards to their violation.
 * Includes the violation reason and the moderator note if present.
 */
const WhatHappened = ({ violation }: { violation: EnrichedViolation }) => {
  const { translate } = useTranslation();
  const abuseTypes = getFilteredAbuseTypes(violation.abuse_type_keys, translate);

  /**
   * For LIMITED violations we hide the Reason row entirely when there are no
   * visible abuse types (otherwise it would just say "Other"). For non-LIMITED
   * violations we always show it (falling back to "Other" when needed).
   */
  const showReason = !violation.isLimited || violation.hasVisibleAbuseTypes;
  const showNote = Boolean(violation.user_note);
  const showFallback = violation.isLimitedWithoutDetails;

  return (
    <div className="flex flex-col gap-medium" data-testid="what-happened">
      <span className="text-title-large">{translate("Label.WhatHappened")}</span>

      <div className="flex flex-col gap-small radius-medium bg-shift-100 padding-xlarge">
        {showReason && (
          <EvidenceField
            fieldLabel={translate("Label.Reason")}
            fieldValue={abuseTypes.join(", ") || translate("Label.AbuseType.Other")}
          />
        )}

        {showNote && (
          <EvidenceField
            fieldLabel={translate("Label.ModeratorNote")}
            fieldValue={violation.user_note}
            preWrap
          />
        )}

        {showFallback && <DetailsUnavailable />}
      </div>
    </div>
  );
};

export default WhatHappened;
