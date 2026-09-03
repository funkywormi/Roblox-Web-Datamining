import type { ResolvedPermissions } from '../clients/groups';

export const canAssignRole = (permissions: ResolvedPermissions | undefined): boolean =>
  permissions?.canAssign === true;

export const canEditRoleMetadata = (permissions: ResolvedPermissions | undefined): boolean =>
  permissions?.canEditMetadata === true;

export const canEditRolePermissions = (permissions: ResolvedPermissions | undefined): boolean =>
  permissions?.canEditPermissions === true;

export const canViewRolePermissions = (permissions: ResolvedPermissions | undefined): boolean =>
  permissions?.canViewPermissions === true;

export const canUpdateRolePosition = (permissions: ResolvedPermissions | undefined): boolean =>
  permissions?.canUpdatePosition === true;

export const canViewRoleMembersTab = (
  permissions: ResolvedPermissions | undefined,
  isDefaultMemberRole: boolean,
  isGuestRole: boolean,
  isOwner: boolean | undefined = false,
): boolean => !isDefaultMemberRole && !isGuestRole && (isOwner || canAssignRole(permissions));

// canViewPermissions is resolved true for owners, permission editors, and role assigners.
export const canViewRolePermissionsTab = (
  permissions: ResolvedPermissions | undefined,
  isOwner: boolean | undefined = false,
): boolean => isOwner || canViewRolePermissions(permissions);

export const canViewRoleSettingsTab = (
  permissions: ResolvedPermissions | undefined,
  isGuestRole: boolean,
  isOwner: boolean | undefined = false,
): boolean => !isGuestRole && (isOwner || canEditRoleMetadata(permissions));

export const canViewAnyRoleTab = (
  permissions: ResolvedPermissions | undefined,
  isDefaultMemberRole: boolean,
  isGuestRole: boolean,
  isOwner: boolean | undefined = false,
): boolean =>
  canViewRolePermissionsTab(permissions, isOwner) ||
  canViewRoleMembersTab(permissions, isDefaultMemberRole, isGuestRole, isOwner) ||
  canViewRoleSettingsTab(permissions, isGuestRole, isOwner);
