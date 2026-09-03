import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { GroupUserWithRoles } from '../clients/groups';
import groupsClient from '../clients/groups';
import organizationApiClient from '../clients/organizationApi';
import usersClient from '../clients/users';
import type { InvitedMember } from '../utils/constants';
import { invalidateInvitationQueries, invalidateMemberQueries } from './rolesQueries';

type TChangeUserRolesProps = {
  groupId: string;
  member: GroupUserWithRoles | InvitedMember;
  roleId: number;
};

type TChangeInvitedUserRolesProps = {
  organizationId: string;
  member: GroupUserWithRoles | InvitedMember;
  roleId: number;
};

const GET_USERS_BY_ORGANIZATION_ID_QUERY_PREFIX = 'organizationsApi_users';
const USER_BY_USERNAME_QUERY_PREFIX = 'usersApi_userByUsername';

export const useGetUserByUsername = (username: string) => {
  return useQuery({
    placeholderData: keepPreviousData,
    queryKey: [USER_BY_USERNAME_QUERY_PREFIX, username],
    queryFn: async () => {
      if (!username) {
        return null;
      }
      const users = await usersClient.getUsersByUsernames([username]);
      return users[0] ?? null;
    },
  });
};

export const useGetUsersByOrganizationId = (
  organizationId?: string,
  pageToken?: string,
  maxPageSize?: number,
) => {
  return useQuery({
    enabled: !!organizationId,
    placeholderData: keepPreviousData,
    queryKey: [GET_USERS_BY_ORGANIZATION_ID_QUERY_PREFIX, organizationId, pageToken, maxPageSize],
    queryFn: async () => {
      if (!organizationId) {
        return undefined;
      }
      return organizationApiClient.userClient.getUsersByOrganization(
        organizationId,
        pageToken,
        maxPageSize,
      );
    },
  });
};

export const useAddUserToRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, member, roleId }: TChangeUserRolesProps) => {
      return groupsClient.addRoleToUser(Number(groupId), roleId, member.user?.userId ?? 0);
    },
    onSuccess: (_, variables) => {
      invalidateMemberQueries(queryClient, variables.groupId, [
        variables.roleId.toString(),
        ...(variables.member.roles?.map((role) => role.id?.toString() ?? '') ?? []),
      ]);
    },
  });
};

export const useRemoveUserFromRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, member, roleId }: TChangeUserRolesProps) => {
      return groupsClient.removeRoleFromUser(Number(groupId), roleId, member.user?.userId ?? 0);
    },
    onSuccess: (_, variables) => {
      variables.member.roles?.forEach((role) => {
        invalidateMemberQueries(queryClient, variables.groupId, [role.id?.toString() ?? '']);
      });
    },
  });
};

export const useAddInvitedToRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, member, roleId }: TChangeInvitedUserRolesProps) => {
      return organizationApiClient.userClient.addUserToRole(
        organizationId,
        member.user?.userId?.toString() ?? '',
        roleId.toString(),
      );
    },
    onSuccess: (_, variables) => {
      invalidateInvitationQueries(queryClient, variables.organizationId, [
        variables.roleId.toString(),
        ...(variables.member.roles?.map((role) => role.id?.toString() ?? '') ?? []),
      ]);
    },
  });
};

export const useRemoveInvitedFromRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, member, roleId }: TChangeInvitedUserRolesProps) => {
      return organizationApiClient.userClient.removeUserFromRole(
        organizationId,
        member.user?.userId?.toString() ?? '',
        roleId.toString(),
      );
    },
    onSuccess: (_, variables) => {
      variables.member.roles?.forEach((role) => {
        invalidateInvitationQueries(queryClient, variables.organizationId, [
          role.id?.toString() ?? '',
        ]);
      });
    },
  });
};

type TRemoveMemberFromGroupProps = {
  groupId: string;
  member: GroupUserWithRoles;
};

export const useRemoveMemberFromGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, member }: TRemoveMemberFromGroupProps) => {
      return groupsClient.removeUserFromGroup(Number(groupId), member.user?.userId ?? 0);
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        predicate(query) {
          return (
            query.queryKey[0] === 'groupsApi_roles_usersWithRole' &&
            query.queryKey[1] === variables.groupId
          );
        },
      });
    },
  });
};

type TRemoveMemberProps = {
  organizationId: string;
  groupId?: string;
  member: GroupUserWithRoles;
};

export const useRemoveMemberFromOrg = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, member }: TRemoveMemberProps) => {
      return organizationApiClient.userClient.removeUserFromOrganization(
        organizationId,
        member.user?.userId?.toString() ?? '',
      );
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [GET_USERS_BY_ORGANIZATION_ID_QUERY_PREFIX, variables.organizationId],
      });
      invalidateMemberQueries(
        queryClient,
        variables.groupId ?? '',
        variables.member.roles?.map((role) => role.id?.toString() ?? ''),
      );
    },
  });
};
