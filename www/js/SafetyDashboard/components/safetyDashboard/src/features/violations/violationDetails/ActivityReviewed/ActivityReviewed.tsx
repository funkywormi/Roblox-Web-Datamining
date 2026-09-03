import { useTranslation } from "@rbx/core-scripts/react";
import { EnrichedViolation } from "../../util/violations";
import Evidence from "./Evidence";

/**
 * Displays the activity what was reviewed in order to determine the violation's decision.
 * In other words, this shows the evidence that was used during the review process.
 */
const ActivityReviewed = ({ violation }: { violation: EnrichedViolation }) => {
  const { translate } = useTranslation();
  const { uid } = violation;

  /**
   * If the violation is limited and there's nothing else to show in the WhatHappened section, the
   * WhatHappened section will take care of displaying the fallback message and this component will be hidden.
   */
  if (violation.isLimitedWithoutDetails) {
    return null;
  }

  return (
    <div className="flex flex-col gap-medium">
      <span className="text-title-large">{translate("Label.ActivityReviewed")}</span>

      <div className="flex flex-col gap-xsmall">
        <div className="radius-medium bg-shift-100 padding-xlarge">
          <Evidence violation={violation} />
        </div>

        {/* Used for investigation purposes on our end. It is purposely hard to see since it's not important to the user. */}
        <span className="text-caption-medium content-muted">
          {translate("Label.IDArg", { id: uid })}
        </span>
      </div>
    </div>
  );
};

export default ActivityReviewed;
