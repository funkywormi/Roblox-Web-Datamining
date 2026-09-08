import type { EntityPermissionsMetadata, PermissionRequest, PermissionResponse } from './types';

// Map permissions returned from develop API to arrakis permissions. This is for display only.
const LEGACY_TO_NEW_PERMISSIONS_MAP: Record<string, string[]> = {
  Play: ['Universe.Player'],
  Edit: ['Universe.Editor', 'Universe.Player'],
};

export function canPermissionChange(selection: PermissionResponse): boolean {
  return selection.canEdit && !selection.isInherited;
}

export function toPermissionsMap(
  legacyPermission: Record<string, string>[] = [],
): Record<string, PermissionResponse> {
  const permissionsMap: Record<string, PermissionResponse> = {};

  legacyPermission.forEach((permission) => {
    const permissionIds = LEGACY_TO_NEW_PERMISSIONS_MAP[permission.action];
    if (permissionIds) {
      permissionIds.forEach((permissionId) => {
        permissionsMap[permissionId] = {
          canEdit: false,
          isGranted: true,
        };
      });
    }
  });

  return permissionsMap;
}

function buildInheritsFromMap(
  metadata: EntityPermissionsMetadata | undefined,
): Record<string, string[]> {
  const inheritsFromById: Record<string, string[]> = {};
  metadata?.forEach((permissionGroup) => {
    permissionGroup.permissions.forEach((permission) => {
      inheritsFromById[permission.permissionId] = permission.inheritsFrom ?? [];
    });
  });
  return inheritsFromById;
}

/**
 * The set of permissions granted in their own right by a grant map — granted while none of their
 * parents were, so the grant is a deliberate choice rather than one merely inherited from a
 * granted parent. This is the intent the UI tracks (and this seeds it from the saved state); the
 * effective grant map is always re-derived from it via {@link computeEffectiveGrants}.
 */
export function deriveExplicitGrants(
  grants: Record<string, { isGranted?: boolean }>,
  metadata: EntityPermissionsMetadata | undefined,
): Set<string> {
  const inheritsFromById = buildInheritsFromMap(metadata);
  const explicitGrants = new Set<string>();
  Object.keys(grants).forEach((id) => {
    if (!grants[id].isGranted) {
      return;
    }
    const forcedByParent = (inheritsFromById[id] ?? []).some(
      (parentId) => grants[parentId]?.isGranted,
    );
    if (!forcedByParent) {
      explicitGrants.add(id);
    }
  });
  return explicitGrants;
}

/**
 * Expands an explicit-grant set into the full grant map, honoring inheritance: a permission is
 * granted if it is explicitly granted or inherits — transitively — from one that is. Tracking
 * intent as the explicit set (rather than inferring it from the effective map) means toggling a
 * parent on then off never disturbs a child the user explicitly granted in its own right.
 */
export function computeEffectiveGrants(
  explicitGrants: ReadonlySet<string>,
  metadata: EntityPermissionsMetadata | undefined,
  permissionIds: string[],
): Record<string, PermissionRequest> {
  const inheritsFromById = buildInheritsFromMap(metadata);
  const known = new Set(permissionIds);
  const effectiveGrant = new Map<string, boolean>();
  const isEffectivelyGranted = (id: string): boolean => {
    const cached = effectiveGrant.get(id);
    if (cached !== undefined) {
      return cached;
    }
    // Seed false so an inheritance cycle terminates instead of recursing forever.
    effectiveGrant.set(id, false);
    const result =
      explicitGrants.has(id) ||
      (inheritsFromById[id] ?? []).some(
        (parentId) => known.has(parentId) && isEffectivelyGranted(parentId),
      );
    effectiveGrant.set(id, result);
    return result;
  };

  const effective: Record<string, PermissionRequest> = {};
  permissionIds.forEach((id) => {
    effective[id] = { isGranted: isEffectivelyGranted(id) };
  });
  return effective;
}

export function findUpdatedPermissions(
  initialPermissions: Record<string, PermissionResponse>,
  permissionData: Record<string, PermissionRequest>,
): { selected: string[]; unselected: string[] } {
  const selected: string[] = [];
  const unselected: string[] = [];

  Object.entries(permissionData).forEach(([permissionId, permission]) => {
    if (initialPermissions[permissionId].isGranted !== permission.isGranted) {
      if (permission.isGranted) {
        selected.push(permissionId);
      } else {
        unselected.push(permissionId);
      }
    }
  });

  return { selected, unselected };
}
