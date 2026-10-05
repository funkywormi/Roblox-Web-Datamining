import useCurrentGroup from '../../hooks/useCurrentGroup';
import { useEarlyTesterAssignment } from '../../queries/earlyTestersQueries';
import { canAssignRole, canViewRolePermissions } from '../../utils/groupPermissions';

export type EarlyTesterRoleAccess = {
  canView: boolean;
  canEditMembers: boolean;
  canEditAssignment: boolean;
};

const noAccess: EarlyTesterRoleAccess = {
  canView: false,
  canEditMembers: false,
  canEditAssignment: false,
};

const fullAccess: EarlyTesterRoleAccess = {
  canView: true,
  canEditMembers: true,
  canEditAssignment: true,
};

/**
 * Access to the universe early testers tab, based on the logged-in user's resolved
 * permissions for the role that currently holds early tester access.
 */
export function useEarlyTesterRoleAccess(
  universeId: string | undefined,
  enabled: boolean,
): EarlyTesterRoleAccess {
  const { isOwner, organization, rolePermissions } = useCurrentGroup();
  const groupId =
    enabled && organization?.groupId != null ? Number(organization.groupId) : undefined;
  const { data, isPending, isError } = useEarlyTesterAssignment(groupId, universeId ?? '');

  if (!enabled) {
    return noAccess;
  }

  if (isOwner === true) {
    return fullAccess;
  }

  if (isPending || isError || rolePermissions == null) {
    return noAccess;
  }

  const roleId = data?.universeRole?.id;
  if (roleId == null) {
    return noAccess;
  }

  const permissions = rolePermissions[roleId.toString()];
  const canEditMembers = canAssignRole(permissions);

  return {
    canView: canViewRolePermissions(permissions) || canEditMembers,
    canEditMembers,
    canEditAssignment: false,
  };
}
