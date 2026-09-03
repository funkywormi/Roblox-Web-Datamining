import { EnvironmentUrls } from 'Roblox';

const { groupsApi, friendsApi } = EnvironmentUrls;

const urlPrefix = `${groupsApi}/v1/groups`;

export const eventConstants = {
  EventContext: {
    MemberListDialog: 'memberListDialog'
  }
};

export default {
  urls: {
    profilePageUrl(userId: number): string {
      return `/users/${userId}/profile`;
    },
    messageUrl(userId: number): string {
      return `/messages/compose?recipientId=${userId}`;
    },
    getFriendStatuses(userId: number) {
      return {
        url: `${friendsApi}/v1/users/${userId}/friends/statuses`,
        withCredentials: true
      };
    },
    sendFriendRequest(userId: number) {
      return {
        url: `${friendsApi}/v1/users/${userId}/request-friendship`,
        withCredentials: true
      };
    },
    acceptFriendRequest(userId: number) {
      return {
        url: `${friendsApi}/v1/users/${userId}/accept-friend-request`,
        withCredentials: true
      };
    },
    getGroupRolesURL(groupId: number): string {
      return `${urlPrefix}/${groupId}/roles`;
    },
    getGroupRoleMembersURL(groupId: number, roleId: number): string {
      return `${urlPrefix}/${groupId}/roles/${roleId}/users`;
    }
  },
  pageCounts: {
    membersPerPage: 25
  }
};
