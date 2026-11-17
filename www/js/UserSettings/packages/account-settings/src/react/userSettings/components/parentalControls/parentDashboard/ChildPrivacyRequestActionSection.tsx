import React from "react";
import { Button } from "@rbx/foundation-ui";
import InlineUserInput from "../../../../common/components/InlineUserInput";
import SettingsSection from "../../../../common/components/SettingsSection";

export type ChildPrivacyRequestActionSectionProps = {
  label: string;
  inputId: string;
  buttonText: string;
  description?: React.ReactNode;
  onButtonClick: () => void;
  showDivider?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  disabledReasonId?: string;
  isDestructive?: boolean;
};

const ChildPrivacyRequestActionSection = ({
  label,
  inputId,
  buttonText,
  description,
  onButtonClick,
  showDivider = false,
  isDisabled = false,
  isLoading = false,
  disabledReasonId,
  isDestructive = false,
}: ChildPrivacyRequestActionSectionProps): JSX.Element => {
  const descriptionId = description ? `${inputId}-description` : undefined;
  const describedBy = [descriptionId, isDisabled ? disabledReasonId : undefined]
    .filter((id): id is string => Boolean(id))
    .join(" ");

  return (
    <SettingsSection>
      <React.Fragment>
        {showDivider && <div className="rbx-divider" />}
        <InlineUserInput label={label} inputId={inputId}>
          <Button
            size="Small"
            variant={isDestructive ? "Alert" : "Standard"}
            onClick={onButtonClick}
            isDisabled={isDisabled}
            isLoading={isLoading}
            aria-describedby={describedBy || undefined}
          >
            {buttonText}
          </Button>
        </InlineUserInput>
        {description && (
          <div id={descriptionId} className="small text">
            {description}
          </div>
        )}
      </React.Fragment>
    </SettingsSection>
  );
};

export default ChildPrivacyRequestActionSection;
