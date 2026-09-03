import React, { useMemo, useEffect } from "react";
import { Route } from "react-router-dom";
import { useTranslation } from "react-utilities";
import { QueryStatus } from "@reduxjs/toolkit/dist/query";
import { UserSetting, useSnackbar } from "@rbx/user-settings";
import useGetSettingsAndOptions from "../../../../apis/hooks/useGetSettingsAndOptions";
import { useGetSettingsUiPolicyQuery } from "../../../../apis/universalAppConfigurationApi";
import { TSettingsPage } from "../../../../../types/commonTypes";
import SettingCategoryPageName from "../../../../../enums/SettingCategoryPageName";
import {
  privacySettingCategoryPages,
  communicationPages,
} from "../../../constants/privacy/privacyConstants";
import SettingsList from "../../../../common/components/routing/SettingsList";
import VoicePrivacy from "../VoicePrivacy";
import AvatarChatPrivacy from "../AvatarChatPrivacy";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import { useGetVoiceSettingsQuery } from "../../../../apis/voiceApi";
import {
  displayCameraSetting,
  displayDataConsentSetting,
  displayMicrophoneSetting,
} from "../../../utils/voiceAvatarChatUtils";
import PartySettings from "../PartySettings";
import PartySettingsV2 from "../PartySettingsV2";
import useGetSettingsAndOptionsV2 from "../../../../apis/hooks/useGetSettingsAndOptionsV2";
import { ExperienceChatPrivacyV2 } from "../ExperienceChatPrivacyV2";
import StudioCollaboration from "../StudioCollaboration";
import PresetChatPrivacy from "../PresetChatPrivacy";
import { shouldDisplayExperienceChatSubtab } from "../../../utils/experienceChatVisibilityUtils";

export const CommunicationRoutes = (): JSX.Element => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();

  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();
  const { data: voiceSettings, status: voiceSettingsStatus } = useGetVoiceSettingsQuery();
  const [settingsAndOptions] = useGetSettingsAndOptions();
  const [settingsAndOptionsV2] = useGetSettingsAndOptionsV2();

  useEffect(() => {
    if (
      voiceSettingsStatus === QueryStatus.rejected ||
      (voiceSettingsStatus === QueryStatus.fulfilled && !voiceSettings)
    ) {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }
  }, [voiceSettingsStatus, voiceSettings]);

  const isPartySettingsV2RolledOut = uiPolicy?.shouldDisplayPartySettingsV2;
  const canSeeChatTerminology = uiPolicy?.canSeeChatTerminology;
  // excluding party chat, party voice since not all users have it
  const displayPartySettingsV2 =
    isPartySettingsV2RolledOut && settingsAndOptionsV2?.[UserSetting.whoCanPartyWithMe];

  const displayPartySettings =
    settingsAndOptions?.[UserSetting.whoCanOneOnOnePartyWithMe] &&
    settingsAndOptions?.[UserSetting.whoCanGroupPartyWithMe];

  const displayExperienceChatSettings = shouldDisplayExperienceChatSubtab({
    settingsAndOptions: settingsAndOptionsV2,
  });

  const showNewVoiceSettingName = uiPolicy?.showDataConsentToggle;

  const displayStudioCollaborationSettings =
    settingsAndOptionsV2?.[UserSetting.allowCrossAgeGroupStudioCollaboration];

  const displayPresetChatSettings = settingsAndOptionsV2?.[UserSetting.allowPresetChat];

  const communicationSubpages: Record<string, TSettingsPage> = useMemo(() => {
    const subpages: Record<string, TSettingsPage> = { ...communicationPages };
    if (!displayPartySettings || isPartySettingsV2RolledOut) {
      delete subpages[SettingCategoryPageName.Party];
    }

    if (!displayPartySettingsV2) {
      delete subpages[SettingCategoryPageName.PartyAndPartyChat];
      delete subpages[SettingCategoryPageName.PartyAndPartyChatV2];
    } else if (canSeeChatTerminology) {
      delete subpages[SettingCategoryPageName.PartyAndPartyChat];
    } else {
      delete subpages[SettingCategoryPageName.PartyAndPartyChatV2];
    }

    if (
      !displayMicrophoneSetting(voiceSettings, uiPolicy) &&
      !displayDataConsentSetting(settingsAndOptions, uiPolicy)
    ) {
      delete subpages[SettingCategoryPageName.Voice];
      delete subpages[SettingCategoryPageName.VoiceDataUsage];
    } else if (showNewVoiceSettingName) {
      delete subpages[SettingCategoryPageName.Voice];
    } else {
      delete subpages[SettingCategoryPageName.VoiceDataUsage];
    }

    if (!displayCameraSetting(voiceSettings, uiPolicy)) {
      delete subpages[SettingCategoryPageName.Camera];
    }

    if (!displayExperienceChatSettings) {
      delete subpages[SettingCategoryPageName.ExperienceChat];
    }

    if (!displayStudioCollaborationSettings) {
      delete subpages[SettingCategoryPageName.StudioCollaboration];
    }

    if (!displayPresetChatSettings) {
      delete subpages[SettingCategoryPageName.PresetChat];
    }

    return subpages;
  }, [
    displayPartySettings,
    displayPartySettingsV2,
    canSeeChatTerminology,
    uiPolicy,
    voiceSettings,
    displayExperienceChatSettings,
    settingsAndOptions,
    showNewVoiceSettingName,
    displayPresetChatSettings,
  ]);

  const voiceSettingCategoryPageName = showNewVoiceSettingName
    ? SettingCategoryPageName.VoiceDataUsage
    : SettingCategoryPageName.Voice;

  return (
    <React.Fragment>
      <SettingsList
        subPages={communicationSubpages}
        routingPath={privacySettingCategoryPages[SettingCategoryPageName.Communication].path}
      />
      {displayExperienceChatSettings && (
        <Route path={communicationPages[SettingCategoryPageName.ExperienceChat].path}>
          <ExperienceChatPrivacyV2 />
        </Route>
      )}
      {displayPartySettings && (
        <Route path={communicationPages[SettingCategoryPageName.Party].path}>
          <PartySettings />
        </Route>
      )}
      {displayPartySettingsV2 && (
        <Route
          path={
            communicationPages[
              canSeeChatTerminology
                ? SettingCategoryPageName.PartyAndPartyChatV2
                : SettingCategoryPageName.PartyAndPartyChat
            ].path
          }
        >
          <PartySettingsV2 />
        </Route>
      )}
      {(displayMicrophoneSetting(voiceSettings, uiPolicy) ||
        displayDataConsentSetting(settingsAndOptions, uiPolicy)) && (
        <Route path={communicationPages[voiceSettingCategoryPageName].path}>
          <VoicePrivacy />
        </Route>
      )}
      {displayCameraSetting(voiceSettings, uiPolicy) && (
        <Route path={communicationPages[SettingCategoryPageName.Camera].path}>
          <AvatarChatPrivacy />
        </Route>
      )}
      {displayStudioCollaborationSettings && (
        <Route path={communicationPages[SettingCategoryPageName.StudioCollaboration].path}>
          <StudioCollaboration />
        </Route>
      )}
      {displayPresetChatSettings && (
        <Route path={communicationPages[SettingCategoryPageName.PresetChat].path}>
          <PresetChatPrivacy />
        </Route>
      )}
    </React.Fragment>
  );
};

export default CommunicationRoutes;
