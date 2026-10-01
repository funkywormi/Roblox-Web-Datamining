import React from "react";
import { startWizard } from "@rbx/amp-v2-wizard";
import {
  buildRobuxTransferLimitsConsentValue,
  toRobuxTransferLimitsInputFromSetting,
  TRobuxTransferLimitsInput,
  UserSetting,
} from "@rbx/user-settings";
import baseApi from "../../../../apis/common/baseApi";
import ApiCacheTag from "../../../../apis/common/cacheTagEnum";
import { useGetCurrentUserTransferLimitCeilingsQuery } from "../../../../apis/transferLimitsApi";
import useGetSettingsAndOptionsV2 from "../../../../apis/hooks/useGetSettingsAndOptionsV2";
import { useAppDispatch } from "../../../../redux/hooks";
import RobuxTransferLimitsForm from "../shared/RobuxTransferLimitsForm";

const odpFlowName = "ODP";
const updateUserSettingRequestType = "UpdateUserSetting";
const surface = "ParentalControlsSettings";

/**
 * The child's Robux transfer caps as their on-device parent sets them.
 * On-device parent can change transfer limit through entering their parent PIN
 */
export const OdpRobuxTransferLimits = (): React.JSX.Element => {
  const dispatch = useAppDispatch();

  const {
    data: ceilings,
    isLoading: isCeilingsLoading,
    isError: isCeilingsError,
  } = useGetCurrentUserTransferLimitCeilingsQuery();
  const [childSettings, isChildSettingsLoading, isChildSettingsError] =
    useGetSettingsAndOptionsV2();

  const saveTransferLimitsHandler = async (limits: TRobuxTransferLimitsInput): Promise<void> => {
    await startWizard({
      flow: {
        name: odpFlowName,
        props: {
          requestType: updateUserSettingRequestType,
          requestDetails: {
            [UserSetting.robuxTransferLimits]: buildRobuxTransferLimitsConsentValue(limits),
          },
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
    <RobuxTransferLimitsForm
      ceilings={ceilings}
      storedCaps={toRobuxTransferLimitsInputFromSetting(childSettings?.robuxTransferLimits)}
      isLoading={isCeilingsLoading || isChildSettingsLoading}
      isError={isCeilingsError || isChildSettingsError}
      inputIdPrefix="odp-robux"
      onSave={saveTransferLimitsHandler}
    />
  );
};

export default OdpRobuxTransferLimits;
