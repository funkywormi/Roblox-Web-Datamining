import React, { useState } from "react";
import { IModalService } from "react-style-guide";
import {
  TUpdateUserSettingValueRequest,
  UserSetting,
  TDoNotDisturbTimeWindow,
  useSnackbar,
} from "@rbx/user-settings";
import { useUpdateUserSettingValueMutation } from "../../../apis/userSettingsApi";
import useSettingsModal from "./useSettingsModal";
import useTimeSelector from "../../../userSettings/hooks/useTimeSelector";
import useWrappedTranslation from "../../../userSettings/hooks/useWrappedTranslation";
import commonTranslationConstants from "../../../userSettings/constants/contentConstants/commonTranslationConstants";
import parentalControlsTranslationConstants from "../../../userSettings/constants/contentConstants/parentalControlsTranslationConstants";
import {
  getSuccessMessageKeyForUserSettingsUpdate,
  handleChildSettingsUpdateError,
} from "../../../userSettings/utils/successMessageUtils";

export type TUseDoNotDisturbTimePickerModalReturn = [JSX.Element, IModalService, IModalService];

const useDoNotDisturbTimePickerModal = (
  childUserId?: number,
  currentTimeWindow?: TDoNotDisturbTimeWindow,
): TUseDoNotDisturbTimePickerModalReturn => {
  const { translate } = useWrappedTranslation();
  const { snackbarService } = useSnackbar();
  const { notifications } = parentalControlsTranslationConstants;

  const [updateSettingValue, { isLoading }] = useUpdateUserSettingValueMutation();

  // Start time modal selector
  const [selectedStartTime, startTimeSelector, resetStartTime, isStartTimeValid] = useTimeSelector(
    currentTimeWindow?.startTimeMinutes ?? 0,
    translate(notifications.doNotDisturb.timeLabels.hour),
    translate(notifications.doNotDisturb.timeLabels.minute),
    translate(notifications.doNotDisturb.timeLabels.ampm),
    translate(notifications.doNotDisturb.timeLabels.am),
    translate(notifications.doNotDisturb.timeLabels.pm),
  );

  // End time modal selector
  const [selectedEndTime, endTimeSelector, resetEndTime, isEndTimeValid] = useTimeSelector(
    currentTimeWindow?.endTimeMinutes ?? 0,
    translate(notifications.doNotDisturb.timeLabels.hour),
    translate(notifications.doNotDisturb.timeLabels.minute),
    translate(notifications.doNotDisturb.timeLabels.ampm),
    translate(notifications.doNotDisturb.timeLabels.am),
    translate(notifications.doNotDisturb.timeLabels.pm),
  );

  const updateTimeWindow = async (startTimeMinutes: number, endTimeMinutes: number) => {
    const newTimeWindow: TDoNotDisturbTimeWindow = {
      startTimeMinutes,
      endTimeMinutes,
    };

    const updateBody: TUpdateUserSettingValueRequest = {
      childUserId,
      setting: UserSetting.doNotDisturbTimeWindow,
      value: childUserId ? JSON.stringify(newTimeWindow) : newTimeWindow, // parent apis expect JSON, user settings expects object
    };

    try {
      const result = await updateSettingValue(updateBody).unwrap();
      const successMessageKey = getSuccessMessageKeyForUserSettingsUpdate(updateBody, result);
      if (successMessageKey) {
        snackbarService.success(translate(successMessageKey));
      }
    } catch (error) {
      const errorKey = handleChildSettingsUpdateError(error, childUserId);
      if (errorKey) {
        snackbarService.warning(translate(errorKey));
      }
    }
  };

  // Start time modal definition
  const startTimeBody = (
    <div className="do-not-disturb-time-container">
      <div className="text-description modal-description">
        {translate(notifications.doNotDisturb.startTimePickerDescription)}
      </div>
      {startTimeSelector}
      {selectedStartTime === selectedEndTime && (
        <div className="text-error">{translate(notifications.doNotDisturb.timeWindowTooShort)}</div>
      )}
    </div>
  );

  const [startTimeModal, startTimeModalService] = useSettingsModal({
    titleResourceId: notifications.doNotDisturb.startTime,
    translatedBody: startTimeBody,
    actionButtonTextResourceId: commonTranslationConstants.continue,
    neutralButtonTextResourceId: commonTranslationConstants.cancel,
    shouldCloseModalOnActionButton: true,
    onAction: async () => {
      if (currentTimeWindow) {
        await updateTimeWindow(selectedStartTime, currentTimeWindow.endTimeMinutes);
      }
    },
    onNeutral: () => {
      resetStartTime(currentTimeWindow?.startTimeMinutes ?? 0);
    },
    onHide: () => {
      resetStartTime(currentTimeWindow?.startTimeMinutes ?? 0);
    },
    disableActionButton: !isStartTimeValid || isLoading || selectedStartTime === selectedEndTime,
    size: "sm",
  });

  // End time modal definition
  const endTimeBody = (
    <div className="do-not-disturb-time-container">
      <div className="text-description modal-description">
        {translate(notifications.doNotDisturb.endTimePickerDescription)}
      </div>
      {endTimeSelector}
      {selectedStartTime === selectedEndTime && (
        <div className="text-error">{translate(notifications.doNotDisturb.timeWindowTooShort)}</div>
      )}
    </div>
  );

  const [endTimeModal, endTimeModalService] = useSettingsModal({
    titleResourceId: notifications.doNotDisturb.endTime,
    translatedBody: endTimeBody,
    actionButtonTextResourceId: commonTranslationConstants.continue,
    neutralButtonTextResourceId: commonTranslationConstants.cancel,
    shouldCloseModalOnActionButton: true,
    onAction: async () => {
      if (currentTimeWindow) {
        await updateTimeWindow(currentTimeWindow.startTimeMinutes, selectedEndTime);
      }
    },
    onNeutral: () => {
      resetEndTime(currentTimeWindow?.endTimeMinutes ?? 0);
    },
    onHide: () => {
      resetEndTime(currentTimeWindow?.endTimeMinutes ?? 0);
    },
    disableActionButton: !isEndTimeValid || isLoading || selectedStartTime === selectedEndTime,
    size: "sm",
  });

  const modals = (
    <React.Fragment>
      {startTimeModal}
      {endTimeModal}
    </React.Fragment>
  );

  return [modals, startTimeModalService, endTimeModalService];
};

export default useDoNotDisturbTimePickerModal;
