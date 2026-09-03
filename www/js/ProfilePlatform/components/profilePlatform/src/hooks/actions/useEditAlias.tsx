import { useCallback } from "react";
import { useSystemFeedback } from "@rbx/core-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { Component as ProfileComponent } from "@rbx/profile-platform";
import { useProfilePlatformContext } from "../../context/ProfilePlatformContext";
import useProfileJsonComponent from "../useProfileJsonComponent";
import useEditAliasDialog from "../useEditAliasDialog";
import EditAliasDialog from "../../components/EditAliasDialog";
import type { ActionHookResult } from "../../types/actionHookTypes";

const useEditAlias = (): ActionHookResult => {
  const { profileData, refreshProfilePlatform, profileType } = useProfilePlatformContext();
  const userProfileHeaderData = useProfileJsonComponent(ProfileComponent.UserProfileHeader);
  const { systemFeedbackService } = useSystemFeedback();
  const { translate } = useTranslation();
  const profileId = profileData?.profileId;
  const primaryName = userProfileHeaderData?.names.primaryName ?? "";
  const displayName = userProfileHeaderData?.names.displayName ?? "";
  const {
    aliasValue,
    handleAliasInputChange,
    handleCloseDialog,
    handleEditAlias,
    handleSaveAlias,
    hasErrored,
    isEditAliasDialogOpen,
    maxCharacters,
    textCount,
  } = useEditAliasDialog({
    profileId,
    profileType,
    primaryName,
    refreshProfilePlatform,
    translate,
    systemFeedbackService,
  });

  const handleSaveAliasClick = useCallback(() => {
    handleSaveAlias();
  }, [handleSaveAlias]);

  const namePrompt = displayName || primaryName;
  const Component = () => (
    <EditAliasDialog
      open={isEditAliasDialogOpen}
      onOpenChange={handleCloseDialog}
      onClose={handleCloseDialog}
      onSave={handleSaveAliasClick}
      onAliasInputChange={handleAliasInputChange}
      aliasValue={aliasValue}
      hasErrored={hasErrored}
      textCount={textCount}
      maxCharacters={maxCharacters}
      namePrompt={namePrompt}
    />
  );

  return { handler: handleEditAlias, Component };
};

export default useEditAlias;
