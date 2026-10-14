import React from "react";
import { QueryStatus } from "@reduxjs/toolkit/query";
import { useTranslation } from "react-utilities";
import { Loading } from "react-style-guide";
import { TUpdateUserSettingValueRequest, UserSetting, useSnackbar } from "@rbx/user-settings";
import { useUpdateUserSettingValueMutation } from "../../../../apis/userSettingsApi";
import useGetSettingsAndOptions from "../../../../apis/hooks/useGetSettingsAndOptions";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import { handleChildSettingsUpdateError } from "../../../utils/successMessageUtils";
import InformationalScreen from "../../../../common/components/InformationalScreen";
import ScreentimeLimitControl from "../shared/ScreentimeLimitControl";

const ChildScreentimeLimit = ({ child }: { child: TChildInfo }): JSX.Element => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();
  const [childSettings, status] = useGetSettingsAndOptions(child.userId, {
    showErrorSnackbar: false,
  });
  const [updateChildSettings] = useUpdateUserSettingValueMutation();

  const saveScreentimeLimitHandler = async (newValue: number) => {
    const updateBody: TUpdateUserSettingValueRequest = {
      childUserId: child.userId,
      setting: UserSetting.dailyScreenTimeLimit,
      value: newValue,
    };
    try {
      await updateChildSettings(updateBody).unwrap();
      snackbarService.success(translate(commonTranslationConstants.successDialogMessage));
    } catch (error) {
      const errorKey = handleChildSettingsUpdateError(error, child.userId);
      if (errorKey) {
        snackbarService.warning(translate(errorKey));
      }
    }
  };

  if (status === QueryStatus.rejected) {
    return (
      <InformationalScreen descriptionTranslationKey={commonTranslationConstants.unknownError} />
    );
  }
  if (status === QueryStatus.pending && !childSettings) {
    return <Loading />;
  }
  return (
    <ScreentimeLimitControl
      currentLimitMinutes={childSettings?.dailyScreenTimeLimit?.currentValue}
      inputId="child-screentime-limit-dropdown"
      onSelectLimit={saveScreentimeLimitHandler}
    />
  );
};

export default ChildScreentimeLimit;
