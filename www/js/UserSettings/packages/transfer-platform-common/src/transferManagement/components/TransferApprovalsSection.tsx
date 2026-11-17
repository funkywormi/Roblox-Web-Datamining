import type React from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { Icon } from "@rbx/foundation-ui";
import { RobuxTransferApprovalMode } from "@rbx/user-settings";
import translationConstants from "../../core/constants/translationConstants";

type TransferApprovalsSectionProps = {
  /** Saved mode. An empty value shows the common error instead of a mode row. */
  currentValue?: RobuxTransferApprovalMode | null;
  /** Hash route of the approval options page. */
  detailsHref: string;
};

/** The Robux tab's approval card. It shows the saved mode and opens the options page. */
const TransferApprovalsSection = ({
  currentValue,
  detailsHref,
}: TransferApprovalsSectionProps): React.JSX.Element => {
  const { translate } = useTranslation();
  const copy =
    currentValue == null
      ? undefined
      : translationConstants.childControlTransferApprovals[currentValue];

  return (
    <div className="padding-top-xxlarge">
      <div className="container-header">
        <h2 className="setting-section-header">
          {translate(translationConstants.transferApprovalsHeading)}
        </h2>
      </div>

      {copy == null ? (
        <span className="text-body-small content-system-alert">
          {translate(translationConstants.loadingError)}
        </span>
      ) : (
        <div className="radius-large stroke-standard stroke-muted padding-y-small padding-x-large">
          <a href={detailsHref} className="settings-list-item-container margin-none padding-medium">
            <div className="settings-list-item-info flex flex-col gap-xsmall">
              <span className="setting-name text-title-medium">{translate(copy.title)}</span>
              <span className="text-body-medium">{translate(copy.cardDescription)}</span>
            </div>
            <div className="settings-list-item-value-arrow">
              <Icon name="icon-regular-chevron-large-right" size="Medium" />
            </div>
          </a>
        </div>
      )}
    </div>
  );
};

export default TransferApprovalsSection;
