import React from "react";
import { UserSetting } from "@rbx/user-settings";
import baseApi from "../../../../apis/common/baseApi";
import ApiCacheTag from "../../../../apis/common/cacheTagEnum";
import useGetSettingsAndOptions from "../../../../apis/hooks/useGetSettingsAndOptions";
import { useAppDispatch } from "../../../../redux/hooks";
import useStartOdpWizard from "../../../hooks/useStartOdpWizard";
import ScreentimeLimitControl from "../shared/ScreentimeLimitControl";

const odpFlowName = "ODP";
const updateUserSettingRequestType = "UpdateUserSetting";
const surface = "ParentalControlsSettings";

/**
 * The child's daily screen time limit but for their on-device parent to set it.
 */
export const OdpScreentimeLimitPage = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const startOdpWizard = useStartOdpWizard();
  const [userSettings] = useGetSettingsAndOptions();

  const saveScreentimeLimit = async (newValue: number): Promise<void> => {
    await startOdpWizard({
      flow: {
        name: odpFlowName,
        props: {
          requestType: updateUserSettingRequestType,
          requestDetails: { [UserSetting.dailyScreenTimeLimit]: String(newValue) },
          isOdpInitiated: true,
        },
      },
      surface,
    });

    dispatch(baseApi.util.invalidateTags([ApiCacheTag.UserSettingsAndOptions]));
  };

  return (
    <ScreentimeLimitControl
      currentLimitMinutes={userSettings?.dailyScreenTimeLimit?.currentValue}
      inputId="odp-screentime-limit-dropdown"
      onSelectLimit={saveScreentimeLimit}
    />
  );
};

export default OdpScreentimeLimitPage;
