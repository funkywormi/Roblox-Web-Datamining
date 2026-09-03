import { AssignedRole, Role } from '../../shared/types';

export type ComputeManageableRolesParams = {
  /** Whether the acting user can assign roles at all (owner, or has the changeRank permission). */
  authedUserCanManageRanks: boolean | undefined;
  isLoggedInUserOwner: boolean;
  /** The unified-groups feature flag. */
  isUnifiedUIEnabled: boolean;
  /** True while the group's migration status is still being fetched. */
  isMigrationStatusLoading: boolean;
  /** True when the flag is on AND the group is migrated (lexorank-based). */
  isUnifiedGroup: boolean;
  /** All group roles, ascending lexorank order. */
  roles: Array<Role>;
  /** The acting user's held roles (unified groups only); undefined until loaded. */
  authedUserRoles: Array<AssignedRole> | undefined;
  /** The acting user's rank (legacy groups only). */
  authedUserRank: number | undefined;
};

/**
 * Derives the roles the acting user may assign/unassign, or `undefined` when it can't yet be
 * determined (missing permission, or migration status still loading — callers should treat
 * `undefined` as "not ready" rather than "none").
 *
 * - Owner: every role.
 * - Unified (migrated) group: roles positioned below the acting user's highest-held role in the
 *   ascending-lexorank `roles` list.
 * - Legacy group: roles with a rank lower than the acting user's.
 *
 * Pure: depends only on its arguments.
 */
export const computeManageableRoles = ({
  authedUserCanManageRanks,
  isLoggedInUserOwner,
  isUnifiedUIEnabled,
  isMigrationStatusLoading,
  isUnifiedGroup,
  roles,
  authedUserRoles,
  authedUserRank
}: ComputeManageableRolesParams): Array<Role> | undefined => {
  if (!authedUserCanManageRanks) {
    return undefined;
  }
  if (isLoggedInUserOwner) {
    return roles;
  }
  // Don't fall back to the legacy path until we know whether the group is migrated.
  if (isUnifiedUIEnabled && isMigrationStatusLoading) {
    return undefined;
  }

  if (isUnifiedGroup) {
    if (!roles.length || !authedUserRoles) {
      return undefined;
    }
    // `roles` is ascending lexorank, so the highest held role is the max index; manage below it.
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
  }

  // Legacy rank-based behavior.
  if (!authedUserRank) {
    return undefined;
  }
  return roles.filter(role => role.rank < authedUserRank);
};
