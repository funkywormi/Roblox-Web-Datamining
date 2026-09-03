import React from "react";
import { Badge } from "@rbx/foundation-ui";
import { EppEnrollmentStatus } from "../../../common/request/types/userSettings";
import useSecurityTabContext from "../hooks/useSecurityTabContext";

type EnhancedProtectionProgramCardProps = {
  title: string;
  description: string;
  onCardClick: () => void;
  eppEnrollmentStatus?: EppEnrollmentStatus;
  enrolledLabel: string;
  unenrolledLabel: string;
  isUnder13?: boolean;
};

const ENTER = "Enter";
const SPACE = " ";

const VALID_EPP_TRANSITION_KEYS = new Set([ENTER, SPACE]);

const EnhancedProtectionProgramCard: React.FC<EnhancedProtectionProgramCardProps> = ({
  title,
  description,
  onCardClick,
  eppEnrollmentStatus,
  enrolledLabel,
  unenrolledLabel,
  isUnder13,
}) => {
  const {
    state: { eventService },
  } = useSecurityTabContext();

  if (isUnder13) {
    return null;
  }

  const isEnrolled = eppEnrollmentStatus === EppEnrollmentStatus.KEY_PLAN_ENROLLED;

  const handleCardClick = () => {
    eventService.sendEppCardClickEvent(isEnrolled);
    onCardClick();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (VALID_EPP_TRANSITION_KEYS.has(event.key)) {
      event.preventDefault();
      handleCardClick();
    }
  };

  const badgeVariant = isEnrolled ? "Success" : "Neutral";
  const badgeLabel = isEnrolled ? enrolledLabel : unenrolledLabel;

  return (
    <div
      className="section-content notifications-section"
      style={{
        cursor: "pointer",
      }}
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      data-testid="epp-program-card"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-4">
          <div className="flex flex-row items-center gap-small">
            <h4 className="text-title-medium">{title}</h4>
            {eppEnrollmentStatus && <Badge variant={badgeVariant} label={badgeLabel} />}
          </div>
          <div className="text-body-medium">{description}</div>
        </div>
        <div className="flex items-center justify-center">
          <span className="icon-chevron-heavy-right" />
        </div>
      </div>
    </div>
  );
};

export default EnhancedProtectionProgramCard;
