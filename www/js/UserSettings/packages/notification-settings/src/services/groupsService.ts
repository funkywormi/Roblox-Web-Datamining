import * as http from "@rbx/core-scripts/http";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import {
  getUserGroupsWithPreferencesUrl,
  getGroupNotificationPreferenceUrl,
  groupShoutPreferencesUrl,
} from "../constants/urlConstants";

export type CommunityNotificationPreferenceType =
  | "AnnouncementCreatedNotification"
  | "ForumCommentCreatedNotification"
  | "ForumCommentReplyCreatedNotification";

export type GroupNotificationPreference = {
  type: CommunityNotificationPreferenceType;
  name: string;
  description: string;
  enabled: boolean;
};

type GroupDetailsResponse = {
  data: {
    group: {
      id: number;
      name: string;
      owner: {
        displayName: string;
      };
    };
    notificationPreferences: GroupNotificationPreference[];
  }[];
};

export type GroupShoutPreference = {
  groupId: number;
  groupName: string;
  truncatedGroupName: string;
  creatorName: string;
  notificationPreferences: GroupNotificationPreference[];
};

export type GroupShoutPreferencesPayload = {
  parentalControlsEnabled?: boolean;
};

type GetGroupShoutPreferencesResponse = {
  groupShoutPreferences: GroupShoutPreferencesPayload;
};

export default {
  getGroupShoutPreferences: async (): Promise<GroupShoutPreferencesPayload> => {
    const response = await http.get<GetGroupShoutPreferencesResponse>({
      url: groupShoutPreferencesUrl,
      withCredentials: true,
    });
    return response.data.groupShoutPreferences;
  },

  getUserGroupsWithPreferences: async (): Promise<GroupShoutPreference[]> => {
    const response = await http.get<GroupDetailsResponse>({
      url: getUserGroupsWithPreferencesUrl(String(authenticatedUser.id)),
      withCredentials: true,
    });

    return response.data.data.map(item => ({
      groupId: item.group.id,
      groupName: item.group.name,
      truncatedGroupName:
        item.group.name.length > 30 ? `${item.group.name.slice(0, 30)}...` : item.group.name,
      creatorName: item.group.owner.displayName,
      notificationPreferences: item.notificationPreferences,
    }));
  },

  updateGroupNotificationPreference: async (
    groupId: number,
    type: CommunityNotificationPreferenceType,
    notificationsEnabled: boolean,
  ): Promise<void> => {
    await http.patch(
      {
        url: getGroupNotificationPreferenceUrl(groupId),
        withCredentials: true,
      },
      { notificationsEnabled, type },
    );
  },
};
