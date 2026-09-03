import { Icon } from "@rbx/foundation-ui";
import { useNotApprovedTranslate } from "../../providers/NotApprovedUIProvider";
import getTimeLeftInSuspension from "../../utils/getTimeLeftInSuspension";

type Props = {
  endDate: string;
};

/**
 * An alert that is shown when a user is suspended and cannot reactivate their account yet.
 * The alert displays the number of days or hours:minutes left in the suspension.
 */
const SuspensionDurationAlert = ({ endDate }: Props): JSX.Element => {
  const translate = useNotApprovedTranslate();
  const endDateString = getTimeLeftInSuspension(endDate, translate);

  return (
    <div
      data-testid="suspension-duration-alert"
      className="flex flex-wrap gap-small bg-shift-100 padding-x-medium padding-y-small stroke-standard stroke-default items-center radius-medium"
    >
      <Icon name="icon-filled-triangle-exclamation" className="content-system-warning" />
      <span className="text-title-medium">{translate("Label.Suspension")}</span>
      <p className="text-body-medium">{endDateString}</p>
    </div>
  );
};

export default SuspensionDurationAlert;
