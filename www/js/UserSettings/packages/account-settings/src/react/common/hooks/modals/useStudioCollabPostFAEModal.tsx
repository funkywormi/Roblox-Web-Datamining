import React from "react";
import { useTranslation } from "react-utilities";
import {
  useSettingsModal,
  CrossAgeGroupCollaborationValue,
  TUpdateUserSettingValueRequest,
  TUserSettingsAndOptionsV2,
  TUserSettingsAndOptionsV2Body,
  UserSetting,
  useSnackbar,
} from "@rbx/user-settings";
import RouterPath from "../../../../enums/RouterPath";
import SettingCategoryPageName from "../../../../enums/SettingCategoryPageName";
import { getRequiredActionsFromOptionsV2 } from "../../../../core/utils/settingOptionsUtils";
import {
  getRouterAbsolutePath,
  settingsRouterPath,
  trustedConnectionsHelpPageUrl,
} from "../../../userSettings/constants/urlConstants";
import { useUpdateUserSettingValueMutation } from "../../../apis/userSettingsApi";
import {
  handleChildSettingsUpdateError,
  getSuccessMessageKeyForUserSettingsUpdate,
} from "../../../userSettings/utils/successMessageUtils";
import {
  isAtTargetPath,
  redirectQueryParam,
  removeQueryParamFromUrl,
} from "../../../userSettings/utils/navigationUtils";
import { communicationPages } from "../../../userSettings/constants/privacy/privacyConstants";
import useGetSettingsAndOptionsV2 from "../../../apis/hooks/useGetSettingsAndOptionsV2";
import privacyTranslationConstants from "../../../userSettings/constants/contentConstants/privacyTranslationConstants";
import commonTranslationConstants from "../../../userSettings/constants/contentConstants/commonTranslationConstants";

const useStudioCollabPostFAEModal = (): [
  React.JSX.Element,
  (freshSettingsData?: TUserSettingsAndOptionsV2Body) => void,
] => {
  const { snackbarService } = useSnackbar();
  const { translate } = useTranslation();
  const { studioCollabTCAndVPCModal } = privacyTranslationConstants;

  const [updateSettingValue] = useUpdateUserSettingValueMutation();
  const [settingsAndOptions] = useGetSettingsAndOptionsV2();

  const updateToOlderAgeGroupsAllowed = async (
    freshSettingsAndOptions?: TUserSettingsAndOptionsV2<CrossAgeGroupCollaborationValue>,
    usePrologue = true,
  ) => {
    const requiredActions = getRequiredActionsFromOptionsV2(
      freshSettingsAndOptions ??
        settingsAndOptions?.[UserSetting.allowCrossAgeGroupStudioCollaboration],
      CrossAgeGroupCollaborationValue.OlderAgeGroupsAllowed,
    );
    const updateBody: TUpdateUserSettingValueRequest = {
      setting: UserSetting.allowCrossAgeGroupStudioCollaboration,
      value: CrossAgeGroupCollaborationValue.OlderAgeGroupsAllowed,
      usePrologue,
      useRequirementsMapV2: true,
      requiredActionsOverride: requiredActions,
    };
    try {
      // VPC request (if required) is handled internally by updateSettingValue
      const result = await updateSettingValue(updateBody).unwrap();
      const successMessageKey = getSuccessMessageKeyForUserSettingsUpdate(updateBody, result);
      if (successMessageKey) {
        snackbarService.success(translate(successMessageKey));
      }
    } catch (error) {
      const errorKey = handleChildSettingsUpdateError(error);
      if (errorKey) {
        snackbarService.warning(translate(errorKey));
      }
    }
  };

  // Modal upselling user on adding trusted connections or VPC
  const [trustedConnectionsVPCModal, trustedConnectionsVPCModalService] = useSettingsModal({
    translatedTitle: translate(studioCollabTCAndVPCModal.title),
    translatedBody: (
      <span
        dangerouslySetInnerHTML={{
          __html: translate(studioCollabTCAndVPCModal.description, {
            lineBreak: "<br><br>",
          }),
        }}
      />
    ),
    translatedActionButtonText: translate(studioCollabTCAndVPCModal.actionButtonText),
    translatedSecondaryButtonText: translate(studioCollabTCAndVPCModal.neutralButtonText),
    translatedCloseLabel: translate(commonTranslationConstants.modal.closeBtn),
    size: "Medium",
    onAction: () => window.open(trustedConnectionsHelpPageUrl, "_blank"),
    onSecondary: async () => {
      await updateToOlderAgeGroupsAllowed(undefined, false);
    },
    shouldCloseModalOnActionButton: false,
  });

  // Triggers post FAE modals, if any
  // Optionally provide fresh settings data to bypass the cache
  // Because this function might be called before the component has re-rendered with fresh data
  const triggerPostFAEModals = async (freshSettingsData?: TUserSettingsAndOptionsV2Body) => {
    // Use fresh data if provided, otherwise fall back to cached settings
    const studioCollabSettingAndOptions = freshSettingsData
      ? freshSettingsData[UserSetting.allowCrossAgeGroupStudioCollaboration]
      : settingsAndOptions?.[UserSetting.allowCrossAgeGroupStudioCollaboration];

    if (!studioCollabSettingAndOptions) {
      // Clean up query param before redirecting or returning
      removeQueryParamFromUrl(redirectQueryParam.creatorCollaboration);
      // Redirect to account info page if studio collaboration setting is no longer available due to age up
      // Only redirect if we're currently on the studio collaboration setting page
      const studioCollabPath = communicationPages[SettingCategoryPageName.StudioCollaboration].path;
      if (isAtTargetPath(studioCollabPath)) {
        window.location.href = settingsRouterPath.accountInfo;
      }
      return;
    }

    // Redirect to studio collab page if the setting became available due to age down
    // Only redirect if we're currently on the account info page
    // Include creatorCollaboration param so modal triggers after redirect
    if (isAtTargetPath(`/${RouterPath.Info}`)) {
      const studioCollabPath = communicationPages[SettingCategoryPageName.StudioCollaboration].path;
      const studioCollabUrl = new URL(getRouterAbsolutePath(studioCollabPath));
      studioCollabUrl.searchParams.set(redirectQueryParam.creatorCollaboration, "");
      window.location.href = studioCollabUrl.toString();
      return;
    }

    // Clean up query param now that we're staying on the current page
    removeQueryParamFromUrl(redirectQueryParam.creatorCollaboration);

    if (
      studioCollabSettingAndOptions.options.some(
        option =>
          option.option.optionValue === CrossAgeGroupCollaborationValue.SimilarOrTrustedConnections,
      )
    ) {
      trustedConnectionsVPCModalService.open();
    } else {
      await updateToOlderAgeGroupsAllowed(studioCollabSettingAndOptions);
    }
  };

  return [trustedConnectionsVPCModal, triggerPostFAEModals];
};

export default useStudioCollabPostFAEModal;
