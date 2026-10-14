export const MIGRATION_STATUS = {
  NOT_MIGRATED: 'NotMigrated',
  MIGRATING: 'Migrating',
  MIGRATED: 'Migrated',
} as const;

export type MigrationStatus = (typeof MIGRATION_STATUS)[keyof typeof MIGRATION_STATUS];

export const UNIFIED_BY_DEFAULT_CREATED_AFTER = new Date('2026-09-09T20:27:48Z');

export enum ModalState {
  None,
  Migrated,
}

export const DEVFORUM_URL = 'https://devforum.roblox.com/unified-group-roles-and-permissions';
