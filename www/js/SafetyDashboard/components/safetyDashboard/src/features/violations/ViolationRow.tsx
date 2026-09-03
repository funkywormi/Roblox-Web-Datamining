import { useHistory } from "react-router-dom";
import { Icon, ListItem, type TListItemDivider } from "@rbx/foundation-ui";
import type { EnrichedViolation } from "./util/violations";
import { formatRowTimestamp } from "./util/dateTime";
import { getDetailPath } from "../../shared/utils/navigation";
import { SafetyDashboardEventType } from "../../telemetry/eventTypes";
import { sendSafetyDashboardEvent } from "../../telemetry/sendSafetyDashboardEvent";

interface ViolationRowProps {
  violation: EnrichedViolation;
  fromList: boolean;
  isContained?: boolean;
  divider?: TListItemDivider;
}

/**
 * Represents a single violation in the list of recent or all violations. When the row is clicked,
 * the user is navigated to the details page for that specific violation.
 */
const ViolationRow = ({
  violation,
  fromList,
  isContained = false,
  divider = "Full",
}: ViolationRowProps) => {
  const history = useHistory();

  const handleClick = () => {
    sendSafetyDashboardEvent(SafetyDashboardEventType.ViolationRowNav, {
      state: violation.state,
      appealable: violation.appealable,
      isLimited: violation.isLimited,
      fromList,
    });
    history.push(getDetailPath(violation.uid));
  };

  return (
    <ListItem
      size="Medium"
      title={violation.contentTypeI18n}
      metadata={formatRowTimestamp(violation.create_time)}
      description={violation.appealStatusI18n}
      divider={divider}
      isContained={isContained}
      trailing={
        <Icon
          name="icon-regular-chevron-large-right"
          size="Medium"
          className="shrink-0 rtl:[transform:scaleX(-1)]"
        />
      }
      onSelect={handleClick}
    />
  );
};

export default ViolationRow;
