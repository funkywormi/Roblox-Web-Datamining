import { EnvironmentUrls } from 'Roblox';

const { groupsApi } = EnvironmentUrls;

const groupsUrlPrefix = `${groupsApi}/v1/groups`;

/**
 * Window event dispatched by the Angular group controller when the current user's membership
 * in a group changes (join / leave / role change). React consumers (e.g. the announcements
 * display) listen for it to invalidate cached membership queries.
 */
export const GROUP_MEMBERSHIP_CHANGED_EVENT = 'roblox.group.membershipChanged';

export type GroupMembershipChangedEventDetail = { groupId: number };

export default {
  urls: {
    getUsersInGroup: ({
      groupId,
      roleId,
      userIds,
      cursor,
      includePrivate
    }: {
      groupId: number;
      roleId?: number;
      userIds?: Array<number>;
      cursor?: string;
      includePrivate?: boolean;
    }): string => {
      const params = new URLSearchParams();
      if (roleId) {
        params.append('roleSetId', roleId.toString());
      }
      if (userIds && userIds.length > 0) {
        const userIdString = userIds.join(',');
        params.append('userIds', userIdString);
      }
      if (cursor) {
        params.append('cursor', cursor);
      }
      if (includePrivate) {
        params.append('includePrivate', 'true');
      }
      params.append('sortOrder', 'Desc');
      params.append('limit', '50');
      return `${groupsApi}/v2/groups/${groupId}/users?${params.toString()}`;
    },
    searchUsersInGroup(groupId: number, query: string): string {
      return `${groupsApi}/v2/groups/${groupId}/users/search?query=${encodeURIComponent(query)}`;
    },
    kickUser(groupId: number, profileId: number): string {
      return `${groupsUrlPrefix}/${groupId}/users/${profileId}`;
    },
    banUser(groupId: number, profileId: number): string {
      return `${groupsUrlPrefix}/${groupId}/bans/${profileId}`;
    },
    bannedUsers(groupId: number): string {
      return `${groupsUrlPrefix}/${groupId}/bans`;
    }
  }
};
