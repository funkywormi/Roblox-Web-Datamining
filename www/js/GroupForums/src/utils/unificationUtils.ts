import type {
  RobloxGroupsApiBreakingChangeEntry,
  RobloxGroupsApiGroupMigrationStatusResponse,
  RobloxGroupsApiGroupMigrationBreakingChangesResponse,
} from '@rbx/client-groups/v1';

export type { RobloxGroupsApiBreakingChangeEntry as BreakingChangeEntry };
export type { RobloxGroupsApiGroupMigrationStatusResponse as MigrationStatusResponse };
export type { RobloxGroupsApiGroupMigrationBreakingChangesResponse as MigrationBreakingChangesResponse };

export const MIGRATION_STATUS = {
  NOT_MIGRATED: 'NotMigrated',
  MIGRATING: 'Migrating',
  MIGRATED: 'Migrated',
} as const;

export type MigrationStatus = (typeof MIGRATION_STATUS)[keyof typeof MIGRATION_STATUS];

export enum ModalState {
  None,
  Breaking,
  NonBreaking,
  Migrated,
}

export const LINKED_OUT_MODAL_SUPPRESSION_QUERY_PARAM = 'suppressUnificationModal';
export const AssignSameRolePermission = 'Organization.AssignSameRole';
export const DEVFORUM_URL =
  'https://devforum.roblox.com/t/private-beta-unified-roles-permissions-for-communities-and-creator-hub/4667049';

export const SNOOZE_DURATION_MS = 18 * 60 * 60 * 1000;

export function isUnificationModalSuppressed(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return new URLSearchParams(window.location.search).has(LINKED_OUT_MODAL_SUPPRESSION_QUERY_PARAM);
}

export function getSnoozeKey(groupId: number): string {
  return `group-unification-snoozed-at-${groupId}`;
}

export function isSnoozed(groupId: number): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const raw = window.localStorage.getItem(getSnoozeKey(groupId));
  if (!raw) {
    return false;
  }
  const snoozedAt = Number(raw);
  return Date.now() < snoozedAt + SNOOZE_DURATION_MS;
}

export function snooze(groupId: number): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(getSnoozeKey(groupId), String(Date.now()));
}
