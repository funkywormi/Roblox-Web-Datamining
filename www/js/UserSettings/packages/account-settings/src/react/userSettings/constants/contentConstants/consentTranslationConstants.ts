import { TranslateFunction } from "react-utilities";
import {
  CrossAgeGroupCollaborationValue,
  AllowedStatusValue,
  SpendNotificationSetting,
  EnabledStatusValue,
  PhoneNumberDiscoverability,
  ContentControls,
  CommunicationPrivacyLevel,
  UpdateFriendsAboutMyActivitySettingValue,
  UserPrivacyLevel,
  PartySettingsValue,
  UserSetting,
} from "@rbx/user-settings";
import ContentMaturityLevel from "../../../../enums/parentalControls/ContentMaturityLevel";
import parentalControlsTranslationConstants from "./parentalControlsTranslationConstants";
import { privacyOptionLabels } from "../privacy/privacyConstants";

export const requestSettingLabels = {
  [UserSetting.contentAgeRestriction]: "Label.ContentMaturitySetting",
  [UserSetting.whoCanJoinMeInExperiences]: "Label.CurrentExperienceSharingSetting",
  [UserSetting.privateServerPrivacy]: "Label.PrivateServersSetting",
  [UserSetting.whoCanTradeWithMe]: "Label.TradingSetting",
  [UserSetting.whoCanSeeMyInventory]: "Label.InventoryVisibilitySetting",
  [UserSetting.monthlySpendLimit]: "Label.MonthlySpendingLimit",
  [UserSetting.dailyScreenTimeLimit]: "Label.DailyScreenTimeLimit",
  [UserSetting.updateFriendsAboutMyActivity]: "Label.ShareActivityUpdatesSetting",
  [UserSetting.phoneNumberDiscoverability]: "Label.ConnectionDiscoverySetting",
  [UserSetting.whoCanChatWithMeInApp]: "Label.RobloxChatDirectChatSetting",
  [UserSetting.enablePurchases]: "Label.MakePurchases",
  [UserSetting.whoCanGroupChatWithMeInApp]: "Label.RobloxChatGroupChatSetting",
  [UserSetting.whoCanWhisperChatWithMeInExperiences]: "Label.ExperienceDirectChatSetting",
  [UserSetting.whoCanChatWithMeInExperiences]: "Label.ExperienceChatSetting",
  [UserSetting.whoCanSeeMySocialNetworks]: "Label.SocialNetworkVisibilitySetting",
  [UserSetting.allowThirdPartyAppPermissions]: "Label.ThirdPartyAppSetting",
  [UserSetting.allowEnablePushNotifications]: "Label.MobilePushNotificationsSetting",
  [UserSetting.allowEnableEmailNotifications]: "Label.EmailNotificationsSetting",
  [UserSetting.allowEnableGroupNotifications]: "Label.GroupNotificationsSetting",
  [UserSetting.allowEnableExperienceNotifications]: "Label.ExperienceNotificationsSetting",
  [UserSetting.allowFacialAgeEstimation]: "Label.LowercaseAgeCheck",
  [UserSetting.allowVoiceDataUsage]:
    "Description.VoiceDataForProductImprovementsSettingNameInContext",
  [UserSetting.whoCanOneOnOnePartyWithMe]: "Label.PartySetting",
  [UserSetting.whoCanGroupPartyWithMe]: "Label.GroupPartySetting",
  [UserSetting.allowSensitiveIssues]: "Label.SensitiveIssuesContentSetting",
  [UserSetting.whoCanSeeMyOnlineStatus]: "Label.OnlineStatusSetting",
  [UserSetting.doNotDisturb]: "Label.DoNotDisturbSetting",
  [UserSetting.allowCrossAgeGroupStudioCollaboration]: "Label.StudioCollaborationSetting",
  [UserSetting.allowPresetChat]: "Label.PresetChat",
  [UserSetting.whoCanPartyWithMe]: "Label.PartySetting",
  [UserSetting.whoCanUsePartyChatWithMe]: "Heading.PartyChatSetting",
  [UserSetting.whoCanUsePartyVoiceWithMe]: "Heading.PartyVoiceChatSetting",

  birthday: "Label.BirthdayLowercase",
  chargebackUnlock: "Description.UnlockTheirAccount",
  unblockUser: "Label.UnblockUser",
  unblockExperience: "Label.UnblockExperience",
  addTrustedConnection: "Label.AddTrustedConnection",
  receiveRobuxTransfer: "Label.ReceiveRobuxTransfer",
  sendRobuxTransfer: "Label.SendRobuxTransfer",
  liftPlatformAccessRestriction: "Label.LiftPlatformAccessRestriction",
};

// capitalized versions of requestSettingLabels
export const requestSettingHeadings = {
  [UserSetting.contentAgeRestriction]: "Heading.ContentMaturitySetting",
  [UserSetting.whoCanJoinMeInExperiences]: "Heading.CurrentExperienceSharingSetting",
  [UserSetting.privateServerPrivacy]: "Heading.PrivateServersSetting",
  [UserSetting.whoCanTradeWithMe]: "Heading.TradingSetting",
  [UserSetting.whoCanSeeMyInventory]: "Heading.InventoryVisibilitySetting",
  [UserSetting.monthlySpendLimit]: "Heading.MonthlySpendingLimit",
  [UserSetting.dailyScreenTimeLimit]: "Heading.DailyScreenTimeLimit",
  [UserSetting.updateFriendsAboutMyActivity]: "Heading.ShareActivityUpdatesSetting",
  [UserSetting.phoneNumberDiscoverability]: "Heading.ConnectionDiscoverySetting",
  [UserSetting.whoCanChatWithMeInApp]: "Label.RobloxChatDirectChatSetting",
  [UserSetting.enablePurchases]: "Heading.MakePurchases",
  [UserSetting.whoCanGroupChatWithMeInApp]: "Label.RobloxChatGroupChatSetting",
  [UserSetting.whoCanWhisperChatWithMeInExperiences]: "Heading.ExperienceDirectChatSetting",
  [UserSetting.whoCanChatWithMeInExperiences]: "Heading.ExperienceChatSetting",
  [UserSetting.whoCanSeeMySocialNetworks]: "Heading.SocialNetworkVisibilitySetting",
  [UserSetting.allowThirdPartyAppPermissions]: "Heading.ThirdPartyAppSetting",
  [UserSetting.allowEnablePushNotifications]: "Heading.MobilePushNotificationsSetting",
  [UserSetting.allowEnableEmailNotifications]: "Heading.EmailNotificationsSetting",
  [UserSetting.allowEnableGroupNotifications]: "Heading.GroupNotificationsSetting",
  [UserSetting.allowEnableExperienceNotifications]: "Heading.ExperienceNotificationsSetting",
  [UserSetting.allowFacialAgeEstimation]: "Heading.AgeCheckSetting",
  [UserSetting.allowVoiceDataUsage]:
    "Description.VoiceDataForProductImprovementsSettingNameInContext",
  [UserSetting.whoCanOneOnOnePartyWithMe]: "Label.PartySetting",
  [UserSetting.whoCanGroupPartyWithMe]: "Label.GroupPartySetting",
  [UserSetting.allowSensitiveIssues]: "Heading.SensitiveIssuesContentSetting",
  [UserSetting.whoCanSeeMyOnlineStatus]: "Heading.OnlineStatusSetting",
  [UserSetting.doNotDisturb]: "Heading.DoNotDisturbSetting",
  [UserSetting.allowCrossAgeGroupStudioCollaboration]: "Heading.StudioCollaborationSetting",
  [UserSetting.allowPresetChat]: "Heading.PresetChatSetting",
  [UserSetting.whoCanPartyWithMe]: "Label.PartySetting",
  [UserSetting.whoCanUsePartyChatWithMe]: "Heading.PartyChatSetting",
  [UserSetting.whoCanUsePartyVoiceWithMe]: "Heading.PartyVoiceChatSetting",

  birthday: "Heading.BirthdayUpdate",
  chargebackUnlock: "Description.UnlockChildAccount",
  unblockUser: "Heading.UnblockUser",
  unblockExperience: "Heading.UnblockExperience",
  addTrustedConnection: "Heading.AddTrustedConnection",
  receiveRobuxTransfer: "Heading.AcceptRobux",
  sendRobuxTransfer: "Heading.SendRobux",
  liftPlatformAccessRestriction: "Heading.LiftPlatformAccessRestriction",
};

const chatTerminologyPartyLabelKeys: Partial<Record<UserSetting, string>> = {
  [UserSetting.whoCanPartyWithMe]: "Label.PartySettingV2",
  [UserSetting.whoCanUsePartyChatWithMe]: "Label.PartyChatSettingV2",
  [UserSetting.whoCanUsePartyVoiceWithMe]: "Label.PartyVoiceChatSetting",
};

const chatTerminologyPartyHeadingKeys: Partial<Record<UserSetting, string>> = {
  [UserSetting.whoCanPartyWithMe]: "Heading.PartySetting",
  [UserSetting.whoCanUsePartyChatWithMe]: "Heading.PartyChatSettingV2",
  [UserSetting.whoCanUsePartyVoiceWithMe]: "Heading.PartyVoiceChatSettingV2",
};

export const getRequestSettingLabel = (
  settingName: keyof typeof requestSettingLabels,
  canSeeChatTerminology = false,
): string => {
  if (canSeeChatTerminology) {
    const v2Key = chatTerminologyPartyLabelKeys[settingName as UserSetting];
    if (v2Key) {
      return v2Key;
    }
  }
  return requestSettingLabels[settingName];
};

export const getRequestSettingHeading = (
  settingName: keyof typeof requestSettingHeadings,
  canSeeChatTerminology = false,
): string => {
  if (canSeeChatTerminology) {
    const v2Key = chatTerminologyPartyHeadingKeys[settingName as UserSetting];
    if (v2Key) {
      return v2Key;
    }
  }
  return requestSettingHeadings[settingName];
};

const { contentMaturity, spendControls } = parentalControlsTranslationConstants;

export const requestOptionLabels = {
  // Content maturity
  [ContentControls.AllAges]: contentMaturity.optionTitlesV2[ContentMaturityLevel.Minimal],
  [ContentControls.NinePlus]: contentMaturity.optionTitlesV2[ContentMaturityLevel.Mild],
  [ContentControls.ThirteenPlus]: contentMaturity.optionTitlesV2[ContentMaturityLevel.Moderate],
  [ContentControls.SeventeenPlus]: contentMaturity.optionTitlesV2[ContentMaturityLevel.Restricted],

  // User privacy level
  [UserPrivacyLevel.AllUsers]: privacyOptionLabels.everyone,
  [UserPrivacyLevel.Friends]: privacyOptionLabels.friends,
  [UserPrivacyLevel.FriendsAndFollowing]: privacyOptionLabels.friendsAndFollowing,
  [UserPrivacyLevel.FriendsFollowingAndFollowers]: privacyOptionLabels.friendsFollowersAndFollowing,
  [UserPrivacyLevel.NoOne]: privacyOptionLabels.noOne,
  [UserPrivacyLevel.TrustedFriends]: privacyOptionLabels.trustedFriends,

  // Communication privacy level
  [CommunicationPrivacyLevel.AllUsers]: privacyOptionLabels.everyone,
  [CommunicationPrivacyLevel.Following]: privacyOptionLabels.friendsAndFollowing,
  [CommunicationPrivacyLevel.Followers]: privacyOptionLabels.friendsFollowersAndFollowing,

  // Update friends about my activity
  [UpdateFriendsAboutMyActivitySettingValue.Yes]: "Label.On",
  [UpdateFriendsAboutMyActivitySettingValue.No]: "Label.Off",

  // Phone number discoverability
  [PhoneNumberDiscoverability.Discoverable]: "Label.On",
  [PhoneNumberDiscoverability.NotDiscoverable]: "Label.Off",

  // Enabled status
  [EnabledStatusValue.Enabled]: "Label.On",
  [EnabledStatusValue.Disabled]: "Label.Off",

  // Spend notification setting
  [SpendNotificationSetting.AllNotifications]: spendControls.allTransactionsLabel,
  [SpendNotificationSetting.NotificationsOff]: spendControls.noTransactionsLabel,
  [SpendNotificationSetting.Default]: spendControls.highSpendAlertsLabel,

  // Allowed status
  [AllowedStatusValue.Allowed]: "Label.On",
  [AllowedStatusValue.Disallowed]: "Label.Off",

  // Cross age group collaboration
  [CrossAgeGroupCollaborationValue.OlderAgeGroupsAllowed]: "Label.OlderAgeGroupsAllowed",
  [CrossAgeGroupCollaborationValue.SimilarAgeGroupsOnly]: "Label.SimilarAgeGroupsOnly",
  [CrossAgeGroupCollaborationValue.SimilarOrTrustedConnections]:
    "Label.SimilarAgeGroupsOrTrustedConnections",

  // Party Setting
  [PartySettingsValue.AllConnections]: "Label.AllFriends",
  [PartySettingsValue.TrustedConnectionsOnly]: "Label.OnlyTrustedFriends",
};

export const getTranslatedOptionValue = (value: unknown, translate: TranslateFunction): string => {
  const translationKey = requestOptionLabels[value as keyof typeof requestOptionLabels];
  return translationKey ? translate(translationKey) : (value as string);
};
