import { useTranslation } from "@rbx/core-scripts/react";
import { EnrichedViolation } from "../../util/violations";
import Timestamp from "../Timestamp";

/**
 * Shown on the appeal timeline when a violation has entered the INACTIVE
 * state (resolved). Prepended to the top of the timeline; prior appeal
 * activity still renders below.
 */
const ViolationResolvedItem = ({ violation }: { violation: EnrichedViolation }) => {
  const { translate } = useTranslation();

  return (
    <div className="flex flex-col gap-xxsmall">
      <span className="text-title-medium">{translate("Label.ViolationInactive")}</span>
      <Timestamp timestamp={violation.update_time} />

      <p className="text-body-medium padding-top-small">
        {translate("Description.ViolationInactive")}
      </p>
    </div>
  );
};

export default ViolationResolvedItem;
