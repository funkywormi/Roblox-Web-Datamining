import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import groupsClient from '../clients/groups';

const MIGRATION_KEY_PREFIX = 'groupMigration_';

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
    queryKey: [`${MIGRATION_KEY_PREFIX}status`, groupId],
    queryFn: async () => {
      if (!groupId) {
        throw new Error('groupId required');
      }
      return getGroupMigrationStatus(groupId);
    },
  });
}

export function useGetMigrationBreakingChanges(
  groupId: number | undefined,
  options: { enabled: boolean },
) {
  return useQuery({
    enabled: !!groupId && options.enabled,
    queryKey: [`${MIGRATION_KEY_PREFIX}breakingChanges`, groupId],
    queryFn: async () => {
      if (!groupId) {
        throw new Error('groupId required');
      }
      return groupsClient.getGroupMigrationBreakingChanges(groupId);
    },
  });
}

export function useMigrateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: number) => groupsClient.migrateGroup(groupId),
    onSuccess: (_data, groupId) => {
      void queryClient.invalidateQueries({
        queryKey: [`${MIGRATION_KEY_PREFIX}status`, groupId],
      });
    },
  });
}
