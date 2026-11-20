import {
  TUserSettingsAndOptionsBody,
  TUserSettingsAndOptionsV2Body,
  UserSetting,
} from "@rbx/user-settings";
import { TChildInfo } from "../../../../types/childrenInfoTypes";

/** Structural subset of the V1 and V2 settings bodies, which are otherwise unrelated types. */
type TSettingsBody = Partial<Record<UserSetting, unknown>>;

// The settings each parent dashboard page renders a row for. A page whose settings all
// came back without options (and so were dropped from the response) would render empty.
export const visibilityPageSettings: UserSetting[] = [
  UserSetting.whoCanSeeMyOnlineStatus,
  UserSetting.whoCanJoinMeInExperiences,
  UserSetting.updateFriendsAboutMyActivity,
  UserSetting.whoCanSeeMySocialNetworks,
  UserSetting.whoCanSeeMyFriendsList,
  UserSetting.whoCanSeeMyPastUsernames,
  UserSetting.whoCanSeeMyAboutSection,
  UserSetting.allowThirdPartyFriendAccess,
];

export const tradingAndInventoryPageSettings: UserSetting[] = [
  UserSetting.whoCanTradeWithMe,
  UserSetting.whoCanSeeMyInventory,
  UserSetting.tradeQualityFilter,
];

export const communicationPageSettings: UserSetting[] = [
  UserSetting.whoCanChatWithMeInExperiences,
  UserSetting.whoCanWhisperChatWithMeInExperiences,
  UserSetting.whoCanOneOnOnePartyWithMe,
  UserSetting.whoCanGroupPartyWithMe,
  UserSetting.whoCanPartyWithMe,
  UserSetting.allowVoiceDataUsage,
  UserSetting.allowCrossAgeGroupStudioCollaboration,
  UserSetting.allowPresetChat,
];

/** Whether user-settings returned at least one of the settings in either body. */
export const hasAnySetting = (
  settingNames: UserSetting[],
  ...settingsBodies: (TSettingsBody | undefined)[]
): boolean => settingNames.some(settingName => settingsBodies.some(body => !!body?.[settingName]));

/** Mirrors the rows ChildNotificationSettings renders. */
export const hasChildNotificationRows = (
  child: Pick<TChildInfo, "canParentManageChildsDoNotDisturb">,
  childSettings: TUserSettingsAndOptionsBody | undefined,
  childSettingsV2: TUserSettingsAndOptionsV2Body | undefined,
): boolean =>
  !!childSettings?.[UserSetting.allowEnableEmailNotifications] ||
  !!childSettingsV2?.[UserSetting.aggregatedDesktopNotifications] ||
  !!childSettings?.[UserSetting.allowEnablePushNotifications] ||
  (!!child.canParentManageChildsDoNotDisturb && !!childSettings?.[UserSetting.doNotDisturb]);
