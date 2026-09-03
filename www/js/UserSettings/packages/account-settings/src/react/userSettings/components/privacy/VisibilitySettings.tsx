import React, { useMemo } from "react";
import {
  CommunicationPrivacyLevel,
  UserPrivacyLevel,
  TUpdateUserSettingValueRequest,
  UserSetting,
  useSnackbar,
} from "@rbx/user-settings";
import { useWrappedTranslation } from "../../hooks/useWrappedTranslation";
import { useGetSettingsUiPolicyQuery } from "../../../apis/universalAppConfigurationApi";
import SettingsSection from "../../../common/components/SettingsSection";
import ToggleWithParentalConsent from "../../../common/components/ToggleWithParentalConsent";
import RadioButtonOptionsWithParentalConsent from "../../../common/components/RadioButtonOptionsWithParentalConsent";
import useGetSettingsAndOptions from "../../../apis/hooks/useGetSettingsAndOptions";
import { filterRadioButtonOptions } from "../../../../core/utils/settingOptionsUtils";
import { useUpdateUserSettingValueMutation } from "../../../apis/userSettingsApi";
import privacyTranslationConstants from "../../constants/contentConstants/privacyTranslationConstants";
import {
  getJoinPrivacyOptions,
  getOnlineStatusOptions,
} from "../../constants/privacy/privacyConstants";
import SocialNetworkVisibility from "../accountInfo/SocialNetworkVisibility";
import {
  handleChildSettingsUpdateError,
  getSuccessMessageKeyForUserSettingsUpdate,
} from "../../utils/successMessageUtils";
import { TChildInfo } from "../../../../types/childrenInfoTypes";
import { shareActivityUpdatesHelpPageUrl } from "../../constants/urlConstants";

export const VisibilitySettings = ({ child }: { child?: TChildInfo }): JSX.Element => {
  const childUserId = child?.userId;
  const { translate } = useWrappedTranslation();
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();
  const shouldShowGenericShareActivityUpdatesCopy = child?.userId
    ? child.shouldShowGenericShareActivityUpdatesCopy
    : uiPolicy?.shouldShowGenericShareActivityUpdatesCopy;
  const isTrustedFriendsInVisibilitySettingsRolledOut = childUserId
    ? child?.isTrustedFriendsInVisibilitySettingsRolledOut
    : uiPolicy?.isTrustedFriendsInVisibilitySettingsRolledOut;
  const { snackbarService } = useSnackbar();
  const [updateSettingValue] = useUpdateUserSettingValueMutation();

  const [settingsAndOptions] = useGetSettingsAndOptions(childUserId);

  const updateJoinExperiencePrivacy = async (newPrivacyLevel: CommunicationPrivacyLevel) => {
    const updateBody: TUpdateUserSettingValueRequest = {
      childUserId,
      setting: UserSetting.whoCanJoinMeInExperiences,
      value: newPrivacyLevel,
    };
    try {
      const result = await updateSettingValue(updateBody).unwrap();
      const successMessageKey = getSuccessMessageKeyForUserSettingsUpdate(updateBody, result);
      if (successMessageKey) {
        snackbarService.success(translate(successMessageKey));
      }
    } catch (error) {
      const errorKey = handleChildSettingsUpdateError(error, childUserId);
      if (errorKey) {
        snackbarService.warning(translate(errorKey));
      }
    }
  };

  const updateOnlineStatusPrivacy = async (newPrivacyLevel: UserPrivacyLevel) => {
    const updateBody: TUpdateUserSettingValueRequest = {
      childUserId,
      setting: UserSetting.whoCanSeeMyOnlineStatus,
      value: newPrivacyLevel,
    };
    try {
      const result = await updateSettingValue(updateBody).unwrap();
      const successMessageKey = getSuccessMessageKeyForUserSettingsUpdate(updateBody, result);
      if (successMessageKey) {
        snackbarService.success(translate(successMessageKey));
      }
    } catch (error) {
      const errorKey = handleChildSettingsUpdateError(error, childUserId);
      if (errorKey) {
        snackbarService.warning(translate(errorKey));
      }
    }
  };

  const onlineStatusOptions = useMemo(() => {
    let options = getOnlineStatusOptions();
    if (!isTrustedFriendsInVisibilitySettingsRolledOut) {
      options = options.filter(o => o.value !== UserPrivacyLevel.TrustedFriends);
    }
    options = filterRadioButtonOptions(
      options,
      settingsAndOptions?.whoCanSeeMyOnlineStatus?.options || [],
    );
    return options;
  }, [settingsAndOptions, isTrustedFriendsInVisibilitySettingsRolledOut]);

  const joinExperiencePrivacyOptions = useMemo(() => {
    let options = getJoinPrivacyOptions();
    if (!isTrustedFriendsInVisibilitySettingsRolledOut) {
      options = options.filter(o => o.value !== CommunicationPrivacyLevel.TrustedFriends);
    }
    options = filterRadioButtonOptions(
      options,
      settingsAndOptions?.whoCanJoinMeInExperiences?.options || [],
    );
    return options;
  }, [settingsAndOptions, isTrustedFriendsInVisibilitySettingsRolledOut]);

  return (
    <SettingsSection
      description={translate(privacyTranslationConstants.inheritedSettingsDescription)}
    >
      <React.Fragment>
        {/* Online status setting */}
        {settingsAndOptions?.[UserSetting.whoCanSeeMyOnlineStatus] && (
          <RadioButtonOptionsWithParentalConsent
            title={translate(privacyTranslationConstants.onlineStatusLabel)}
            settingName={UserSetting.whoCanSeeMyOnlineStatus}
            options={onlineStatusOptions}
            className="section-content"
            childUserId={childUserId}
            onOptionSelected={updateOnlineStatusPrivacy}
            description={
              childUserId
                ? translate(privacyTranslationConstants.parentSideOnlineStatusDescription)
                : translate(privacyTranslationConstants.onlineStatusDescription)
            }
            id="online-status-privacy"
          />
        )}

        {/* Show current experience privacy */}
        <RadioButtonOptionsWithParentalConsent
          title={translate(privacyTranslationConstants.showCurrentExperienceLabel)}
          settingName={UserSetting.whoCanJoinMeInExperiences}
          options={joinExperiencePrivacyOptions}
          className="section-content"
          childUserId={childUserId}
          onOptionSelected={updateJoinExperiencePrivacy}
          description={
            childUserId
              ? translate(privacyTranslationConstants.parentSideShowCurrentExperienceDescription)
              : translate(privacyTranslationConstants.showCurrentExperienceDescription)
          }
          id="show-current-experience-privacy"
        />

        {/* Share activity updates setting */}
        {settingsAndOptions?.[UserSetting.updateFriendsAboutMyActivity] && (
          <ToggleWithParentalConsent
            label={translate(privacyTranslationConstants.shareActivityUpdatesLabel)}
            settingName={UserSetting.updateFriendsAboutMyActivity}
            childUserId={childUserId}
            description={
              <span
                dangerouslySetInnerHTML={{
                  __html: translate(
                    childUserId
                      ? shouldShowGenericShareActivityUpdatesCopy
                        ? privacyTranslationConstants.parentSideShareActivityUpdatesDescriptionV2
                        : privacyTranslationConstants.parentSideShareActivityUpdatesDescription
                      : shouldShowGenericShareActivityUpdatesCopy
                        ? privacyTranslationConstants.shareActivityUpdatesDescriptionV2
                        : privacyTranslationConstants.shareActivityUpdatesDescription,
                    {
                      LinkStart: `<a class="text-link" rel="noreferrer" target="_blank" href="${shareActivityUpdatesHelpPageUrl}">`,
                      LinkEnd: "</a>",
                    },
                  ),
                }}
              />
            }
            inputId="share-activity-updates-toggle"
          />
        )}

        {/* Social networks visibility setting */}
        {/* This only exists in visibility settings for parent view */}
        {/* For child-side view, it lives in account info tab */}
        {childUserId && settingsAndOptions?.[UserSetting.whoCanSeeMySocialNetworks] && (
          <SocialNetworkVisibility child={child} />
        )}
      </React.Fragment>
    </SettingsSection>
  );
};
VisibilitySettings.defaultProps = {
  childUserId: undefined,
};

export default VisibilitySettings;
