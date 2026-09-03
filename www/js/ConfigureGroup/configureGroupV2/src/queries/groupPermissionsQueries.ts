import { useQuery } from '@tanstack/react-query';
import groupsClient from '../clients/groups';
import type { GroupRolePermissions } from '../clients/groups';

const GROUP_ROLE_PERMISSIONS_QUERY_KEY = 'groupRolePermissions';

export type GroupPermissionsQueryOptions = {
  enabled?: boolean;
};

export async function getResolvedGroupRolePermissions(
  groupId: number,
): Promise<GroupRolePermissions> {
  const rolePermissions: GroupRolePermissions = {};
  const response = await groupsClient.getGroupRolePermissionsPage(groupId);

  response.data?.forEach(({ entityId, permissions }) => {
    if (entityId !== undefined && permissions !== undefined) {
      rolePermissions[entityId] = permissions;
    }
  });

  return rolePermissions;
}

export function useGetResolvedGroupRolePermissions(
  groupId: number | undefined,
  options?: GroupPermissionsQueryOptions,
) {
  return useQuery({
    enabled: !!groupId && (options?.enabled ?? true),
    queryKey: [GROUP_ROLE_PERMISSIONS_QUERY_KEY, groupId],
    queryFn: async () => {
      if (!groupId) {
        throw new Error('groupId required');
      }

      return getResolvedGroupRolePermissions(groupId);
    },
  });
}
