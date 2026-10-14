import { useQuery } from '@tanstack/react-query';
import groupsClient from '../clients/groups';

const MIGRATION_KEY_PREFIX = 'groupMigration_';
export const GROUP_MIGRATION_STATUS_QUERY_KEY = `${MIGRATION_KEY_PREFIX}status`;

export type MigrationStatusQueryOptions = {
  enabled?: boolean;
};

export function getGroupMigrationStatus(groupId: number) {
  return groupsClient.getGroupMigrationStatus(groupId);
}

export function useGetMigrationStatus(
  groupId: number | undefined,
  options?: MigrationStatusQueryOptions,
) {
  return useQuery({
    enabled: !!groupId && (options?.enabled ?? true),
    queryKey: [GROUP_MIGRATION_STATUS_QUERY_KEY, groupId],
    queryFn: async () => {
      if (!groupId) {
        throw new Error('groupId required');
      }
      return getGroupMigrationStatus(groupId);
    },
  });
}
