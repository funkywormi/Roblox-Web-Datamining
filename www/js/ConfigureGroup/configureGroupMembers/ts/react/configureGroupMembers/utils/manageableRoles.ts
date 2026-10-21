import { AssignedRole, Role } from '../../shared/types';

export type ComputeManageableRolesParams = {
  /** Whether the acting user can assign roles at all (owner, or has the changeRank permission). */
  authedUserCanManageRanks: boolean | undefined;
  isLoggedInUserOwner: boolean;
  /** All group roles, ascending lexorank order. */
  roles: Array<Role>;
  /** The acting user's held roles; undefined until loaded. */
  authedUserRoles: Array<AssignedRole> | undefined;
};

/**
 * Derives the roles the acting user may assign/unassign, or `undefined` when it can't yet be
 * determined; callers should treat `undefined` as "not ready" rather than "none".
 *
 * - Owner: every role.
 * - Roles positioned below the acting user's highest-held role in the ascending-lexorank `roles`
 *   list.
 *
 * Pure: depends only on its arguments.
 */
export const computeManageableRoles = ({
  authedUserCanManageRanks,
  isLoggedInUserOwner,
  roles,
  authedUserRoles
}: ComputeManageableRolesParams): Array<Role> | undefined => {
  if (!authedUserCanManageRanks) {
    return undefined;
  }
  if (isLoggedInUserOwner) {
    return roles;
  }
  if (!roles.length || !authedUserRoles) {
    return undefined;
  }
  const roleIndexById = new Map(roles.map((role, index) => [role.id, index]));
  let highestHeldIndex = -1;
  authedUserRoles.forEach(held => {
    const index = roleIndexById.get(held.id);
    if (index !== undefined && index > highestHeldIndex) {
      highestHeldIndex = index;
    }
  });
  if (highestHeldIndex < 0) {
    return [];
  }
  return roles.filter((_, index) => index < highestHeldIndex);
};
