import React from "react";
import { useTranslation } from "react-utilities";
import { QueryStatus } from "@reduxjs/toolkit/dist/query";
import {
  SpendNotificationSetting,
  TUpdateUserSettingValueRequest,
  UserSetting,
  useSnackbar,
} from "@rbx/user-settings";
import { useUpdateUserSettingValueMutation } from "../../../../apis/userSettingsApi";
import RadioButtonOptions from "../../../../common/components/RadioButtonOptions";
import SettingsSection from "../../../../common/components/SettingsSection";
import { useGetParentalSpendControlsQuery } from "../../../../apis/billingApi";
import { TChildSettingsInfo } from "../../../../../types/childrenInfoTypes";
import { TSettingUpdateProps } from "../../../../../types/settingUpdateTypes";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import { handleChildSettingsUpdateError } from "../../../utils/successMessageUtils";
import parentalControlsConstants from "../../../constants/parentalControls/parentalControlsConstants";
import parentalControlsEventService from "../../../services/eventServices/parentalControlsEventService";

const ChildSpendingNotifications = ({
  child,
  onUpdateSetting,
}: {
  child: TChildSettingsInfo;
} & TSettingUpdateProps): JSX.Element => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();

  const { data: spendControlSettings } = useGetParentalSpendControlsQuery(
    onUpdateSetting ? undefined : child.userId,
  );
  const [updateChildSettings, { status: updateChildSettingsStatus }] =
    useUpdateUserSettingValueMutation();

  const toggleSpendNotificationHandler = async (setting: SpendNotificationSetting) => {
    const updateBody: TUpdateUserSettingValueRequest = {
      childUserId: child.userId,
      setting: UserSetting.monthlySpendLimitNotificationType,
      value: setting,
    };
    if (onUpdateSetting) {
      await onUpdateSetting(updateBody);
      return;
    }
    try {
      await updateChildSettings(updateBody).unwrap();
      parentalControlsEventService.authButtonClickSettingsPControlsSpendingNotifications(
        child,
        setting,
      );
      snackbarService.success(translate(commonTranslationConstants.successDialogMessage));
    } catch (error) {
      const errorKey = handleChildSettingsUpdateError(error, child.userId);
      if (errorKey) {
        snackbarService.warning(translate(errorKey));
      }
    }
  };

  const options = parentalControlsConstants.spendControls.getSpendNotificationsOptions(
    updateChildSettingsStatus === QueryStatus.pending,
  );

  const { spendControls } = parentalControlsTranslationConstants;
  return (
    <SettingsSection
      description={
        <span
          dangerouslySetInnerHTML={{
            __html: translate(spendControls.spendNotificationsDescription, {
              lineBreak: "<br><br>",
            }),
          }}
        />
      }
    >
      <RadioButtonOptions
        className="section-content"
        options={options}
        selectedOption={spendControlSettings?.spendNotificationSetting}
        onValueChange={toggleSpendNotificationHandler}
      />
    </SettingsSection>
  );
};

export default ChildSpendingNotifications;
