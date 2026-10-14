import React from "react";
import {
  type IModalService,
  TUpdateUserSettingValueRequest,
  UserSetting,
  TDoNotDisturbTimeWindow,
  useSnackbar,
  useDoNotDisturbTimePickerModal as useDndTimePickerModal,
} from "@rbx/user-settings";
import { useUpdateUserSettingValueMutation } from "../../../apis/userSettingsApi";
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
  onSave?: (timeWindow: TDoNotDisturbTimeWindow) => Promise<void>,
): TUseDoNotDisturbTimePickerModalReturn => {
  const { translate } = useWrappedTranslation();
  const { snackbarService } = useSnackbar();
  const { notifications } = parentalControlsTranslationConstants;

  const [updateSettingValue, { isLoading }] = useUpdateUserSettingValueMutation();

  const updateTimeWindow = async (startTimeMinutes: number, endTimeMinutes: number) => {
    const newTimeWindow: TDoNotDisturbTimeWindow = {
      startTimeMinutes,
      endTimeMinutes,
    };

    if (onSave) {
      await onSave(newTimeWindow);
      return;
    }

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

  const labels = {
    actionButtonText: translate(commonTranslationConstants.continue),
    cancelButtonText: translate(commonTranslationConstants.cancel),
    closeLabel: translate(commonTranslationConstants.modal.closeBtn),
    errorText: translate(notifications.doNotDisturb.timeWindowTooShort),
    hourLabel: translate(notifications.doNotDisturb.timeLabels.hour),
    minuteLabel: translate(notifications.doNotDisturb.timeLabels.minute),
    ampmLabel: translate(notifications.doNotDisturb.timeLabels.ampm),
    amLabel: translate(notifications.doNotDisturb.timeLabels.am),
    pmLabel: translate(notifications.doNotDisturb.timeLabels.pm),
    isDisabled: isLoading,
  };
  const [startTimeModal, startTimeModalService] = useDndTimePickerModal({
    ...labels,
    titleText: translate(notifications.doNotDisturb.startTime),
    bodyText: translate(notifications.doNotDisturb.startTimePickerDescription),
    initTimeMinutes: currentTimeWindow?.startTimeMinutes ?? 0,
    invalidTimeMinutes: currentTimeWindow?.endTimeMinutes ?? 0,
    onAction: async selectedTime => {
      if (currentTimeWindow) {
        await updateTimeWindow(selectedTime, currentTimeWindow.endTimeMinutes);
      }
    },
  });
  const [endTimeModal, endTimeModalService] = useDndTimePickerModal({
    ...labels,
    titleText: translate(notifications.doNotDisturb.endTime),
    bodyText: translate(notifications.doNotDisturb.endTimePickerDescription),
    initTimeMinutes: currentTimeWindow?.endTimeMinutes ?? 0,
    invalidTimeMinutes: currentTimeWindow?.startTimeMinutes ?? 0,
    onAction: async selectedTime => {
      if (currentTimeWindow) {
        await updateTimeWindow(currentTimeWindow.startTimeMinutes, selectedTime);
      }
    },
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
