import type { QueryClient } from '@tanstack/react-query';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  RobloxGroupsApiModelsRequestCreateRoleSetRequest,
  RobloxGroupsApiModelsRequestUpdateRoleSetRequest,
} from '@rbx/client-groups/v1';
import type {
  RobloxGroupsApiModelsRequestUpdateRoleSetPositionRequest,
  V2GroupsGroupIdUsersGetLimitEnum,
} from '@rbx/client-groups/v2';
import { V2GroupsGroupIdUsersGetSortOrderEnum } from '@rbx/client-groups/v2';
import groupsClient from '../clients/groups';
import type { Invitation } from '../clients/organizationApi';
import organizationApiClient from '../clients/organizationApi';
import usersClient from '../clients/users';

const ORGANIZATIONS_ROLES_KEY_PREFIX = 'organizationsApi_roles_';
const GROUPS_ROLES_KEY_PREFIX = 'groupsApi_roles_';
const GROUPS_CONFIGURATION_KEY = 'groupsApi_configuration_metadata';
const GROUPS_PRODUCT_FEATURES_KEY = 'groupsApi_product_features';

export function useGetGroupsRoles(groupId: string | undefined) {
  return useQuery({
    enabled: groupId !== undefined && groupId !== '',
    placeholderData: keepPreviousData,
    queryKey: [`${GROUPS_ROLES_KEY_PREFIX}all`, groupId],
    queryFn: async () => {
      if (!groupId) {
        throw new Error('Tried to fetch all roles for a group but group id was undefined');
      }

      const allRolesResponse = await groupsClient.getGroupRolesSetsInfo(Number(groupId));

      return allRolesResponse.roles;
    },
  });
}

/**
 * A group's members, scoped to `roleId`. Pass `null` to reach members across every role, or leave
 * it `undefined` while the caller is still resolving which role to ask for, which keeps the query
 * idle rather than firing a request the endpoint would reject.
 */
export const useGetGroupUsersWithRoles = (
  groupId: string,
  roleId?: number | null,
  limit?: V2GroupsGroupIdUsersGetLimitEnum,
  cursor?: string | null,
  options?: { enabled?: boolean; filteredUserId?: number },
) => {
  const enabled = (options?.enabled ?? true) && !!groupId && roleId !== undefined;

  return useQuery({
    enabled,
    placeholderData: keepPreviousData,
    queryKey: [
      `${GROUPS_ROLES_KEY_PREFIX}usersWithRole`,
      groupId,
      String(roleId),
      limit,
      cursor,
      options?.filteredUserId,
    ],
    queryFn: async () => {
      if (roleId === undefined) {
        throw new Error('Tried to fetch a group role\u2019s users but role id was undefined');
      }

      const userIds = options?.filteredUserId ? [options.filteredUserId] : [];

      return groupsClient.getGroupUsersWithRoles({
        groupId: Number(groupId),
        ...(roleId !== null && { roleSetId: roleId }),
        userIds,
        limit,
        includePrivate: true,
        cursor: cursor ?? undefined,
        ...(roleId === null && { sortOrder: V2GroupsGroupIdUsersGetSortOrderEnum.Desc }),
      });
    },
  });
};

export const useGetInvitationsByRole = (
  organizationId?: string,
  roleId?: string,
  pageToken?: string | null,
  maxPageSize?: number,
  isDefault?: boolean,
) => {
  return useQuery({
    enabled: !!organizationId && !!roleId,
    placeholderData: keepPreviousData,
    queryKey: [
      `${ORGANIZATIONS_ROLES_KEY_PREFIX}invitationsByRole`,
      organizationId,
      roleId,
      isDefault,
      pageToken,
      maxPageSize,
    ],
    queryFn: async () => {
      if (!organizationId || !roleId) {
        throw new Error(
          'Tried to fetch invitations by role but organization id or role id was undefined',
        );
      }
      if (isDefault) {
        return organizationApiClient.invitationClient.getInvitationsByOrganizationId(
          organizationId,
          pageToken ?? undefined,
          maxPageSize,
        );
      }
      return organizationApiClient.roleClient.getInvitationsWithRole(
        organizationId,
        roleId,
        pageToken ?? undefined,
        maxPageSize,
      );
    },
  });
};

export const useGetInvitationsWithRole = (
  organizationId?: string,
  roleId?: string,
  pageToken?: string | null,
  maxPageSize?: number,
  isDefault?: boolean,
  queryEnabled = true,
) => {
  return useQuery({
    enabled: queryEnabled && !!organizationId && !!roleId,
    placeholderData: keepPreviousData,
    queryKey: [
      `${ORGANIZATIONS_ROLES_KEY_PREFIX}invitationsWithRole`,
      organizationId,
      roleId,
      isDefault,
      pageToken,
      maxPageSize,
    ],
    queryFn: async () => {
      if (!organizationId || !roleId) {
        throw new Error(
          'Tried to fetch invitations with role but organization id or role id was undefined',
        );
      }
      let invitationsWithRole;
      if (isDefault) {
        invitationsWithRole =
          await organizationApiClient.invitationClient.getInvitationsByOrganizationId(
            organizationId,
            pageToken ?? undefined,
            maxPageSize,
          );
      } else {
        invitationsWithRole = await organizationApiClient.roleClient.getInvitationsWithRole(
          organizationId,
          roleId,
          pageToken ?? undefined,
          maxPageSize,
        );
      }
      const invitationRoles = await Promise.all(
        invitationsWithRole.invitations.map(async (invitation: Invitation) => {
          if (!invitation.id) {
            return null;
          }
          const roleIdsByInvitation =
            await organizationApiClient.invitationClient.getRoleIdsByInvitationId(
              organizationId,
              invitation.id,
            );
          return {
            userId: invitation.recipientUserId ?? '',
            roleIds: roleIdsByInvitation?.roleIds ?? [],
            invitationId: invitation.id,
          };
        }),
      );
      const userIds = invitationsWithRole.invitations.map((invitation: Invitation) =>
        invitation?.recipientUserId ? Number.parseInt(invitation.recipientUserId, 10) : -1,
      );
      const usersResponse = await usersClient.getUsersByIds(userIds);
      const invitationsUserMap = new Map(
        usersResponse.data?.map((user) => [`${user.id ?? 0}`, user]),
      );
      const invitationsPageToken = invitationsWithRole.pageToken;
      return { invitationRoles, invitationsUserMap, invitationsPageToken };
    },
  });
};

export const invalidateInvitationQueries = (
  queryClient: QueryClient,
  organizationId: string,
  roleIds?: string[] | null,
) => {
  void queryClient.invalidateQueries({
    predicate(query) {
      const keyRoleId = query.queryKey[2];
      return !!(
        (query.queryKey[0] === `${ORGANIZATIONS_ROLES_KEY_PREFIX}invitationsWithRole` ||
          query.queryKey[0] === `${ORGANIZATIONS_ROLES_KEY_PREFIX}invitationsByRole`) &&
        query.queryKey[1] === organizationId &&
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- queryKey[3] is the isDefault flag; when false we still want to fall through to the role-id match
        (query.queryKey[3] || (typeof keyRoleId === 'string' && roleIds?.includes(keyRoleId)))
      );
    },
  });
};

export const invalidateMemberQueries = (
  queryClient: QueryClient,
  groupId: string,
  roleIds?: string[] | null,
) => {
  void queryClient.invalidateQueries({
    predicate(query) {
      const keyRoleId = query.queryKey[2];
      return !!(
        query.queryKey[0] === `${GROUPS_ROLES_KEY_PREFIX}usersWithRole` &&
        query.queryKey[1] === groupId &&
        typeof keyRoleId === 'string' &&
        roleIds?.includes(keyRoleId)
      );
    },
  });
};

type TUseUpdateRoleMetadataProps = {
  groupId: number;
  rolesetId: number;
  name: string;
  description: string;
  rank: number;
  color: number;
  isPrivate?: boolean;
};

export function useUpdateRoleMetadata() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      groupId,
      rolesetId,
      name,
      description,
      rank,
      color,
      isPrivate,
    }: TUseUpdateRoleMetadataProps) => {
      const request: RobloxGroupsApiModelsRequestUpdateRoleSetRequest = {
        name,
        description,
        rank,
        color,
        isPrivate,
      };
      return groupsClient.updateRoleSet(groupId, rolesetId, request);
    },
    onSettled: (...args) => {
      const mutationVariables = args[2];
      const { groupId } = mutationVariables;
      void queryClient.invalidateQueries({
        queryKey: [`${GROUPS_ROLES_KEY_PREFIX}all`, String(groupId)],
      });
    },
  });
}

type TUseReorderRoleProps = {
  groupId: number;
  roleId: number;
  previousRoleId?: number;
  nextRoleId?: number;
};

export function useReorderRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ groupId, roleId, previousRoleId, nextRoleId }: TUseReorderRoleProps) => {
      const request: RobloxGroupsApiModelsRequestUpdateRoleSetPositionRequest = {
        previousRoleId,
        nextRoleId,
      };
      return groupsClient.reorderRoleSet(groupId, roleId, request);
    },
    onSettled: (...args) => {
      const mutationVariables = args[2];
      const { groupId } = mutationVariables;
      void queryClient.invalidateQueries({
        queryKey: [`${GROUPS_ROLES_KEY_PREFIX}all`, String(groupId)],
      });
    },
  });
}

type TUseDeleteRoleProps = {
  groupId: number;
  rolesetId: number;
};

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ groupId, rolesetId }: TUseDeleteRoleProps) => {
      return groupsClient.deleteRoleSet(groupId, rolesetId);
    },
    onSettled: (...args) => {
      const mutationVariables = args[2];
      const { groupId } = mutationVariables;
      void queryClient.invalidateQueries({
        queryKey: [`${GROUPS_ROLES_KEY_PREFIX}all`, String(groupId)],
      });
    },
  });
}

type TUseCreateRoleProps = {
  groupId: number;
  name: string;
  description: string;
  rank: number;
  usingGroupFunds?: boolean;
  isPrivate?: boolean;
};

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      groupId,
      name,
      description,
      rank,
      usingGroupFunds,
      isPrivate,
    }: TUseCreateRoleProps) => {
      const request: RobloxGroupsApiModelsRequestCreateRoleSetRequest = {
        name,
        description,
        rank,
        usingGroupFunds,
        isPrivate,
      };
      return groupsClient.createRoleSet(groupId, request);
    },
    onSettled: (...args) => {
      const mutationVariables = args[2];
      const { groupId } = mutationVariables;
      void queryClient.invalidateQueries({
        queryKey: [`${GROUPS_ROLES_KEY_PREFIX}all`, String(groupId)],
      });
    },
  });
}

export function useGetGroupConfigurationMetadata() {
  return useQuery({
    placeholderData: keepPreviousData,
    queryKey: [GROUPS_CONFIGURATION_KEY],
    queryFn: () => groupsClient.getConfigurationMetadata(),
  });
}

export function useGetGroupProductFeatures(groupId: number | undefined) {
  return useQuery({
    enabled: groupId !== undefined,
    queryKey: [GROUPS_PRODUCT_FEATURES_KEY, groupId],
    // Product features are stable for the page session. Keeping a successful response fresh lets
    // nested consumers reuse the request started by GroupRoles without refetching on mount.
    staleTime: Infinity,
    queryFn: () => {
      if (groupId === undefined) {
        throw new Error('Tried to fetch product features for a group but group id was undefined');
      }
      return groupsClient.getGroupProductFeatures(groupId);
    },
  });
}
