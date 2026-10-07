import React, { useMemo } from "react";
import { Route } from "react-router-dom";
import { UserSetting } from "@rbx/user-settings";
import { TSettingUpdateProps } from "../../../../../types/settingUpdateTypes";
import { TChildSettingsInfo } from "../../../../../types/childrenInfoTypes";
import useGetSettingsAndOptions from "../../../../apis/hooks/useGetSettingsAndOptions";
import SettingCategoryPageName from "../../../../../enums/SettingCategoryPageName";
import { TSettingsPage } from "../../../../../types/commonTypes";
import SettingsList from "../../../../common/components/routing/SettingsList";
import PartySettings from "../../privacy/PartySettings";
import VoicePrivacy from "../../privacy/VoicePrivacy";
import useGetSettingsAndOptionsV2 from "../../../../apis/hooks/useGetSettingsAndOptionsV2";
import StudioCollaboration from "../../privacy/StudioCollaboration";
import ExperienceChatPrivacyV2 from "../../privacy/ExperienceChatPrivacyV2";
import PresetChatPrivacy from "../../privacy/PresetChatPrivacy";
import { useGetSettingsUiPolicyQuery } from "../../../../apis/universalAppConfigurationApi";
import PartySettingsV2 from "../../privacy/PartySettingsV2";
import { shouldDisplayExperienceChatSubtab } from "../../../utils/experienceChatVisibilityUtils";

export const ChildCommunicationRoutes = ({
  child,
  communicationPage,
  subpages,
  onUpdateSetting,
}: {
  child: TChildSettingsInfo;
  communicationPage: TSettingsPage;
  subpages: Record<string, TSettingsPage>;
} & TSettingUpdateProps): JSX.Element => {
  const [settingsAndOptions] = useGetSettingsAndOptions(child.userId);
  const [settingsAndOptionsV2] = useGetSettingsAndOptionsV2(child.userId);
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();

  const { canSeeChatTerminology } = child;

  const canParentAccessCommunicationSettings =
    child.canParentAccessChildBasicPrivacySettings ||
    child.canParentManageChildsCommunicationSettings;

  const isPartySettingsV2RolledOut = child?.shouldDisplayPartySettingsV2;
  const displayPartySettingsV2 =
    canParentAccessCommunicationSettings &&
    settingsAndOptionsV2?.[UserSetting.whoCanPartyWithMe] &&
    isPartySettingsV2RolledOut;

  const displayPartySettings =
    canParentAccessCommunicationSettings &&
    settingsAndOptions?.[UserSetting.whoCanOneOnOnePartyWithMe] &&
    settingsAndOptions?.[UserSetting.whoCanGroupPartyWithMe];

  const displayVoiceDataSettings =
    child.canParentAccessChildBasicPrivacySettings &&
    settingsAndOptions?.[UserSetting.allowVoiceDataUsage];

  const canParentAccessExperienceChatSettings =
    canParentAccessCommunicationSettings ||
    child.canParentManageChildsInExperienceDirectChatSetting;

  const displayExperienceChatSettings =
    canParentAccessExperienceChatSettings &&
    shouldDisplayExperienceChatSubtab({ settingsAndOptions: settingsAndOptionsV2, child });

  const displayStudioCollaborationSettings =
    child.canParentViewChildCreatorCollaborationSettings &&
    settingsAndOptionsV2?.[UserSetting.allowCrossAgeGroupStudioCollaboration];

  const displayPresetChatSettings =
    child.canParentManageChildsPresetChatSetting &&
    settingsAndOptionsV2?.[UserSetting.allowPresetChat];

  const communicationSubpages: Record<string, TSettingsPage> = useMemo(() => {
    const pages = { ...subpages };

    if (!displayPartySettings || isPartySettingsV2RolledOut) {
      delete pages[SettingCategoryPageName.Party];
    }

    if (!displayPartySettingsV2) {
      delete pages[SettingCategoryPageName.PartyAndPartyChat];
      delete pages[SettingCategoryPageName.PartyAndPartyChatV2];
    } else if (canSeeChatTerminology) {
      delete pages[SettingCategoryPageName.PartyAndPartyChat];
    } else {
      delete pages[SettingCategoryPageName.PartyAndPartyChatV2];
    }

    if (!displayVoiceDataSettings) {
      delete pages[SettingCategoryPageName.VoiceDataUsage];
    }

    if (!displayExperienceChatSettings) {
      delete pages[SettingCategoryPageName.ExperienceChat];
    }
    if (!displayStudioCollaborationSettings) {
      delete pages[SettingCategoryPageName.StudioCollaboration];
    }

    if (!displayPresetChatSettings) {
      delete pages[SettingCategoryPageName.PresetChat];
    }

    return pages;
  }, [
    subpages,
    displayPartySettings,
    displayExperienceChatSettings,
    displayVoiceDataSettings,
    displayStudioCollaborationSettings,
    displayPartySettingsV2,
    displayPresetChatSettings,
    canSeeChatTerminology,
  ]);

  return (
    <React.Fragment>
      <SettingsList subPages={communicationSubpages} routingPath={communicationPage.path} />
      {displayExperienceChatSettings &&
        communicationSubpages[SettingCategoryPageName.ExperienceChat] && (
          <Route path={subpages[SettingCategoryPageName.ExperienceChat]?.path}>
            <ExperienceChatPrivacyV2 child={child} onUpdateSetting={onUpdateSetting} />
          </Route>
        )}
      {displayPartySettings && communicationSubpages[SettingCategoryPageName.Party] && (
        <Route path={subpages[SettingCategoryPageName.Party]?.path}>
          <PartySettings child={child} onUpdateSetting={onUpdateSetting} />
        </Route>
      )}
      {displayPartySettingsV2 &&
        communicationSubpages[
          canSeeChatTerminology
            ? SettingCategoryPageName.PartyAndPartyChatV2
            : SettingCategoryPageName.PartyAndPartyChat
        ] && (
          <Route
            path={
              subpages[
                canSeeChatTerminology
                  ? SettingCategoryPageName.PartyAndPartyChatV2
                  : SettingCategoryPageName.PartyAndPartyChat
              ]?.path
            }
          >
            <PartySettingsV2 child={child} onUpdateSetting={onUpdateSetting} />
          </Route>
        )}
      {displayVoiceDataSettings &&
        communicationSubpages[SettingCategoryPageName.VoiceDataUsage] && (
          <Route path={subpages[SettingCategoryPageName.VoiceDataUsage]?.path}>
            <VoicePrivacy child={child} onUpdateSetting={onUpdateSetting} />
          </Route>
        )}
      {displayStudioCollaborationSettings &&
        communicationSubpages[SettingCategoryPageName.StudioCollaboration] && (
          <Route path={subpages[SettingCategoryPageName.StudioCollaboration]?.path}>
            <StudioCollaboration child={child} onUpdateSetting={onUpdateSetting} />
          </Route>
        )}
      {displayPresetChatSettings && communicationSubpages[SettingCategoryPageName.PresetChat] && (
        <Route path={subpages[SettingCategoryPageName.PresetChat]?.path}>
          <PresetChatPrivacy child={child} onUpdateSetting={onUpdateSetting} />
        </Route>
      )}
    </React.Fragment>
  );
};

export default ChildCommunicationRoutes;
