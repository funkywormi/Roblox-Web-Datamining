import { useTranslation } from "@rbx/core-scripts/react";
import { EnrichedViolation } from "../../util/violations";
import Timestamp from "../Timestamp";
import LearnMoreLabel from "../LearnMoreLabel";

/**
 * Shown on the appeal timeline when the appeal window is closed and the user cannot
 * submit an appeal anymore.
 */
const AppealWindowClosedItem = ({ violation }: { violation: EnrichedViolation }) => {
  const { translate } = useTranslation();

  return (
    <div className="flex flex-col gap-xxsmall">
      <span className="text-title-medium">{translate("Label.ItemStatus.WindowClosed")}</span>
      <Timestamp timestamp={violation.appeal_by_time} />

      <p className="text-body-medium padding-top-small">
        <LearnMoreLabel />
      </p>
    </div>
  );
};
export default AppealWindowClosedItem;
