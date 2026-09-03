import {
  CrossAgeGroupCollaborationValue,
  EnabledStatusValue,
  UserPrivacyLevel,
  CommunicationPrivacyLevel,
  PartySettingsValue,
} from "@rbx/user-settings";
import { TSettingsPage } from "../../../../types/commonTypes";
import SettingCategoryPageName from "../../../../enums/SettingCategoryPageName";
import PrivacySettingName from "../../../../enums/privacy/PrivacySettingName";
import RouterPath from "../../../../enums/RouterPath";
import privacyTranslationConstants from "../contentConstants/privacyTranslationConstants";
import { TRadioButtonOptionV2 } from "../../../common/components/RadioButtonOptionsWithParentalConsent";

export const updateInventorySettingPopupMessage = "Response.Dialog.UpdateInventorySetting";
export const updateTradeSettingPopupMessage = "Response.Dialog.UpdateTradeSetting";

export const friendDiscoveryConsentName = "phoneNumberDiscoverabilitySetting";
export const friendDiscoveryParentSideConsentName = "phoneNumberDiscoverabilitySettingParentSide";
export const friendDiscoverySurface = "discoverability-setting";

export const personalizedAdsConsentName = "personalizedAdsSetting";
export const sellShareDataConsentName = "sellShareDataSetting";
export const personalizedAdsSurface = "ads-personalization-setting";
export const sellShareDataSurface = "ads-sell-share-setting";

export const emailMarketingVerificationConsentName = "allowMarketingEmailCheckboxEmailVerification";
export const emailMarketingVerificationSurface =
  "email-marketing-checkbox-during-email-verification";

export const voiceDataConsentSettingConsentName = "voiceDataConsentSetting";
export const voiceDataConsentSettingParentSideConsentName = "voiceDataConsentSettingParentSide";
export const voiceDataConsentSettingSurface = "voice-data-usage-setting";

export const whoCanPartyWithMeConsentName = "whoCanPartyWithMe";
export const whoCanPartyWithMeV2ConsentName = "whoCanPartyWithMeV2";
export const whoCanPartyWithMeParentSideConsentName = "whoCanPartyWithMeParentSide";
export const whoCanPartyWithMeParentSideV2ConsentName = "whoCanPartyWithMeParentSideV2";
export const whoCanUsePartyChatWithMeConsentName = "whoCanUsePartyChatWithMe";
export const whoCanUsePartyChatWithMeV2ConsentName = "whoCanUsePartyChatWithMeV2";
export const whoCanUsePartyChatWithMeParentSideConsentName = "whoCanUsePartyChatWithMeParentSide";
export const whoCanUsePartyChatWithMeParentSideV2ConsentName =
  "whoCanUsePartyChatWithMeParentSideV2";
export const whoCanUsePartyVoiceWithMeConsentName = "whoCanUsePartyVoiceWithMe";
export const whoCanUsePartyVoiceWithMeV2ConsentName = "whoCanUsePartyVoiceWithMeV2";
export const whoCanUsePartyVoiceWithMeParentSideConsentName = "whoCanUsePartyVoiceWithMeParentSide";
export const whoCanUsePartyVoiceWithMeParentSideV2ConsentName =
  "whoCanUsePartyVoiceWithMeParentSideV2";
export const whoCanPartyWithMeTrustedFriendsConsentName = "whoCanPartyWithMeTrustedFriends";
export const whoCanPartyWithMeTrustedFriendsV2ConsentName = "whoCanPartyWithMeTrustedFriendsV2";
export const whoCanPartyWithMeParentSideRemovedCommsConsentName =
  "whoCanPartyWithMeParentSideRemovedComms";
export const whoCanPartyWithMeParentSideRemovedCommsV2ConsentName =
  "whoCanPartyWithMeParentSideRemovedCommsV2";
export const whoCanUsePartyChatWithMeTrustedFriendsConsentName =
  "whoCanUsePartyChatWithMeTrustedFriends";
export const whoCanUsePartyChatWithMeTrustedFriendsV2ConsentName =
  "whoCanUsePartyChatWithMeTrustedFriendsV2";
export const whoCanUsePartyChatWithMeParentSideTrustedFriendsConsentName =
  "whoCanUsePartyChatWithMeParentSideTrustedFriends";
export const whoCanUsePartyChatWithMeParentSideTrustedFriendsV2ConsentName =
  "whoCanUsePartyChatWithMeParentSideTrustedFriendsV2";
export const whoCanUsePartyVoiceWithMeTrustedFriendsConsentName =
  "whoCanUsePartyVoiceWithMeTrustedFriends";
export const whoCanUsePartyVoiceWithMeTrustedFriendsV2ConsentName =
  "whoCanUsePartyVoiceWithMeTrustedFriendsV2";
export const whoCanUsePartyVoiceWithMeParentSideTrustedFriendsConsentName =
  "whoCanUsePartyVoiceWithMeParentSideTrustedFriends";
export const whoCanUsePartyVoiceWithMeParentSideTrustedFriendsV2ConsentName =
  "whoCanUsePartyVoiceWithMeParentSideTrustedFriendsV2";
export const partySettingsSurface = "party-settings";

export const privacyOptionLabels = {
  everyone: "Label.DropDown.Everyone",
  followers: "Label.DropDown.FollowersV2",
  followersAndFollowing: "Label.FollowersAndFollowing",
  friendsAndFollowing: "Label.ConnectionsAndFollowing",
  friendsFollowersAndFollowing: "Label.ConnectionsFollowersAndFollowing",
  following: "Label.DropDown.FollowingV2",
  friends: "Label.Connections",
  noOne: "Label.DropDown.NoOne",
  on: "Label.On",
  off: "Label.Off",
  olderAgeGroupsAllowed: "Label.OlderAgeGroupsAllowed",
  similarAgeGroupsOnly: "Label.SimilarAgeGroupsOnly",
  similarAgeGroupsOrTrustedConnections: "Label.SimilarAgeGroupsOrTrustedConnections",
  allConnections: "Label.AllFriends",
  trustedConnectionsOnly: "Label.OnlyTrustedFriends",
  trustedFriends: "Label.TrustedFriends",
};

export const blockedUsersPageSize = 50;
export const blockedExperiencesPageSize = 50;
export const approvedExperiencesPageSize = 50;
export const sentinelTileIntersectionThreshold = 0.1; // when 10% of pixels on sentinel tile on experience search page are visible, load more data

export const getSocialNetworkVisibilityOptions = (): TRadioButtonOptionV2[] => {
  const everyone: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.everyone,
    value: UserPrivacyLevel.AllUsers,
    name: "social-network-visibility-everyone",
    id: "social-network-visibility-everyone",
  };
  const followers: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.friendsFollowersAndFollowing,
    value: UserPrivacyLevel.FriendsFollowingAndFollowers,
    name: "social-network-visibility-followers",
    id: "social-network-visibility-followers",
  };
  const following: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.friendsAndFollowing,
    value: UserPrivacyLevel.FriendsAndFollowing,
    name: "social-network-visibility-following",
    id: "social-network-visibility-following",
  };
  const friends: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.friends,
    value: UserPrivacyLevel.Friends,
    name: "social-network-visibility-friends",
    id: "social-network-visibility-friends",
  };
  const noOne: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.noOne,
    value: UserPrivacyLevel.NoOne,
    name: "social-network-visibility-noOne",
    id: "social-network-visibility-noOne",
  };
  return [everyone, followers, following, friends, noOne];
};

export const getPrivateServerPrivacyOptions = (): TRadioButtonOptionV2[] => {
  const everyone: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.everyone,
    value: UserPrivacyLevel.AllUsers,
    name: "private-server-privacy-everyone",
    id: "private-server-privacy-everyone",
  };
  const followers: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.friendsFollowersAndFollowing,
    value: UserPrivacyLevel.FriendsFollowingAndFollowers,
    name: "private-server-privacy-followers",
    id: "private-server-privacy-followers",
  };
  const following: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.friendsAndFollowing,
    value: UserPrivacyLevel.FriendsAndFollowing,
    name: "private-server-privacy-following",
    id: "private-server-privacy-following",
  };
  const friends: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.friends,
    value: UserPrivacyLevel.Friends,
    name: "private-server-privacy-friends",
    id: "private-server-privacy-friends",
  };
  const noOne: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.noOne,
    value: UserPrivacyLevel.NoOne,
    name: "private-server-privacy-noOne",
    id: "private-server-privacy-noOne",
  };
  return [everyone, followers, following, friends, noOne];
};

export const getOnlineStatusOptions = (): TRadioButtonOptionV2[] => {
  const everyone: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.everyone,
    value: UserPrivacyLevel.AllUsers,
    name: "online-status-everyone",
    id: "online-status-everyone",
  };
  const followers: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.friendsFollowersAndFollowing,
    value: UserPrivacyLevel.FriendsFollowingAndFollowers,
    name: "online-status-followers",
    id: "online-status-followers",
  };
  const following: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.friendsAndFollowing,
    value: UserPrivacyLevel.FriendsAndFollowing,
    name: "online-status-following",
    id: "online-status-following",
  };
  const friends: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.friends,
    value: UserPrivacyLevel.Friends,
    name: "online-status-friends",
    id: "online-status-friends",
  };
  const trustedFriends: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.trustedFriends,
    value: UserPrivacyLevel.TrustedFriends,
    name: "online-status-trustedFriends",
    id: "online-status-trustedFriends",
  };
  const noOne: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.noOne,
    value: UserPrivacyLevel.NoOne,
    name: "online-status-noOne",
    id: "online-status-noOne",
  };
  return [everyone, followers, following, friends, trustedFriends, noOne];
};

export const getJoinPrivacyOptions = (): TRadioButtonOptionV2[] => {
  const everyone: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.everyone,
    value: CommunicationPrivacyLevel.AllUsers,
    name: "join-experience-everyone",
    id: "join-experience-everyone",
  };
  const followers: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.friendsFollowersAndFollowing,
    value: CommunicationPrivacyLevel.Followers,
    name: "join-experience-followers",
    id: "join-experience-followers",
  };
  const following: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.friendsAndFollowing,
    value: CommunicationPrivacyLevel.Following,
    name: "join-experience-following",
    id: "join-experience-following",
  };
  const friends: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.friends,
    value: CommunicationPrivacyLevel.Friends,
    name: "join-experience-friends",
    id: "join-experience-friends",
  };
  const trustedFriends: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.trustedFriends,
    value: CommunicationPrivacyLevel.TrustedFriends,
    name: "join-experience-trustedFriends",
    id: "join-experience-trustedFriends",
  };
  const noOne: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.noOne,
    value: CommunicationPrivacyLevel.NoOne,
    name: "join-experience-noOne",
    id: "join-experience-noOne",
  };
  return [everyone, followers, following, friends, trustedFriends, noOne];
};

export const getTradePrivacyOptions = (): TRadioButtonOptionV2[] => {
  const everyone: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.everyone,
    value: UserPrivacyLevel.AllUsers,
    name: "trade-privacy-everyone",
    id: "trade-privacy-everyone",
  };
  const followers: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.friendsFollowersAndFollowing,
    value: UserPrivacyLevel.FriendsFollowingAndFollowers,
    name: "trade-privacy-followers",
    id: "trade-privacy-followers",
  };
  const following: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.friendsAndFollowing,
    value: UserPrivacyLevel.FriendsAndFollowing,
    name: "trade-privacy-following",
    id: "trade-privacy-following",
  };
  const friends: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.friends,
    value: UserPrivacyLevel.Friends,
    name: "trade-privacy-friends",
    id: "trade-privacy-friends",
  };
  const noOne: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.noOne,
    value: UserPrivacyLevel.NoOne,
    name: "trade-privacy-noOne",
    id: "trade-privacy-noOne",
  };
  return [everyone, followers, following, friends, noOne];
};

export const getInventoryVisibilityOptions = (): TRadioButtonOptionV2[] => {
  const everyone: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.everyone,
    value: UserPrivacyLevel.AllUsers,
    name: "inventory-privacy-everyone",
    id: "inventory-privacy-everyone",
  };
  const followers: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.friendsFollowersAndFollowing,
    value: UserPrivacyLevel.FriendsFollowingAndFollowers,
    name: "inventory-privacy-followers",
    id: "inventory-privacy-followers",
  };
  const following: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.friendsAndFollowing,
    value: UserPrivacyLevel.FriendsAndFollowing,
    name: "inventory-privacy-following",
    id: "inventory-privacy-following",
  };
  const friends: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.friends,
    value: UserPrivacyLevel.Friends,
    name: "inventory-privacy-friends",
    id: "inventory-privacy-friends",
  };
  const noOne: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.noOne,
    value: UserPrivacyLevel.NoOne,
    name: "inventory-privacy-noOne",
    id: "inventory-privacy-noOne",
  };
  return [everyone, followers, following, friends, noOne];
};

export const getExperienceChatOptionsV2 = (): TRadioButtonOptionV2[] => {
  const everyone: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.on,
    value: UserPrivacyLevel.AllUsers,
    id: "experience-chat-everyone",
    name: "experience-chat-everyone",
  };
  const noOne: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.off,
    value: UserPrivacyLevel.NoOne,
    id: "experience-chat-no-one",
    name: "experience-chat-no-one",
  };
  return [everyone, noOne];
};
export const getExperienceChatOptions = (): TRadioButtonOptionV2[] => {
  const everyone: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.everyone,
    value: UserPrivacyLevel.AllUsers,
    id: "experience-chat-everyone",
    name: "experience-chat-everyone",
  };
  const noOne: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.noOne,
    value: UserPrivacyLevel.NoOne,
    id: "experience-chat-no-one",
    name: "experience-chat-no-one",
  };
  return [everyone, noOne];
};

export const getExperienceDirectChatOptionsV2 = (): TRadioButtonOptionV2[] => {
  const everyone: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.on,
    value: UserPrivacyLevel.AllUsers,
    id: "experience-whisper-chat-everyone",
    name: "experience-whisper-chat-everyone",
  };
  const noOne: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.off,
    value: UserPrivacyLevel.NoOne,
    id: "experience-whisper-chat-no-one",
    name: "experience-whisper-chat-no-one",
  };
  return [everyone, noOne];
};
export const getExperienceDirectChatOptions = (): TRadioButtonOptionV2[] => {
  const everyone: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.everyone,
    value: UserPrivacyLevel.AllUsers,
    id: "experience-whisper-chat-everyone",
    name: "experience-whisper-chat-everyone",
  };
  const noOne: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.noOne,
    value: UserPrivacyLevel.NoOne,
    id: "experience-whisper-chat-no-one",
    name: "experience-whisper-chat-no-one",
  };
  return [everyone, noOne];
};

export const getPartySettingOptions = (): TRadioButtonOptionV2[] => {
  const friends: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.on,
    value: UserPrivacyLevel.Friends,
    id: "party-setting-friends",
    name: "party-setting-friends",
  };
  const noOne: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.off,
    value: UserPrivacyLevel.NoOne,
    id: "party-setting-no-one",
    name: "party-setting-no-one",
  };
  return [friends, noOne];
};

export const getGroupPartySettingOptions = (): TRadioButtonOptionV2[] => {
  const friends: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.on,
    value: UserPrivacyLevel.Friends,
    id: "group-party-setting-friends",
    name: "group-party-setting-friends",
  };
  const noOne: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.off,
    value: UserPrivacyLevel.NoOne,
    id: "group-party-setting-no-one",
    name: "group-party-setting-no-one",
  };
  return [friends, noOne];
};

export const getWhoCanPartyWithMeOptions = (): TRadioButtonOptionV2[] => {
  const on: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.on,
    value: PartySettingsValue.AllConnections,
    id: "party-v2-setting-on",
    name: "party-v2-setting-on",
  };
  const off: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.off,
    value: PartySettingsValue.NoOne,
    id: "party-v2-setting-off",
    name: "party-v2-setting-off",
  };
  return [on, off];
};

export const getWhoCanUsePartyChatWithMeOptions = (): TRadioButtonOptionV2[] => {
  const allConnections: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.allConnections,
    value: PartySettingsValue.AllConnections,
    id: "party-chat-setting-all-connections",
    name: "party-chat-setting-all-connections",
  };
  const trustedConnectionsOnly: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.trustedConnectionsOnly,
    value: PartySettingsValue.TrustedConnectionsOnly,
    id: "party-chat-setting-trusted-connections-only",
    name: "party-chat-setting-trusted-connections-only",
  };
  const noOne: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.noOne,
    value: PartySettingsValue.NoOne,
    id: "party-chat-setting-no-one",
    name: "party-chat-setting-no-one",
  };
  return [allConnections, trustedConnectionsOnly, noOne];
};

export const getWhoCanUsePartyVoiceWithMeOptions = (): TRadioButtonOptionV2[] => {
  const allConnections: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.allConnections,
    value: PartySettingsValue.AllConnections,
    id: "party-voice-setting-all-connections",
    name: "party-voice-setting-all-connections",
  };
  const trustedConnectionsOnly: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.trustedConnectionsOnly,
    value: PartySettingsValue.TrustedConnectionsOnly,
    id: "party-voice-setting-trusted-connections-only",
    name: "party-voice-setting-trusted-connections-only",
  };
  const noOne: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.noOne,
    value: PartySettingsValue.NoOne,
    id: "party-voice-setting-no-one",
    name: "party-voice-setting-no-one",
  };
  return [allConnections, trustedConnectionsOnly, noOne];
};

export const getStudioCollaborationOptions = (): TRadioButtonOptionV2[] => {
  const olderAgeGroupsAllowed: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.olderAgeGroupsAllowed,
    value: CrossAgeGroupCollaborationValue.OlderAgeGroupsAllowed,
    id: "studio-collaboration-older-age-groups-allowed",
    name: "studio-collaboration-older-age-groups-allowed",
  };
  const similarAgeGroupsOrTrustedConnections: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.similarAgeGroupsOrTrustedConnections,
    value: CrossAgeGroupCollaborationValue.SimilarOrTrustedConnections,
    id: "studio-collaboration-similar-age-groups-or-trusted-connections",
    name: "studio-collaboration-similar-age-groups-or-trusted-connections",
  };
  const similarAgeGroupsOnly: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.similarAgeGroupsOnly,
    value: CrossAgeGroupCollaborationValue.SimilarAgeGroupsOnly,
    id: "studio-collaboration-similar-age-groups-only",
    name: "studio-collaboration-similar-age-groups-only",
  };
  const noOne: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.noOne,
    value: CrossAgeGroupCollaborationValue.NoOne,
    id: "studio-collaboration-no-one",
    name: "studio-collaboration-no-one",
  };
  return [olderAgeGroupsAllowed, similarAgeGroupsOrTrustedConnections, similarAgeGroupsOnly, noOne];
};

export const getPresetChatOptions = (): TRadioButtonOptionV2[] => {
  const enabled: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.on,
    value: EnabledStatusValue.Enabled,
    id: "preset-chat-enabled",
    name: "preset-chat-enabled",
  };
  const disabled: TRadioButtonOptionV2 = {
    label: privacyOptionLabels.off,
    value: EnabledStatusValue.Disabled,
    id: "preset-chat-disabled",
    name: "preset-chat-disabled",
  };
  return [enabled, disabled];
};

export const basePrivacyPath = `/${RouterPath.Privacy}`;
const { pageTitles } = privacyTranslationConstants;

export const privacySettingCategoryPages = {
  [SettingCategoryPageName.ContentRestrictions]: {
    name: SettingCategoryPageName.ContentRestrictions,
    path: `${basePrivacyPath}/${SettingCategoryPageName.ContentRestrictions}`,
    titleTranslationKey: pageTitles[SettingCategoryPageName.ContentRestrictions],
  },
  [PrivacySettingName.ContentMaturity]: {
    name: PrivacySettingName.ContentMaturity,
    path: `${basePrivacyPath}/${PrivacySettingName.ContentMaturity}`,
    titleTranslationKey: pageTitles[PrivacySettingName.ContentMaturity],
  },
  [PrivacySettingName.Screentime]: {
    name: PrivacySettingName.Screentime,
    path: `${basePrivacyPath}/${PrivacySettingName.Screentime}`,
    titleTranslationKey: pageTitles[PrivacySettingName.Screentime],
  },
  [SettingCategoryPageName.Communication]: {
    name: SettingCategoryPageName.Communication,
    path: `${basePrivacyPath}/${SettingCategoryPageName.Communication}`,
    titleTranslationKey: pageTitles[SettingCategoryPageName.Communication],
  },
  [SettingCategoryPageName.VisibilityAndPrivateServers]: {
    name: SettingCategoryPageName.VisibilityAndPrivateServers,
    path: `${basePrivacyPath}/${SettingCategoryPageName.VisibilityAndPrivateServers}`,
    titleTranslationKey: pageTitles[SettingCategoryPageName.VisibilityAndPrivateServers],
  },
  [SettingCategoryPageName.FriendsAndContacts]: {
    name: SettingCategoryPageName.FriendsAndContacts,
    path: `${basePrivacyPath}/${SettingCategoryPageName.FriendsAndContacts}`,
    titleTranslationKey: pageTitles[SettingCategoryPageName.FriendsAndContacts],
  },
  [SettingCategoryPageName.TradingAndInventory]: {
    name: SettingCategoryPageName.TradingAndInventory,
    path: `${basePrivacyPath}/${SettingCategoryPageName.TradingAndInventory}`,
    titleTranslationKey: pageTitles[SettingCategoryPageName.TradingAndInventory],
  },
  [PrivacySettingName.AdPreferences]: {
    name: PrivacySettingName.AdPreferences,
    path: `${basePrivacyPath}/${PrivacySettingName.AdPreferences}`,
    titleTranslationKey: pageTitles[PrivacySettingName.AdPreferences],
  },
  [PrivacySettingName.BlockedUsers]: {
    name: PrivacySettingName.BlockedUsers,
    path: `${basePrivacyPath}/${PrivacySettingName.BlockedUsers}`,
    titleTranslationKey: pageTitles[PrivacySettingName.BlockedUsers],
  },
  [PrivacySettingName.AccountDeactivationAndDeletion]: {
    name: PrivacySettingName.AccountDeactivationAndDeletion,
    path: `${basePrivacyPath}/${PrivacySettingName.AccountDeactivationAndDeletion}`,
    titleTranslationKey: pageTitles[PrivacySettingName.AccountDeactivationAndDeletion],
  },
  [PrivacySettingName.AccountDataDeactivationAndDeletion]: {
    name: PrivacySettingName.AccountDataDeactivationAndDeletion,
    path: `${basePrivacyPath}/${PrivacySettingName.AccountDataDeactivationAndDeletion}`,
    titleTranslationKey: pageTitles[PrivacySettingName.AccountDataDeactivationAndDeletion],
  },
} satisfies Record<string, TSettingsPage>;

export const contentRestrictionsPages = {
  [PrivacySettingName.ContentMaturity]: {
    name: PrivacySettingName.ContentMaturity,
    path: `${privacySettingCategoryPages[SettingCategoryPageName.ContentRestrictions].path}/${
      PrivacySettingName.ContentMaturity
    }`,
    titleTranslationKey: pageTitles[PrivacySettingName.ContentMaturity],
  },
  [PrivacySettingName.BlockedExperiences]: {
    name: PrivacySettingName.BlockedExperiences,
    path: `${privacySettingCategoryPages[SettingCategoryPageName.ContentRestrictions].path}/${
      PrivacySettingName.BlockedExperiences
    }`,
    titleTranslationKey: pageTitles[PrivacySettingName.BlockedExperiences],
  },
  [PrivacySettingName.ApprovedExperiences]: {
    name: PrivacySettingName.ApprovedExperiences,
    path: `${privacySettingCategoryPages[SettingCategoryPageName.ContentRestrictions].path}/${
      PrivacySettingName.ApprovedExperiences
    }`,
    titleTranslationKey: pageTitles[PrivacySettingName.ApprovedExperiences],
  },
  [PrivacySettingName.SensitiveIssues]: {
    name: PrivacySettingName.SensitiveIssues,
    path: `${privacySettingCategoryPages[SettingCategoryPageName.ContentRestrictions].path}/${
      PrivacySettingName.SensitiveIssues
    }`,
    titleTranslationKey: pageTitles[PrivacySettingName.SensitiveIssues],
  },
} satisfies Record<string, TSettingsPage>;

export const communicationPages = {
  [SettingCategoryPageName.ExperienceChat]: {
    name: SettingCategoryPageName.ExperienceChat,
    path: `${privacySettingCategoryPages[SettingCategoryPageName.Communication].path}/${
      SettingCategoryPageName.ExperienceChat
    }`,
    titleTranslationKey: pageTitles[SettingCategoryPageName.ExperienceChat],
  },
  [SettingCategoryPageName.Party]: {
    name: SettingCategoryPageName.Party,
    path: `${privacySettingCategoryPages[SettingCategoryPageName.Communication].path}/${
      SettingCategoryPageName.Party
    }`,
    titleTranslationKey: pageTitles[SettingCategoryPageName.Party],
  },
  [SettingCategoryPageName.PartyAndPartyChat]: {
    name: SettingCategoryPageName.PartyAndPartyChat,
    path: `${privacySettingCategoryPages[SettingCategoryPageName.Communication].path}/${
      SettingCategoryPageName.PartyAndPartyChat
    }`,
    titleTranslationKey: pageTitles[SettingCategoryPageName.PartyAndPartyChat],
  },
  [SettingCategoryPageName.PartyAndPartyChatV2]: {
    name: SettingCategoryPageName.PartyAndPartyChatV2,
    path: `${privacySettingCategoryPages[SettingCategoryPageName.Communication].path}/${
      SettingCategoryPageName.PartyAndPartyChatV2
    }`,
    titleTranslationKey: pageTitles[SettingCategoryPageName.PartyAndPartyChatV2],
  },
  [SettingCategoryPageName.Voice]: {
    name: SettingCategoryPageName.Voice,
    path: `${privacySettingCategoryPages[SettingCategoryPageName.Communication].path}/${
      SettingCategoryPageName.Voice
    }`,
    titleTranslationKey: pageTitles[SettingCategoryPageName.Voice],
  },
  [SettingCategoryPageName.VoiceDataUsage]: {
    name: SettingCategoryPageName.VoiceDataUsage,
    path: `${privacySettingCategoryPages[SettingCategoryPageName.Communication].path}/${
      SettingCategoryPageName.VoiceDataUsage
    }`,
    titleTranslationKey: pageTitles[SettingCategoryPageName.VoiceDataUsage],
  },
  [SettingCategoryPageName.Camera]: {
    name: SettingCategoryPageName.Camera,
    path: `${privacySettingCategoryPages[SettingCategoryPageName.Communication].path}/${
      SettingCategoryPageName.Camera
    }`,
    titleTranslationKey: pageTitles[SettingCategoryPageName.Camera],
  },
  [SettingCategoryPageName.StudioCollaboration]: {
    name: SettingCategoryPageName.StudioCollaboration,
    path: `${privacySettingCategoryPages[SettingCategoryPageName.Communication].path}/${
      SettingCategoryPageName.StudioCollaboration
    }`,
    titleTranslationKey: pageTitles[SettingCategoryPageName.StudioCollaboration],
  },
  [SettingCategoryPageName.PresetChat]: {
    name: SettingCategoryPageName.PresetChat,
    path: `${privacySettingCategoryPages[SettingCategoryPageName.Communication].path}/${
      SettingCategoryPageName.PresetChat
    }`,
    titleTranslationKey: pageTitles[SettingCategoryPageName.PresetChat],
  },
} satisfies Record<string, TSettingsPage>;

export const visibilityAndPrivateServersPages = {
  [SettingCategoryPageName.Visibility]: {
    name: SettingCategoryPageName.Visibility,
    path: `${
      privacySettingCategoryPages[SettingCategoryPageName.VisibilityAndPrivateServers].path
    }/${SettingCategoryPageName.Visibility}`,
    titleTranslationKey: pageTitles[SettingCategoryPageName.Visibility],
  },
  [PrivacySettingName.PrivateServerPrivacy]: {
    name: PrivacySettingName.PrivateServerPrivacy,
    path: `${
      privacySettingCategoryPages[SettingCategoryPageName.VisibilityAndPrivateServers].path
    }/${PrivacySettingName.PrivateServerPrivacy}`,
    titleTranslationKey: pageTitles[PrivacySettingName.PrivateServerPrivacy],
  },
} satisfies Record<string, TSettingsPage>;

export const screentimePages = {
  [PrivacySettingName.PerExperienceScreentime]: {
    name: PrivacySettingName.PerExperienceScreentime,
    path: `${privacySettingCategoryPages[PrivacySettingName.Screentime].path}/${
      PrivacySettingName.PerExperienceScreentime
    }`,
    titleTranslationKey: pageTitles[PrivacySettingName.PerExperienceScreentime],
  },
} satisfies Record<string, TSettingsPage>;

export const allPrivacyPages: TSettingsPage[] = [
  {
    name: SettingCategoryPageName.PrivacySettingCategoriesList,
    path: basePrivacyPath,
    titleTranslationKey: pageTitles[SettingCategoryPageName.PrivacySettingCategoriesList],
  },
  ...Object.values(privacySettingCategoryPages),
  ...Object.values(communicationPages),
  ...Object.values(visibilityAndPrivateServersPages),
  ...Object.values(contentRestrictionsPages),
  ...Object.values(screentimePages),
];

export type LegallySensitivePageMapping = {
  consentName: string;
  surfaceName: string;
};

// Maps subpage name → LSC consent/surface for pages whose wordsOfConsent defines a `pageTitle`.
// Only listed pages get their BackLink title from the LSC service; all others fall back to the
// hardcoded translation key.
export const legallySensitivePageTitleMap: Record<string, LegallySensitivePageMapping> = {
  [SettingCategoryPageName.PartyAndPartyChat]: {
    consentName: whoCanPartyWithMeConsentName,
    surfaceName: partySettingsSurface,
  },
  [SettingCategoryPageName.PartyAndPartyChatV2]: {
    consentName: whoCanPartyWithMeV2ConsentName,
    surfaceName: partySettingsSurface,
  },
};
