import {
  TUpdateChildSettingsError,
  TUpdateUserSettingValueResponseBody,
  TUpdateUserSettingValueRequest,
  UpdateChildSettingsErrorCode,
  UserSetting,
} from "@rbx/user-settings";
import commonTranslationConstants from "../constants/contentConstants/commonTranslationConstants";
import parentalControlsTranslationConstants from "../constants/contentConstants/parentalControlsTranslationConstants";
import privacyTranslationConstants from "../constants/contentConstants/privacyTranslationConstants";
import { getVerificationPageUrl } from "../constants/urlConstants";

export const getSuccessMessageKeyForUserSettingsUpdate = (
  request: TUpdateUserSettingValueRequest,
  result: TUpdateUserSettingValueResponseBody,
): string | null => {
  if (result.settingUpdateBlocked) {
    // If setting update is blocked, don't show a success message
    return null;
  }

  if (
    (result?.cascadingSettingUpdates && Object.keys(result.cascadingSettingUpdates).length > 0) ||
    result?.details?.cascadingSettingsUpdated
  ) {
    // If there were any cascading setting updates, display the appropriate success message
    switch (request.setting) {
      case UserSetting.whoCanSeeMyOnlineStatus:
        return privacyTranslationConstants.onlineStatusCascadingUpdatesSuccessMessage;
      case UserSetting.whoCanJoinMeInExperiences:
        return privacyTranslationConstants.currentExperienceCascadingUpdatesSuccessMessage;
      case UserSetting.whoCanSeeMyInventory:
        return privacyTranslationConstants.inventoryVisibilityCascadingUpdatesSuccessMessage;
      case UserSetting.whoCanChatWithMeInExperiences:
        return privacyTranslationConstants.experienceChatCascadingUpdatesSuccessMessage;
      case UserSetting.whoCanChatWithMeInApp:
        return privacyTranslationConstants.directChatCascadingUpdatesSuccessMessage;
      case UserSetting.whoCanOneOnOnePartyWithMe:
        return privacyTranslationConstants.partyPrivacyCascadingUpdatesSuccessMessage;
      default:
        return commonTranslationConstants.successDialogMessage;
    }
  }
  return commonTranslationConstants.successDialogMessage;
};

export const handleChildSettingsUpdateError = (
  error: unknown,
  childUserId?: number,
): string | null => {
  const err = error as TUpdateChildSettingsError;
  const errorCode = err?.data?.code;

  if (errorCode === UpdateChildSettingsErrorCode.ParentNotVerified && childUserId) {
    window.location.href = getVerificationPageUrl(childUserId);
    return null;
  }

  switch (errorCode) {
    case UpdateChildSettingsErrorCode.SettingsUpdateInheritanceViolation:
      return parentalControlsTranslationConstants.parentalConsents
        .settingsUpdateInheritanceViolationError;

    default:
      return commonTranslationConstants.unknownError;
  }
};
