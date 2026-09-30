import React from "react";
import { startWizard } from "@rbx/amp-v2-wizard";
import { UserSetting } from "@rbx/user-settings";
import baseApi from "../../../../apis/common/baseApi";
import ApiCacheTag from "../../../../apis/common/cacheTagEnum";
import useGetSettingsAndOptions from "../../../../apis/hooks/useGetSettingsAndOptions";
import { useAppDispatch } from "../../../../redux/hooks";
import ScreentimeLimitControl from "../shared/ScreentimeLimitControl";

const odpFlowName = "ODP";
const updateUserSettingRequestType = "UpdateUserSetting";
const surface = "ParentalControlsSettings";

/**
 * The child's daily screen time limit but for their on-device parent to set it.
 */
export const OdpScreentimeLimitPage = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const [userSettings] = useGetSettingsAndOptions();

  const saveScreentimeLimit = async (newValue: number): Promise<void> => {
    await startWizard({
      flow: {
        name: odpFlowName,
        props: {
          requestType: updateUserSettingRequestType,
          requestDetails: { [UserSetting.dailyScreenTimeLimit]: String(newValue) },
          isOdpInitiated: true,
        },
      },
      surface,
    }).catch(() => {
      // startWizard resolves on every exit, so there is nothing to recover from here.
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
