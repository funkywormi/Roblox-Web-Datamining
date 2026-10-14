import React, { useEffect } from "react";
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
import useStartOdpWizard from "../../../hooks/useStartOdpWizard";
import RobuxTransferLimitsForm from "../shared/RobuxTransferLimitsForm";
import RobuxSettingName from "../../../../../enums/RobuxSettingName";
import { trackCounter } from "./observability";
import { ParentZoneCounter } from "./observability/eventConstants";

const odpFlowName = "ODP";
const updateUserSettingRequestType = "UpdateUserSetting";
const surface = "ParentalControlsSettings";

/**
 * The child's Robux transfer caps as their on-device parent sets them.
 * On-device parent can change transfer limit through entering their parent PIN
 */
export const OdpRobuxTransferLimits = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const startOdpWizard = useStartOdpWizard();

  const {
    data: ceilings,
    isLoading: isCeilingsLoading,
    isError: isCeilingsError,
  } = useGetCurrentUserTransferLimitCeilingsQuery();
  const [childSettings, isChildSettingsLoading, isChildSettingsError] =
    useGetSettingsAndOptionsV2();

  useEffect(() => {
    trackCounter(ParentZoneCounter.PageShown, { page: RobuxSettingName.TransferLimits });
  }, []);
  const isLoadError = isCeilingsError || isChildSettingsError;
  useEffect(() => {
    if (isLoadError) {
      trackCounter(ParentZoneCounter.SettingsPageLoadFailed, {
        page: RobuxSettingName.TransferLimits,
      });
    }
  }, [isLoadError]);

  const saveTransferLimitsHandler = async (limits: TRobuxTransferLimitsInput): Promise<void> => {
    await startOdpWizard({
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
