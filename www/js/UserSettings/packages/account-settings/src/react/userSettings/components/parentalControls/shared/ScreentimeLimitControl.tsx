import React from "react";
import { useTranslation } from "react-utilities";
import { NativeDropdown } from "react-style-guide";
import CollapsibleUserInput from "../../../../common/components/CollapsibleUserInput";
import SettingsSection from "../../../../common/components/SettingsSection";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import screentimeUtils from "../../../utils/parentalControls/screentime/screentimeUtils";

// The daily screen time limit picker. Caller passes the function called on save as a param.
export const ScreentimeLimitControl = ({
  currentLimitMinutes,
  inputId,
  onSelectLimit,
}: {
  currentLimitMinutes: number | undefined;
  inputId: string;
  onSelectLimit: (limitMinutes: number) => void;
}): JSX.Element => {
  const { translate } = useTranslation();
  const { parentalControlsScreentime } = parentalControlsTranslationConstants;

  const screentimeLimitOptions = screentimeUtils.generateAllowedTimeAmountOptions(
    translate(parentalControlsScreentime.noLimit),
    translate(parentalControlsScreentime.minutesLabel),
    translate(parentalControlsScreentime.hoursLabel),
    translate(parentalControlsScreentime.hourLabel),
  );

  return (
    <SettingsSection description={translate(parentalControlsScreentime.description)}>
      <CollapsibleUserInput
        className="screentime-limit-container"
        desktopLabel={translate(parentalControlsScreentime.dailyLimitLabel)}
        mobileLabel={translate(parentalControlsScreentime.dailyLimitLabel)}
        inputId={inputId}
      >
        <NativeDropdown
          selectionItems={screentimeLimitOptions as unknown as { label?: string; value?: string }[]}
          selectedItemvalue={
            (currentLimitMinutes ?? screentimeUtils.minutesInDay) as unknown as string
          }
          className="form-group"
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
            onSelectLimit(Number(event.target.value))
          }
        />
      </CollapsibleUserInput>
    </SettingsSection>
  );
};

export default ScreentimeLimitControl;
