import React from "react";
import { useTranslation } from "react-utilities";
import { UserSetting } from "@rbx/user-settings";
import useGetSettingsAndOptions from "../../../../apis/hooks/useGetSettingsAndOptions";
import useGetSettingsAndOptionsV2 from "../../../../apis/hooks/useGetSettingsAndOptionsV2";
import ToggleWithParentalConsent from "../../../../common/components/ToggleWithParentalConsent";
import ToggleWithParentalConsentV2 from "../../../../common/components/ToggleWithParentalConsentV2";
import DoNotDisturbToggle from "../../../../common/components/DoNotDisturbToggle";
import SettingsSection from "../../../../common/components/SettingsSection";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import privacyTranslationConstants from "../../../constants/contentConstants/privacyTranslationConstants";
import { useGetSettingsUiPolicyQuery } from "../../../../apis/universalAppConfigurationApi";

export const ChildNotificationSettings = ({ child }: { child: TChildInfo }): JSX.Element => {
  const { userId: childUserId } = child;
  const { translate } = useTranslation();
  const { data: settingsUiPolicy } = useGetSettingsUiPolicyQuery();
  const { notifications } = parentalControlsTranslationConstants;
  const [childSettings] = useGetSettingsAndOptions(childUserId);
  const [childSettingsV2] = useGetSettingsAndOptionsV2(childUserId);
  const description = `${translate(notifications.parentSideDescription)} ${translate(
    privacyTranslationConstants.inheritedSettingsDescription,
  )}`;
  return (
    <SettingsSection description={description}>
      <React.Fragment>
        {/* Email notifications */}
        {childSettings?.[UserSetting.allowEnableEmailNotifications] && (
          <ToggleWithParentalConsent
            label={translate(notifications.emailNotifications)}
            description={translate(notifications.emailNotificationsParentSideDescription)}
            inputId="email-notifications"
            settingName={UserSetting.allowEnableEmailNotifications}
            childUserId={childUserId}
          />
        )}
        {/* Desktop notifications */}
        {settingsUiPolicy?.displayDesktopNotificationSettings &&
          childSettingsV2?.[UserSetting.aggregatedDesktopNotifications] && (
            <ToggleWithParentalConsentV2
              label={translate(notifications.desktopNotifications)}
              description={translate(notifications.desktopNotificationsParentSideDescription)}
              inputId="desktop-notifications"
              settingName={UserSetting.aggregatedDesktopNotifications}
              childUserId={childUserId}
            />
          )}
        {/* Push notifications */}
        {childSettings?.[UserSetting.allowEnablePushNotifications] && (
          <ToggleWithParentalConsent
            label={translate(notifications.pushNotifications)}
            description={translate(notifications.parentSidePushNotificationDescription)}
            inputId="push-notifications"
            settingName={UserSetting.allowEnablePushNotifications}
            childUserId={childUserId}
          />
        )}
        {/* Do Not Disturb */}
        {child.canParentManageChildsDoNotDisturb && (
          <DoNotDisturbToggle
            label={translate(notifications.doNotDisturb.title)}
            description={translate(notifications.doNotDisturb.parentSideDescription)}
            inputId="do-not-disturb"
            settingName={UserSetting.doNotDisturb}
            childUserId={childUserId}
          />
        )}
      </React.Fragment>
    </SettingsSection>
  );
};

export default ChildNotificationSettings;
