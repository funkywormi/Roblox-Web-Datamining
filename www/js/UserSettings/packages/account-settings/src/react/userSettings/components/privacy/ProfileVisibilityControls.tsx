import React, { useMemo } from "react";
import {
  TUpdateUserSettingValueRequest,
  UserPrivacyLevel,
  UserSetting,
  useSnackbar,
} from "@rbx/user-settings";
import RadioButtonOptionsWithParentalConsentV2 from "../../../common/components/RadioButtonOptionsWithParentalConsentV2";
import SettingsSection from "../../../common/components/SettingsSection";
import useGetSettingsAndOptionsV2 from "../../../apis/hooks/useGetSettingsAndOptionsV2";
import { useUpdateUserSettingValueV2Mutation } from "../../../apis/userSettingsApi";
import { filterRadioButtonOptionsWithDescription } from "../../../../core/utils/settingOptionsUtils";
import { TChildSettingsInfo } from "../../../../types/childrenInfoTypes";
import { TSettingUpdateProps } from "../../../../types/settingUpdateTypes";
import { useWrappedTranslation } from "../../hooks/useWrappedTranslation";
import privacyTranslationConstants from "../../constants/contentConstants/privacyTranslationConstants";
import { getUserPrivacyOptions } from "../../constants/privacy/privacyConstants";
import {
  getSuccessMessageKeyForUserSettingsUpdate,
  handleChildSettingsUpdateError,
} from "../../utils/successMessageUtils";

const settingConfigurations = [
  {
    setting: UserSetting.whoCanSeeMyFriendsList,
    label: privacyTranslationConstants.profileFriendsListVisibilityLabel,
    description: privacyTranslationConstants.profileFriendsListVisibilityDescription,
    id: "profile-friends-list-visibility",
  },
  {
    setting: UserSetting.whoCanSeeMyPastUsernames,
    label: privacyTranslationConstants.profilePastUsernamesVisibilityLabel,
    description: privacyTranslationConstants.profilePastUsernamesVisibilityDescription,
    id: "profile-past-usernames-visibility",
  },
  {
    setting: UserSetting.whoCanSeeMyAboutSection,
    label: privacyTranslationConstants.profileAboutSectionVisibilityLabel,
    description: privacyTranslationConstants.profileAboutSectionVisibilityDescription,
    id: "profile-about-section-visibility",
  },
] as const;

export const ProfileVisibilityControls = ({
  child,
  onUpdateSetting,
}: { child?: TChildSettingsInfo } & TSettingUpdateProps): React.JSX.Element | null => {
  const { translate } = useWrappedTranslation();
  const { snackbarService } = useSnackbar();
  const [settingsAndOptions] = useGetSettingsAndOptionsV2(child?.userId);
  const [updateSettingValue] = useUpdateUserSettingValueV2Mutation();
  const visibleSettingConfigurations = settingConfigurations.filter(
    ({ setting }) => settingsAndOptions?.[setting],
  );

  const optionsBySetting = useMemo(
    () =>
      Object.fromEntries(
        settingConfigurations.map(({ setting, id }) => [
          setting,
          filterRadioButtonOptionsWithDescription(
            setting,
            getUserPrivacyOptions(id),
            settingsAndOptions?.[setting]?.options ?? [],
            translate,
            child?.userId,
          ),
        ]),
      ),
    [child?.userId, settingsAndOptions, translate],
  );

  const updateProfileVisibility = async (
    setting: (typeof settingConfigurations)[number]["setting"],
    value: UserPrivacyLevel,
  ) => {
    const updateBody: TUpdateUserSettingValueRequest = {
      childUserId: child?.userId,
      setting,
      value,
      usePrologue: true,
      useRequirementsMapV2: true,
    };

    try {
      if (onUpdateSetting) {
        await onUpdateSetting(updateBody);
        return;
      }

      const result = await updateSettingValue(updateBody).unwrap();
      const successMessageKey = getSuccessMessageKeyForUserSettingsUpdate(updateBody, result);
      if (successMessageKey) {
        snackbarService.success(translate(successMessageKey));
      }
    } catch (error) {
      const errorKey = handleChildSettingsUpdateError(error, child?.userId);
      if (errorKey) {
        snackbarService.warning(translate(errorKey));
      }
    }
  };

  if (visibleSettingConfigurations.length === 0) {
    return null;
  }

  return (
    <SettingsSection>
      <div
        className="section-content profile-visibility-settings"
        data-testid="profile-visibility-settings"
      >
        <h3 className="profile-visibility-heading font-header-2">
          {translate(privacyTranslationConstants.profileVisibilityHeading)}
        </h3>
        {visibleSettingConfigurations.map(({ setting, label, description, id }, index) => (
          <React.Fragment key={setting}>
            {index > 0 && (
              <div
                className="rbx-divider profile-visibility-divider"
                data-testid="profile-visibility-divider"
              />
            )}
            <RadioButtonOptionsWithParentalConsentV2
              title={translate(label)}
              description={translate(description)}
              settingName={setting}
              options={optionsBySetting[setting] ?? []}
              className="profile-visibility-setting"
              child={child}
              onOptionSelected={(value: UserPrivacyLevel) => {
                // The shared radio primitive expects void; update errors are handled with snackbars.
                // eslint-disable-next-line no-void, @rbx/promises/prefer-query-mutation
                void updateProfileVisibility(setting, value);
              }}
              id={id}
            />
          </React.Fragment>
        ))}
      </div>
    </SettingsSection>
  );
};

ProfileVisibilityControls.defaultProps = {
  child: undefined,
};

export default ProfileVisibilityControls;
