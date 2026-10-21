import React, { useEffect } from "react";
import { QueryStatus } from "@reduxjs/toolkit/query";
import { Loading } from "react-style-guide";
import { UserSetting } from "@rbx/user-settings";
import baseApi from "../../../../apis/common/baseApi";
import ApiCacheTag from "../../../../apis/common/cacheTagEnum";
import useGetSettingsAndOptions from "../../../../apis/hooks/useGetSettingsAndOptions";
import { useAppDispatch } from "../../../../redux/hooks";
import InformationalScreen from "../../../../common/components/InformationalScreen";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import useStartOdpWizard from "../../../hooks/useStartOdpWizard";
import ScreentimeLimitControl from "../shared/ScreentimeLimitControl";
import ParentalControlsPageName from "../../../../../enums/parentalControls/ParentalControlsPageName";
import {
  formInteractionOdpSetting,
  msgShownOdpParentZoneError,
} from "../../../services/eventServices/odpFamilyEventService";
import { useGetParentInfoQuery } from "../../../../apis/parentalControlsApi";
import { trackCounter } from "./observability";
import { ParentZoneCounter } from "./observability/eventConstants";

const odpFlowName = "ODP";
const updateUserSettingRequestType = "UpdateUserSetting";
const surface = "ParentalControlsSettings";

/**
 * The child's daily screen time limit but for their on-device parent to set it.
 */
export const OdpScreentimeLimitPage = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const startOdpWizard = useStartOdpWizard();
  const [userSettings, status] = useGetSettingsAndOptions(undefined, { showErrorSnackbar: false });
  const isError = status === QueryStatus.rejected;

  const { data: parentInfo, isLoading: isParentInfoLoading } = useGetParentInfoQuery();
  const parents = parentInfo?.parents;

  useEffect(() => {
    if (isError && !isParentInfoLoading) {
      msgShownOdpParentZoneError(ParentalControlsPageName.ScreentimeManagement, parents);
    }
  }, [isError, isParentInfoLoading, parents]);

  useEffect(() => {
    trackCounter(ParentZoneCounter.PageShown, {
      page: ParentalControlsPageName.ScreentimeManagement,
    });
  }, []);
  const isLoadError = status === QueryStatus.rejected;
  useEffect(() => {
    if (isLoadError) {
      trackCounter(ParentZoneCounter.SettingsPageLoadFailed, {
        page: ParentalControlsPageName.ScreentimeManagement,
      });
    }
  }, [isLoadError]);

  const saveScreentimeLimit = async (newValue: number): Promise<void> => {
    formInteractionOdpSetting(
      ParentalControlsPageName.ScreentimeManagement,
      UserSetting.dailyScreenTimeLimit,
      newValue,
      parents,
    );
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

  if (isError) {
    return (
      <InformationalScreen descriptionTranslationKey={commonTranslationConstants.unknownError} />
    );
  }
  if (status === QueryStatus.pending && !userSettings) {
    return <Loading />;
  }
  return (
    <ScreentimeLimitControl
      currentLimitMinutes={userSettings?.dailyScreenTimeLimit?.currentValue}
      inputId="odp-screentime-limit-dropdown"
      onSelectLimit={saveScreentimeLimit}
    />
  );
};

export default OdpScreentimeLimitPage;
