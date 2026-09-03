import { AssignedRole, Role } from '../../shared/types';

export type CanModerateMemberByRankParams = {
  isLoggedInUserOwner: boolean;
  /** All group roles in lexorank order, lowest first (index 0 = lowest), as used for role management. */
  roles: Array<Role>;
  /** The acting user's held roles; undefined until loaded. */
  authedUserRoles: Array<AssignedRole> | undefined;
  targetMemberRoles: Array<AssignedRole>;
};

/** Largest index (highest role) among held roles; -1 if none are ranked. `roles` is lowest-first. */
const highestRolePosition = (
  held: Array<AssignedRole>,
  roleIndexById: Map<number, number>
): number => Math.max(-1, ...held.map(role => roleIndexById.get(role.id) ?? -1));

/**
 * Whether the acting user outranks the target and may kick/ban them: the owner outranks everyone,
 * otherwise the acting user's highest role must sit strictly above the member's in lexorank order
 * (matching computeManageableRoles). Returns false until the acting user's roles have loaded (fail
 * closed).
 */
export const canModerateMemberByRank = ({
  isLoggedInUserOwner,
  roles,
  authedUserRoles,
  targetMemberRoles
}: CanModerateMemberByRankParams): boolean => {
  if (isLoggedInUserOwner) {
    return true;
  }
  if (!roles.length || !authedUserRoles) {
    return false;
  }

  const roleIndexById = new Map(roles.map((role, index) => [role.id, index]));
  const authedUserPosition = highestRolePosition(authedUserRoles, roleIndexById);
  if (authedUserPosition < 0) {
    return false;
  }
  return authedUserPosition > highestRolePosition(targetMemberRoles, roleIndexById);
};
