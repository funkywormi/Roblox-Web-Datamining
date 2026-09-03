import { useCallback, useMemo } from 'react';
import type { GroupRoleMetadata, GroupUserWithRoles } from '../clients/groups';
import { useGetGroupInfo, useGetGroupsRoles, useGetUsersGroupRole } from '../queries';
import type { InvitedMember } from '../utils/constants';
import { canAssignRole } from '../utils/groupPermissions';
import { buildRoleHierarchy, outranksUser } from '../utils/roleHierarchy';
import useCurrentGroup from './useCurrentGroup';

type MemberPermissions = {
  assignableRoles: GroupRoleMetadata[];
  canAssignRoleId: (roleId?: number | null) => boolean;
  canKickMember: (member: GroupUserWithRoles | InvitedMember) => boolean;
  canUninviteMember: boolean;
};

const useMemberPermissions = (): MemberPermissions => {
  const {
    isOwner,
    organization,
    permissions,
    rolePermissions,
    user: currentUser,
  } = useCurrentGroup();
  const { data: roles } = useGetGroupsRoles(organization?.groupId);
  const { data: groupInfo } = useGetGroupInfo(organization?.groupId);
  const { data: authenticatedUserMembership } = useGetUsersGroupRole(
    currentUser?.id ?? 0,
    organization?.groupId,
  );
  const authenticatedUserRoles = useMemo(
    () => (authenticatedUserMembership?.role ? [authenticatedUserMembership.role] : undefined),
    [authenticatedUserMembership],
  );

  const hierarchy = useMemo(() => buildRoleHierarchy(roles), [roles]);

  const canAssignRoleId = useCallback(
    (roleId?: number | null) => {
      if (roleId === undefined || roleId === null) {
        return false;
      }
      return isOwner === true || canAssignRole(rolePermissions?.[roleId.toString()]);
    },
    [isOwner, rolePermissions],
  );

  const assignableRoles = useMemo(
    () => roles?.filter((role) => canAssignRoleId(role.id)) ?? [],
    [roles, canAssignRoleId],
  );

  const canKickMember = useCallback(
    (member: GroupUserWithRoles | InvitedMember) => {
      const targetUserId = member.user?.userId;
      if (targetUserId === undefined || targetUserId === null) {
        return false;
      }
      if (targetUserId === currentUser?.id || targetUserId === groupInfo?.ownerId) {
        return false;
      }
      if (permissions?.canKickMembers !== true) {
        return false;
      }
      return isOwner === true || outranksUser(hierarchy, authenticatedUserRoles, member.roles);
    },
    [currentUser, groupInfo, permissions, isOwner, hierarchy, authenticatedUserRoles],
  );

  return useMemo(
    () => ({
      assignableRoles,
      canAssignRoleId,
      canKickMember,
      canUninviteMember: permissions?.canInviteMembers === true,
    }),
    [assignableRoles, canAssignRoleId, canKickMember, permissions],
  );
};

export default useMemberPermissions;
