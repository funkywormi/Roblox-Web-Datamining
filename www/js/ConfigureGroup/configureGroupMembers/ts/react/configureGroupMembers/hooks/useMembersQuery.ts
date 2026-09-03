import {
  GetNextPageParamFunction,
  InfiniteData,
  QueryFunction,
  QueryKey,
  useQueryClient
} from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import {
  AssignedRole,
  Role,
  User,
  GetUsersInGroupResponse,
  UserAndRoles
} from '../../shared/types';
import groupMembershipService from '../../shared/services/groupMembershipService';
import { insertRoleInOrder } from '../utils/roleOrdering';

export interface UseMembersQueryParams {
  groupId: number;
  filteredRoleId?: number;
  filteredUserId?: number;
  includePrivate?: boolean;
}

interface UseMembersQueryResult {
  queryKey: QueryKey;
  queryFn: QueryFunction<GetUsersInGroupResponse>;
  getNextPageParam: GetNextPageParamFunction<GetUsersInGroupResponse>;
  getItemsFromDataPages: (data?: InfiniteData<GetUsersInGroupResponse>) => Array<UserAndRoles>;
  getUserFromItem: (item: UserAndRoles) => User;
  getRolesFromItem: (item: UserAndRoles) => Array<AssignedRole>;
}

const getQueryKey = (
  groupId: number,
  roleId?: number,
  userId?: number,
  includePrivate?: boolean
): QueryKey => {
  return ['group-members', groupId, roleId, userId, includePrivate];
};

const getNextPageParam = (lastPage: GetUsersInGroupResponse) => lastPage.nextPageCursor;
const getUserFromItem = (item: UserAndRoles) => item.user;
const getRolesFromItem = (item: UserAndRoles) => item.roles;

const getItemsFromDataPages = (data?: InfiniteData<GetUsersInGroupResponse>) => {
  if (!data?.pages) return [];
  const items: Array<UserAndRoles> = [];
  for (const page of data.pages) {
    items.push(...page.data);
  }
  return items;
};

const useMembersQuery = ({
  groupId,
  filteredRoleId,
  filteredUserId,
  includePrivate
}: UseMembersQueryParams): UseMembersQueryResult => {
  const queryKey = getQueryKey(groupId, filteredRoleId, filteredUserId, includePrivate);

  const queryFn = useCallback(
    async ({ pageParam }: { pageParam?: string }) => {
      const result = await groupMembershipService.getUsersInGroup({
        groupId,
        roleId: filteredRoleId,
        userIds: filteredUserId ? [filteredUserId] : undefined,
        cursor: pageParam,
        includePrivate
      });
      return result;
    },
    [groupId, filteredRoleId, filteredUserId, includePrivate]
  );

  return {
    queryKey,
    queryFn,
    getNextPageParam,
    getItemsFromDataPages,
    getUserFromItem,
    getRolesFromItem
  };
};

export const useMembersQueryUpdates = ({
  groupId,
  roles
}: {
  groupId: number;
  roles: Array<Role>;
}): {
  addRoleToMember: (userId: number, roleId: number) => Promise<void>;
  removeRoleFromMember: (userId: number, roleId: number) => Promise<void>;
  removeMember: (userId: number) => void;
} => {
  const queryClient = useQueryClient();
  const queryKeyPrefix = ['group-members', groupId];

  const rolesById = useMemo(() => {
    const map = new Map<number, Role>();
    roles.forEach(role => map.set(role.id, role));
    return map;
  }, [roles]);

  const roleOrderMap = useMemo(() => {
    const map = new Map<number, number>();
    roles.forEach((role, index) => map.set(role.id, index));
    return map;
  }, [roles]);

  const incrementRoleCount = (roleId: number, delta: number) => {
    queryClient.setQueriesData(['group-roles', groupId], (oldData: Array<Role> | undefined) => {
      if (!oldData) return oldData;

      const role = rolesById.get(roleId);
      if (!role) return oldData;

      return oldData.map(r => {
        if (r.id !== roleId) return r;
        return { ...r, memberCount: Math.max(0, (r.memberCount ?? 0) + delta) };
      });
    });
  };

  // optimistic updates for role assignment
  const addRoleToMember = async (userId: number, roleId: number) => {
    queryClient.setQueriesData(
      queryKeyPrefix,
      (oldData: InfiniteData<GetUsersInGroupResponse> | undefined) => {
        if (!oldData) return oldData;

        const roleToAdd = rolesById.get(roleId);
        if (!roleToAdd) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            data: page.data.map((member: UserAndRoles) => {
              if (member.user.userId !== userId) return member;

              const newUserRole = {
                id: roleToAdd.id,
                name: roleToAdd.name,
                color: roleToAdd.color,
                isPrivate: roleToAdd.isPrivate
              };
              const updatedRoles = insertRoleInOrder(member.roles, newUserRole, roleOrderMap);

              return { ...member, roles: updatedRoles };
            })
          }))
        };
      }
    );

    incrementRoleCount(roleId, 1);

    await queryClient.invalidateQueries({
      queryKey: ['group-members', groupId, roleId],
      refetchType: 'none' // prevents refetching currently-in-use queries but invalidates them for future fetches
    });
  };

  const removeRoleFromMember = async (userId: number, roleId: number) => {
    queryClient.setQueriesData(
      queryKeyPrefix,
      (oldData: InfiniteData<GetUsersInGroupResponse> | undefined) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            data: page.data.map((member: UserAndRoles) => {
              if (member.user.userId !== userId) return member;
              return {
                ...member,
                roles: member.roles.filter(role => role.id !== roleId)
              };
            })
          }))
        };
      }
    );

    incrementRoleCount(roleId, -1);

    await queryClient.invalidateQueries({
      queryKey: ['group-members', groupId, roleId],
      refetchType: 'none' // prevents refetching currently-in-use queries but invalidates them for future fetches
    });
  };

  const removeMember = (userId: number) => {
    queryClient.setQueriesData(
      queryKeyPrefix,
      (oldData: InfiniteData<GetUsersInGroupResponse> | undefined) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            data: page.data.filter((member: UserAndRoles) => member.user.userId !== userId)
          }))
        };
      }
    );
  };

  return {
    addRoleToMember,
    removeRoleFromMember,
    removeMember
  };
};

export default useMembersQuery;
