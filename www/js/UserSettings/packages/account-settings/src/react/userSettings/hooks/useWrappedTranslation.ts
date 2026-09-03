import { useTranslation } from "react-utilities";
import { useCallback } from "react";
import {
  useGetSettingsUiPolicyQuery,
  useGetVPCLaunchStatusQuery,
} from "../../apis/universalAppConfigurationApi";
import parentalControlsTranslationConstants from "../constants/contentConstants/parentalControlsTranslationConstants";

import privacyTranslationConstants from "../constants/contentConstants/privacyTranslationConstants";

const privacyTabRenameKeyMap: Record<string, string> = {
  "Heading.Tab.PrivacyContentMaturity": "Heading.Tab.PrivacyContentRestrictions",
};
const { addParentLink, contentMaturity } = parentalControlsTranslationConstants;
const parentLinkEntrypointKeyMap: Record<string, string> = {
  [addParentLink.description]: addParentLink.descriptionForU13,
};

const experienceChatTCBreakthroughKeyMap: Record<string, string> = {
  [privacyTranslationConstants.experienceChatSettingDescriptionV2]:
    privacyTranslationConstants.experienceChatSettingDescriptionV3,
  [privacyTranslationConstants.directChatDescriptionV2]:
    privacyTranslationConstants.directChatDescriptionV3,
  [privacyTranslationConstants.parentSideExperienceChatDescriptionV2]:
    privacyTranslationConstants.parentSideExperienceChatDescriptionV3,
  [privacyTranslationConstants.parentSideExperienceChatSettingDescriptionV2]:
    privacyTranslationConstants.parentSideExperienceChatSettingDescriptionV3,
  [privacyTranslationConstants.parentSideDirectChatDescriptionV2]:
    privacyTranslationConstants.parentSideDirectChatDescriptionV3,
};

const connectionsToFriendsKeyMap: Record<string, string> = {
  "Label.Connections": "Label.Friends",
  "Label.ConnectionsAndFollowing": "Label.FriendsAndFollowing",
  "Label.ConnectionsFollowersAndFollowing": "Label.FriendsFollowersAndFollowing",
  "Heading.ConnectionsAndContacts": "Heading.FriendsAndContacts",
  "Heading.Connections": "Heading.Friends",
  "Label.ConnectionDiscovery": "Label.FriendDiscovery",
  "Description.ConnectionDiscovery": "Description.FriendDiscovery",
  "Label.ConnectionsCount": "Label.FriendsCount",
  "Label.ZeroStateConnections": "Label.ZeroStateFriends",
  "Description.NoConnections": "Description.NoFriends",
  "Description.ConnectionCarouselError": "Description.FriendCarouselError",
  "Label.ConnectionDiscoverySetting": "Label.FriendDiscoverySetting",
  "Heading.ConnectionDiscoverySetting": "Heading.FriendDiscoverySetting",
  "Description.ManageConnectionConsent": "Description.ManageFriendConsent",
  "Label.TrustedConnections": "Label.TrustedFriends",
  "Label.ZeroStateTrustedConnections": "Label.ZeroStateTrustedFriends",
  "Heading.AddTrustedConnection": "Heading.AddTrustedFriend",
  "Label.SimilarAgeGroupsOrTrustedConnections": "Label.SimilarAgeGroupsOrTrustedFriends",
  "Action.LearnAboutTrustedConnections": "Action.LearnAboutTrustedFriends",
  "Description.TrustedConnectionAddApproved": "Description.TrustedFriendAddApproved",
  "Description.TrustedConnectionAddDenied": "Description.TrustedFriendAddDenied",
  "Description.AddLinkedParent": "Description.AddLinkedParent.FriendsRename",
  "Description.BlockedUsers": "Description.BlockedUsers.FriendsRename",
  "Description.ShareActivityUpdatesV2": "Description.ShareActivityUpdatesV2.FriendsRename",
  "Description.ParentSide.ShareActivityUpdatesV2":
    "Description.ParentSide.ShareActivityUpdatesV2.FriendsRename",
  "Description.StudioCollabOneMoreStepModal":
    "Description.StudioCollabOneMoreStepModal.FriendsRename",
  "Description.ParentBlockingUserV2": "Description.ParentBlockingUserV2.FriendsRename",
  "Description.ParentUnblockUserV2": "Description.ParentUnblockUserV2.FriendsRename",
  "Description.UnblockUserV2": "Description.UnblockUserV2.FriendsRename",
  "Description.DirectChatV2": "Description.DirectChatV2.FriendsRename",
  "Description.ChildSide.DirectChat": "Description.ChildSide.DirectChat.FriendsRename",
  "Description.ChildSide.DirectChatSettingV3":
    "Description.ChildSide.DirectChatSettingV3.FriendsRename",
  "Description.ChildSide.DirectChatV2": "Description.ChildSide.DirectChatV2.FriendsRename",
  "Description.ChildSide.ExperienceChatV3": "Description.ChildSide.ExperienceChatV3.FriendsRename",
  "Description.ConnectWithContactsWeb": "Description.ConnectWithContactsWeb.FriendsRename",
  "Description.ParentSide.DesktopNotifications":
    "Description.ParentSide.DesktopNotifications.FriendsRename",
  "Description.ParentSide.DirectChatSetting":
    "Description.ParentSide.DirectChatSetting.FriendsRename",
  "Description.ParentSide.DirectChatSettingV3":
    "Description.ParentSide.DirectChatSettingV3.FriendsRename",
  "Description.ParentSide.DirectChatV2": "Description.ParentSide.DirectChatV2.FriendsRename",
  "Description.ParentSide.ExperienceChatSettingV3":
    "Description.ParentSide.ExperienceChatSettingV3.FriendsRename",
  "Description.ParentSide.PartyO13V2": "Description.ParentSide.PartyO13V2.FriendsRename",
  "Description.ParentSide.PartyV2": "Description.ParentSide.PartyV2.FriendsRename",
  "Description.PartyO13V2": "Description.PartyO13V2.FriendsRename",
  "Description.PartyV2": "Description.PartyV2.FriendsRename",
  "Descripton.ParentSide.ExperienceChatV3": "Descripton.ParentSide.ExperienceChatV3.FriendsRename",
  OnlineStatusChangeBody: "OnlineStatusChangeBody.FriendsRename",
};

type TransformationRule = {
  isActive: () => boolean;
  map: Record<string, string>;
};

/**
 * Wraps the original useTranslation hook to potentially modify translation keys
 * based on feature flags or other logic before resolving the final string.
 */
export const useWrappedTranslation = (): {
  translate: (resourceId: string, params?: Record<string, unknown>) => string;
} & Omit<ReturnType<typeof useTranslation>, "translate"> => {
  const { translate: baseTranslate, ...rest } = useTranslation();
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();
  const { data: vpcLaunchStatus } = useGetVPCLaunchStatusQuery();
  const transformationRules: TransformationRule[] = [
    {
      isActive: () => uiPolicy?.renamePrivacyToPrivacyContentRestrictionsTab ?? false,
      map: privacyTabRenameKeyMap,
    },
    {
      isActive: () => vpcLaunchStatus?.isTeenLaunchEnabled ?? false,
      map: parentLinkEntrypointKeyMap,
    },
    {
      isActive: () => uiPolicy?.experienceChatTCBreakthroughEnabled ?? false,
      map: experienceChatTCBreakthroughKeyMap,
    },
    {
      isActive: () => true,
      map: connectionsToFriendsKeyMap,
    },
  ];

  const applyTransformationRules = (resourceId: string): string => {
    const activeRules = transformationRules.filter(rule => rule.isActive());

    const finalResourceId = activeRules.reduce((currentResourceId, rule) => {
      return rule.map[currentResourceId] ?? currentResourceId;
    }, resourceId);

    return finalResourceId;
  };

  const translate = useCallback(
    (resourceId: string, params?: Record<string, unknown>): string => {
      const finalResourceId = applyTransformationRules(resourceId);
      return baseTranslate(finalResourceId, params);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseTranslate, uiPolicy, vpcLaunchStatus],
  );

  return {
    translate,
    ...rest,
  };
};

export default useWrappedTranslation;
