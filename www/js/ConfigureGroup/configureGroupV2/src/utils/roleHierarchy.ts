import type { GroupRoleMetadata, GroupUserRole } from '../clients/groups';

/**
 * Maps a role id to its position in the group's role hierarchy, where 0 is the highest role.
 */
export type RoleHierarchy = ReadonlyMap<number, number>;

const UNRANKED = Number.POSITIVE_INFINITY;

export const buildRoleHierarchy = (roles?: GroupRoleMetadata[] | null): RoleHierarchy => {
  const hierarchy = new Map<number, number>();
  if (!roles) {
    return hierarchy;
  }

  const highestFirst = roles.toReversed();
  highestFirst.forEach((role, index) => {
    if (role.id !== undefined && role.id !== null) {
      hierarchy.set(role.id, index);
    }
  });

  return hierarchy;
};

export const getHighestRole = (userRoles?: GroupUserRole[] | null): GroupUserRole | undefined =>
  userRoles?.[0];

export const getHierarchyPosition = (hierarchy: RoleHierarchy, roleId?: number | null): number =>
  roleId === undefined || roleId === null ? UNRANKED : (hierarchy.get(roleId) ?? UNRANKED);

export const isHigherInHierarchy = (
  hierarchy: RoleHierarchy,
  roleId?: number | null,
  otherRoleId?: number | null,
): boolean => {
  const position = getHierarchyPosition(hierarchy, roleId);
  if (position === UNRANKED) {
    return false;
  }
  return position < getHierarchyPosition(hierarchy, otherRoleId);
};

export const outranksUser = (
  hierarchy: RoleHierarchy,
  authenticatedUserRoles?: GroupUserRole[] | null,
  targetUserRoles?: GroupUserRole[] | null,
): boolean =>
  isHigherInHierarchy(
    hierarchy,
    getHighestRole(authenticatedUserRoles)?.id,
    getHighestRole(targetUserRoles)?.id,
  );
