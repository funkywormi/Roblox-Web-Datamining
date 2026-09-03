import { EnvironmentUrls } from 'Roblox';
import { SortOrder } from '../types';

const { groupsApi } = EnvironmentUrls;

export default {
  urls: {
    roleAssignment: ({
      groupId,
      roleId,
      userId
    }: {
      groupId: number;
      roleId: number;
      userId: number;
    }): string => {
      return `${groupsApi}/v1/groups/${groupId}/roles/${roleId}/users/${userId}`;
    },
    bannedUsers: ({ groupId, cursor }: { groupId: number; cursor?: string }): string => {
      const params = new URLSearchParams();
      if (cursor) {
        params.append('cursor', cursor);
      }
      params.append('sortOrder', 'Desc');
      params.append('limit', '50');
      return `${groupsApi}/v1/groups/${groupId}/bans?${params.toString()}`;
    },
    bannedUser: ({ groupId, userId }: { groupId: number; userId: number }): string => {
      return `${groupsApi}/v1/groups/${groupId}/bans/${userId}`;
    },
    joinRequests: ({
      groupId,
      cursor,
      sortOrder = 'Desc'
    }: {
      groupId: number;
      cursor?: string;
      sortOrder?: SortOrder;
    }): string => {
      const params = new URLSearchParams();
      if (cursor) {
        params.append('cursor', cursor);
      }
      params.append('sortOrder', sortOrder);
      params.append('limit', '50');
      return `${groupsApi}/v1/groups/${groupId}/join-requests?${params.toString()}`;
    },
    batchJoinRequests: ({ groupId }: { groupId: number }): string => {
      return `${groupsApi}/v1/groups/${groupId}/join-requests`;
    },
    joinRequest: ({ groupId, userId }: { groupId: number; userId: number }): string => {
      return `${groupsApi}/v1/groups/${groupId}/join-requests/users/${userId}`;
    }
  }
};
