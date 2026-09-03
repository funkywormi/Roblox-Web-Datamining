import React, { useEffect } from "react";
import { UserSetting } from "@rbx/user-settings";
import SettingCategoryPageName from "../../../../enums/SettingCategoryPageName";
import {
  shouldDisplayInitialModal,
  signalRedirectionCheckComplete,
} from "../../utils/hybridViewUtils";
import { communicationPages } from "../../constants/privacy/privacyConstants";
import useGetSettingsAndOptionsV2 from "../../../apis/hooks/useGetSettingsAndOptionsV2";
import { getRouterAbsolutePath } from "../../constants/urlConstants";
import useAgeVerificationUpsell from "../../hooks/useAgeVerificationUpsell";
import { isAtTargetPath, redirectQueryParam } from "../../utils/navigationUtils";
import { eventConstants } from "../../constants/eventConstants";

const CreatorCollaborationRedirectHandler = (): JSX.Element => {
  const [settingsAndOptionsV2, isSettingsAndOptionsV2Loading] = useGetSettingsAndOptionsV2();
  const {
    faeAvailable,
    vpcForFaeAvailable,
    handleVpcForFaeClick,
    handleFAEClick,
    isLoading: isAgeVerificationUpsellLoading,
  } = useAgeVerificationUpsell();

  useEffect(() => {
    const shouldCheckForCreatorCollaborationRedirection = shouldDisplayInitialModal(
      redirectQueryParam.creatorCollaboration,
    );
    if (!shouldCheckForCreatorCollaborationRedirection) {
      return;
    }

    // If we're already on the StudioCollaboration setting page, just allow the page to load
    const targetPath = communicationPages[SettingCategoryPageName.StudioCollaboration].path;
    if (isAtTargetPath(targetPath)) {
      signalRedirectionCheckComplete();
      return;
    }

    // If user has studio collaboration setting available, redirect to the setting page
    if (settingsAndOptionsV2?.[UserSetting.allowCrossAgeGroupStudioCollaboration]) {
      const studioCollaborationUrl = new URL(getRouterAbsolutePath(targetPath));
      studioCollaborationUrl.searchParams.set(redirectQueryParam.creatorCollaboration, "");
      window.location.href = studioCollaborationUrl.toString();
      return;
    }

    // Otherwie upsell user on FAE if eligible
    if (!isSettingsAndOptionsV2Loading) {
      if (!faeAvailable && vpcForFaeAvailable) {
        handleVpcForFaeClick(eventConstants.sourceStudio);
      } else if (faeAvailable) {
        handleFAEClick(eventConstants.sourceStudio);
      }
      signalRedirectionCheckComplete();
    }

    // If both checks are resolved and no redirect nor upsell is needed, allow page to load.
    if (!isSettingsAndOptionsV2Loading && !isAgeVerificationUpsellLoading) {
      signalRedirectionCheckComplete();
    }
  }, [
    settingsAndOptionsV2,
    faeAvailable,
    isSettingsAndOptionsV2Loading,
    isAgeVerificationUpsellLoading,
  ]);

  return <React.Fragment />;
};

export default CreatorCollaborationRedirectHandler;
