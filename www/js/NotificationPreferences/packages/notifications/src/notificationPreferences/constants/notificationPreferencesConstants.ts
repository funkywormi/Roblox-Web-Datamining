import { ThumbnailTypes } from 'roblox-thumbnails';
import { UserSetting } from '../types/UserSettingsTypes';

export enum NotificationGroupTypes {
  experience = 'Experience',
  groupShout = 'GroupShout',
  default = 'Default'
}

export default {
  GroupToIconMap: {
    Experiences: 'icon-regular-circle-play',
    MobilePush: 'icon-regular-smartphone-portrait',
    GroupShouts: 'icon-regular-three-people',
    Email: 'icon-regular-envelope',
    Desktop: 'icon-regular-mouse-scrollwheel'
  } as {
    [group: string]: string;
  },
  GroupToThumbnailType: {
    GroupShout: ThumbnailTypes.groupIcon,
    Experience: ThumbnailTypes.gameIcon
  } as {
    [group: string]: ThumbnailTypes;
  },
  UserSettingNameToUserSetting: {
    AllowMarketingEmailNotifications: UserSetting.allowMarketingEmailNotifications
  } as {
    [userSettingName: string]: UserSetting;
  },
  UserSettingToSurface: {
    [UserSetting.allowMarketingEmailNotifications]: 'email-marketing-setting'
  } as {
    [K in UserSetting]: string;
  },
  UserSettingToConsentName: {
    [UserSetting.allowMarketingEmailNotifications]: 'allowMarketingEmailNotificationsPreferences'
  } as {
    [K in UserSetting]: string;
  }
};
