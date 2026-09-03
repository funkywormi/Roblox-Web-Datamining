import { TUserSettingsAndOptionsBody, UserSetting } from "@rbx/user-settings";

export const doesUserHaveNotificationSettings = (
  settings: TUserSettingsAndOptionsBody | undefined,
): boolean => {
  return !!(
    settings?.[UserSetting.allowEnableEmailNotifications] ||
    settings?.[UserSetting.allowEnablePushNotifications] ||
    settings?.[UserSetting.allowEnableGroupNotifications] ||
    settings?.[UserSetting.allowEnableExperienceNotifications]
  );
};

export default doesUserHaveNotificationSettings;
