import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type {
  V1GroupsGroupIdUsersGetLimitEnum,
  V1GroupsGroupIdUsersGetSortOrderEnum,
} from '@rbx/client-groups/v1';
import groupsClient from '../clients/groups';

const ORGANIZATIONS_GROUPS_KEY_PREFIX = 'organizationsApi_groups_';
const GROUPS_MEMBERS_KEY_PREFIX = 'groupsApi_members_';

type TGroupInfo = {
  ownerId?: number;
  groupName?: string;
  memberCount?: number;
};

export const useGetGroupInfo = (groupId?: string) => {
  return useQuery({
    enabled: !!groupId,
    placeholderData: keepPreviousData,
    queryKey: [`${ORGANIZATIONS_GROUPS_KEY_PREFIX}groupInfo`, groupId],
    queryFn: async (): Promise<TGroupInfo | undefined> => {
      if (!groupId) {
        return undefined;
      }
      const response = await groupsClient.getGroupInfo(Number.parseInt(groupId, 10));
      const groupInfo: TGroupInfo = {
        ownerId: response.owner?.userId,
        groupName: response.name,
        memberCount: response.memberCount,
      };
      return groupInfo;
    },
  });
};

export const useGetGroupMembers = (
  groupId?: string,
  limit?: V1GroupsGroupIdUsersGetLimitEnum,
  cursor?: string,
  sortOrder?: V1GroupsGroupIdUsersGetSortOrderEnum,
) => {
  return useQuery({
    enabled: !!groupId,
    placeholderData: keepPreviousData,
    queryKey: [`${GROUPS_MEMBERS_KEY_PREFIX}members`, groupId, limit, cursor, sortOrder],
    queryFn: async () => {
      if (!groupId) {
        return undefined;
      }
      return groupsClient.getGroupMembers({ groupId: Number(groupId), limit, cursor, sortOrder });
    },
  });
};

export const useGetUsersGroupRole = (userId: number, groupId?: string) => {
  return useQuery({
    enabled: !!userId && !!groupId,
    placeholderData: keepPreviousData,
    queryKey: [`${ORGANIZATIONS_GROUPS_KEY_PREFIX}userGroupRole`, userId, groupId],
    queryFn: async () => {
      if (!userId || !groupId) {
        return null;
      }
      const response = await groupsClient.getUsersGroupRoles(userId);
      const groupMembershipDetails = response.data?.find(
        (membership) => `${membership.group?.id}` === groupId,
      );
      return groupMembershipDetails ?? null;
    },
  });
};
