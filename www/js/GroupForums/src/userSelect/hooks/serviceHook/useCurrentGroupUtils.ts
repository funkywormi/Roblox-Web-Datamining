import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { V1GroupsGroupIdUsersGetLimitEnum } from '@rbx/client-groups/v1';
import groupsClient from '../../../clients/groups';
import organizationApiClient from '../../../clients/organizationApi';
import type { User } from '../../../clients/users';
import usersClient from '../../../clients/users';
import useCurrentGroup from '../../../hooks/useCurrentGroup';
import { useGetUsersFriends } from '../../../queries/friendsQueries';
import { useGetGroupMembers } from '../../../queries/groupMembersQueries';
import { useGetInvitationsByOrganizationId } from '../../../queries/invitationsQueries';
import { useGetGroupUsersWithRoles, useGetInvitationsByRole } from '../../../queries/rolesQueries';
import useFriendsBatchRequester from './useFriendsBatchRequester';

const MAX_FETCH_SIZE = 100;

type TUseCurrentGroupUtilsProps = {
  roleId?: string;
  overrideFetchAllInvitedUsersAndMembers?: boolean;
};

const useCurrentGroupUtils = ({
  roleId,
  overrideFetchAllInvitedUsersAndMembers,
}: TUseCurrentGroupUtilsProps = {}) => {
  const cacheState = useRef<{
    invitations: boolean;
    membership: boolean;
    friendship: boolean;
    inviteRoles: boolean;
  }>({
    invitations: false,
    membership: false,
    friendship: false,
    inviteRoles: false,
  });

  const [allInvitedUsersAndMembers, setAllInvitedUsersAndMembers] = useState<User[] | undefined>();

  const groupMembersCache = useRef<Map<string, boolean>>(new Map());
  const groupRoleCache = useRef<Map<string, boolean>>(new Map());
  const orgInvitationsCache = useRef<Map<string, string | undefined>>(new Map());
  const groupFriendshipCache = useRef<Map<string, boolean>>(new Map());

  const { user, organization, permissions } = useCurrentGroup();
  const checkFriendship = useFriendsBatchRequester();

  const groupId = organization?.groupId ? parseInt(organization.groupId, 10) : undefined;
  const organizationId = organization?.id;
  const authenticatedUserId = user?.id;
  const canInviteMembers = permissions?.canInviteMembers === true;

  const { data: groupMembers, isFetching: isGroupMembersFetching } = useGetGroupMembers(
    groupId?.toString(),
    V1GroupsGroupIdUsersGetLimitEnum.NUMBER_100,
  );
  const {
    data: invitations,
    isFetching: isInvitationsFetching,
    isError: isInvitationsError,
  } = useGetInvitationsByOrganizationId(
    canInviteMembers ? organization?.id : undefined,
    undefined,
    MAX_FETCH_SIZE,
  );
  const { data: invitationsByRole, isFetching: isUsersWithRoleFetching } = useGetInvitationsByRole(
    canInviteMembers && roleId ? organization?.id : undefined,
    canInviteMembers && roleId ? roleId : undefined,
    undefined,
    MAX_FETCH_SIZE,
  );
  const { data: groupUsersWithRole, isFetching: isGroupUsersWithRoleFetching } =
    useGetGroupUsersWithRoles(groupId?.toString() ?? '', roleId ? Number(roleId) : undefined);
  const { data: friends, isFetching: isFriendsFetching } = useGetUsersFriends(authenticatedUserId);

  const isFetching =
    !groupId ||
    !organizationId ||
    !authenticatedUserId ||
    isGroupMembersFetching ||
    isInvitationsFetching ||
    (!!roleId && isUsersWithRoleFetching) ||
    (!!roleId && isGroupUsersWithRoleFetching) ||
    isFriendsFetching;

  const fetchAllInvitedUsersAndMembers = useCallback(async () => {
    const allUserIds = Array.from(groupMembersCache.current.keys())
      .concat(Array.from(orgInvitationsCache.current.keys()))
      .map((id) => parseInt(id, 10));
    try {
      const allUsers = await usersClient.getUsersByIds(allUserIds);
      setAllInvitedUsersAndMembers(allUsers.data);
    } catch {
      setAllInvitedUsersAndMembers(undefined);
    }
  }, []);

  const isUserInGroup = useCallback(
    async (userId: number): Promise<boolean> => {
      if (cacheState.current.membership) {
        return groupMembersCache.current.get(userId.toString()) ?? false;
      }

      try {
        const rolesResponse = await groupsClient.getUsersGroupRoles(userId);
        const group = rolesResponse.data?.filter((role) => role.group?.id === groupId);
        const isInGroup = group?.length !== 0;
        return isInGroup;
      } catch {
        return false;
      }
    },
    [groupId],
  );

  const getUserInvitationId = useCallback(
    async (userId: number): Promise<string | undefined> => {
      if (!canInviteMembers) {
        return undefined;
      }
      if (cacheState.current.invitations) {
        return orgInvitationsCache.current.get(userId.toString());
      }

      if (!organizationId) {
        return undefined;
      }
      try {
        const userInvitation =
          await organizationApiClient.userClient.getUserInvitationByOrganization(
            organizationId,
            String(userId),
          );
        return userInvitation.id;
      } catch {
        return undefined;
      }
    },
    [canInviteMembers, organizationId],
  );

  const isUserInvited = useCallback(
    async (userId: number): Promise<boolean> => !!(await getUserInvitationId(userId)),
    [getUserInvitationId],
  );

  const isUserFriend = useCallback(
    async (userId: number): Promise<boolean> => {
      if (cacheState.current.friendship) {
        return groupFriendshipCache.current.get(userId.toString()) ?? false;
      }

      try {
        const isFriend = await checkFriendship(userId);
        return isFriend;
      } catch {
        return false;
      }
    },
    [checkFriendship],
  );

  const isUserInRole = useCallback(
    async (userId: number): Promise<boolean> => {
      if (!roleId) {
        throw new Error('Role ID is required for this function');
      }

      if (cacheState.current.membership) {
        return groupRoleCache.current.get(userId.toString()) ?? false;
      }

      if (groupRoleCache.current.get(userId.toString())) {
        return true;
      }

      if (!groupId) {
        return false;
      }

      try {
        const invitationId = await getUserInvitationId(userId);
        if (invitationId && organizationId) {
          const { roleIds } = await organizationApiClient.invitationClient.getRoleIdsByInvitationId(
            organizationId,
            invitationId,
          );
          const roleIdsSet = new Set(roleIds);
          return roleIdsSet.has(roleId);
        }
      } catch {
        // ignore lookup error and try the next data source
      }

      try {
        const rolesResponse = await groupsClient.getGroupUsersWithRoles({
          groupId,
          roleSetId: Number(roleId),
          userIds: [userId],
        });
        return (rolesResponse.data?.length ?? 0) > 0;
      } catch {
        // ignore lookup error
      }
      return false;
    },
    [roleId, organizationId, groupId, getUserInvitationId],
  );

  useEffect(() => {
    if (isFetching) {
      return;
    }

    cacheState.current = {
      invitations:
        !canInviteMembers ||
        (!isInvitationsError && !!invitations && invitations.invitations.length < MAX_FETCH_SIZE),
      membership:
        !!groupMembers &&
        (groupMembers.data?.length ?? 0) < V1GroupsGroupIdUsersGetLimitEnum.NUMBER_100,
      friendship: !!friends && friends.length < 200,
      inviteRoles:
        !canInviteMembers ||
        !roleId ||
        (!!invitationsByRole && invitationsByRole.invitations.length < MAX_FETCH_SIZE),
    };

    groupMembersCache.current = new Map(
      groupMembers?.data
        ?.filter(
          (entry): entry is typeof entry & { user: { userId: number } } =>
            entry.user?.userId != null,
        )
        .map((entry) => [entry.user.userId.toString(), true]) ?? [],
    );

    orgInvitationsCache.current = new Map(
      (!canInviteMembers || isInvitationsError ? [] : (invitations?.invitations ?? []))
        .filter(
          (invitation): invitation is typeof invitation & { recipientUserId: string } =>
            !!invitation.recipientUserId,
        )
        .map((invitation) => [invitation.recipientUserId, invitation.id]) ?? [],
    );

    const groupRoleUserIds = new Set(
      groupUsersWithRole?.data?.flatMap((entry) =>
        entry.user?.userId != null ? [entry.user.userId.toString()] : [],
      ) ?? [],
    );

    groupRoleCache.current = new Map(
      groupMembers?.data
        ?.filter(
          (entry): entry is typeof entry & { user: { userId: number } } =>
            entry.user?.userId != null,
        )
        .map((entry) => [
          entry.user.userId.toString(),
          groupRoleUserIds.has(entry.user.userId.toString()),
        ]) ?? [],
    );
    if (canInviteMembers) {
      invitationsByRole?.invitations.forEach((invitation) => {
        if (invitation.recipientUserId !== undefined) {
          groupRoleCache.current.set(invitation.recipientUserId, true);
        }
      });
    }

    groupFriendshipCache.current = new Map(
      friends
        ?.filter((friend): friend is typeof friend & { id: number } => friend.id !== undefined)
        .map((friend) => [friend.id.toString(), true]) ?? [],
    );

    const shouldFetch =
      (overrideFetchAllInvitedUsersAndMembers ?? false)
        ? overrideFetchAllInvitedUsersAndMembers
        : !!roleId;

    if (
      cacheState.current.membership &&
      (cacheState.current.invitations || isInvitationsError) &&
      shouldFetch
    ) {
      void fetchAllInvitedUsersAndMembers();
    }
  }, [
    isFetching,
    fetchAllInvitedUsersAndMembers,
    friends,
    groupMembers,
    groupUsersWithRole,
    invitations,
    invitationsByRole,
    isInvitationsError,
    roleId,
    overrideFetchAllInvitedUsersAndMembers,
    canInviteMembers,
  ]);

  const returnValue = useMemo(
    () => ({
      isUserInGroup,
      isUserInvited,
      isUserFriend,
      isUserInRole,
      allInvitedUsersAndMembers,
      isFetching,
    }),
    [
      isUserInGroup,
      isUserInvited,
      isUserFriend,
      isUserInRole,
      allInvitedUsersAndMembers,
      isFetching,
    ],
  );

  return returnValue;
};

export default useCurrentGroupUtils;
