import React from 'react';
import { WithTranslationsProps } from 'react-utilities';
import PreferenceSelector from './PreferenceSelector';
import TimePreferenceSelector from './TimePreferenceSelector';
import useTimePickerModal from '../hooks/useTimePickerModal';
import { minutesToTimeString } from '../utils/doNotDisturbUtils';
import {
  TDoNotDisturbTimeWindow,
  UpdateUserSettingsCallback,
  UserSetting,
  UserSettingName,
  EnabledStatusValue
} from '../types/UserSettingsTypes';

export type DoNotDisturbWrapperProps = {
  localizedHeading: string;
  localizedDescription: string;
  selection: boolean;
  selectionDisabled?: boolean;
  dndEnabledByParentalControls?: boolean;
  startTimeMinutes: number;
  endTimeMinutes: number;
  translate: WithTranslationsProps['translate'];
  updateUserSettings: UpdateUserSettingsCallback;
  userSettingName: string | null;
};

const DoNotDisturbWrapper = ({
  localizedHeading,
  localizedDescription,
  selection,
  selectionDisabled,
  startTimeMinutes,
  endTimeMinutes,
  dndEnabledByParentalControls,
  translate,
  updateUserSettings,
  userSettingName
}: DoNotDisturbWrapperProps): JSX.Element | null => {
  const updateDndPreference = (
    newSelection: boolean,
    userSetting: UserSetting | null | undefined
  ) => {
    if (userSetting) {
      updateUserSettings(
        userSetting ?? UserSetting.doNotDisturb,
        userSettingName ?? null,
        newSelection ? EnabledStatusValue.Enabled : EnabledStatusValue.Disabled
      );
    }
  };

  const updateDoNotDisturbTimeWindow = (startTime: number, endTime: number) => {
    const doNotDisturbTimeWindow: TDoNotDisturbTimeWindow = {
      startTimeMinutes: startTime,
      endTimeMinutes: endTime
    };

    updateUserSettings(
      UserSetting.doNotDisturbTimeWindow,
      userSettingName ? UserSettingName.doNotDisturbTimeWindow : null,
      doNotDisturbTimeWindow
    );
  };

  const [startTimeModal, startTimeModalService] = useTimePickerModal({
    titleText: translate('Label.DoNotDisturb.StartTime'),
    bodyText: translate('Description.DoNotDisturbTimePicker.StartTime'),
    actionButtonText: translate('Action.Save'),
    onAction: (selectedTime: number) => {
      updateDoNotDisturbTimeWindow(selectedTime, endTimeMinutes);
    },
    neutralButtonText: translate('Action.Cancel'),
    initTimeMinutes: startTimeMinutes,
    translate,
    invalidTimeMinutes: endTimeMinutes
  });

  const [endTimeModal, endTimeModalService] = useTimePickerModal({
    titleText: translate('Label.DoNotDisturb.EndTime'),
    bodyText: translate('Description.DoNotDisturbTimePicker.EndTime'),
    actionButtonText: translate('Action.Save'),
    onAction: (selectedTime: number) => {
      updateDoNotDisturbTimeWindow(startTimeMinutes, selectedTime);
    },
    neutralButtonText: translate('Action.Cancel'),
    initTimeMinutes: endTimeMinutes,
    translate,
    invalidTimeMinutes: startTimeMinutes
  });

  const renderTimePicker = () => {
    return (
      <React.Fragment>
        <TimePreferenceSelector
          localizedDescription={translate('Label.DoNotDisturb.StartTime')}
          timeString={minutesToTimeString(
            startTimeMinutes,
            translate('Label.DoNotDisturb.CapitalizedAM'),
            translate('Label.DoNotDisturb.CapitalizedPM')
          )}
          selectionDisabled={selectionDisabled}
          onClick={() => {
            startTimeModalService.open();
          }}
        />
        {startTimeModal}
        <TimePreferenceSelector
          localizedDescription={translate('Label.DoNotDisturb.EndTime')}
          timeString={minutesToTimeString(
            endTimeMinutes,
            translate('Label.DoNotDisturb.CapitalizedAM'),
            translate('Label.DoNotDisturb.CapitalizedPM')
          )}
          selectionDisabled={selectionDisabled}
          onClick={() => {
            endTimeModalService.open();
          }}
        />
        {endTimeModal}
      </React.Fragment>
    );
  };

  return (
    <PreferenceSelector
      userSetting={UserSetting.doNotDisturb}
      localizedTypeName={localizedHeading}
      localizedDescription={localizedDescription}
      onTogglePreference={(newSelection: boolean, userSetting: UserSetting | null | undefined) => {
        updateDndPreference(newSelection, userSetting);
      }}
      selection={selection}
      {...(selection && { renderAdditionalContent: renderTimePicker })}
      selectionDisabled={selectionDisabled}
      showLockOnToggle={dndEnabledByParentalControls}
    />
  );
};

export default DoNotDisturbWrapper;
