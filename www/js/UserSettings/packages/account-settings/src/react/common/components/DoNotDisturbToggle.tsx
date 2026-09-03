import React from "react";
import { TUserSettingAndOptions, UserSetting, TDoNotDisturbTimeWindow } from "@rbx/user-settings";
import useGetSettingsAndOptions from "../../apis/hooks/useGetSettingsAndOptions";
import useWrappedTranslation from "../../userSettings/hooks/useWrappedTranslation";
import SettingSubListItem from "./routing/SettingSubListItem";
import { minutesToTimeString } from "../../userSettings/utils/doNotDisturbUtils";
import parentalControlsTranslationConstants from "../../userSettings/constants/contentConstants/parentalControlsTranslationConstants";
import useDoNotDisturbTimePickerModal from "../hooks/modals/useDoNotDisturbTimePickerModal";
import ToggleWithParentalConsent from "./ToggleWithParentalConsent";

/*
  A toggle component for Do Not Disturb setting with time pickers
  Pass translated text to this component
*/
export const DoNotDisturbToggle = ({
  label,
  inputId,
  settingName,
  childUserId,
  description,
}: {
  label: string;
  inputId: string;
  settingName: UserSetting.doNotDisturb;
  childUserId?: number | undefined;
  description?: string;
}): JSX.Element => {
  const { translate } = useWrappedTranslation();
  const { notifications } = parentalControlsTranslationConstants;

  // Retrieve settings to determine current time window
  const [settingsAndOptions] = useGetSettingsAndOptions(childUserId);

  const timeWindow = (settingsAndOptions as Record<string, TUserSettingAndOptions<any>>)?.[
    UserSetting.doNotDisturbTimeWindow
  ]?.currentValue as TDoNotDisturbTimeWindow | undefined;

  // Time picker modals
  const [timePickerModals, startTimeModalService, endTimeModalService] =
    useDoNotDisturbTimePickerModal(childUserId, timeWindow);

  const getAdditionalContent = (isToggleOn: boolean): React.ReactNode => (
    <React.Fragment>
      {/* Time picker section - only shown when toggle is enabled */}
      {isToggleOn && timeWindow && (
        <div className="do-not-disturb-time-container">
          <SettingSubListItem
            title={translate(notifications.doNotDisturb.startTime)}
            currentSettingValueComponent={
              <span>
                {minutesToTimeString(
                  timeWindow.startTimeMinutes,
                  translate(notifications.doNotDisturb.timeLabels.am),
                  translate(notifications.doNotDisturb.timeLabels.pm),
                )}
              </span>
            }
            showArrow
            onClick={() => startTimeModalService.open()}
          />
          <div className="rbx-divider" />
          <SettingSubListItem
            title={translate(notifications.doNotDisturb.endTime)}
            currentSettingValueComponent={
              <span>
                {minutesToTimeString(
                  timeWindow.endTimeMinutes,
                  translate(notifications.doNotDisturb.timeLabels.am),
                  translate(notifications.doNotDisturb.timeLabels.pm),
                )}
              </span>
            }
            showArrow
            onClick={() => endTimeModalService.open()}
          />
        </div>
      )}

      {/* Time picker modals */}
      {timePickerModals}
    </React.Fragment>
  );

  return (
    <ToggleWithParentalConsent
      label={label}
      inputId={inputId}
      settingName={settingName}
      childUserId={childUserId}
      description={description}
      getAdditionalContent={getAdditionalContent}
    />
  );
};

DoNotDisturbToggle.defaultProps = {
  childUserId: undefined,
  description: undefined,
};

export default DoNotDisturbToggle;
