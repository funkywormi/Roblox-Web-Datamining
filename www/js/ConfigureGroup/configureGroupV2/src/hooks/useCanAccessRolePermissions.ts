import { useCallback, useMemo } from 'react';
import { useGetGroupsRoles } from '../queries';
import { canViewRolePermissionsTab } from '../utils/groupPermissions';
import useCurrentGroup from './useCurrentGroup';

export type RolePermissionsAccess = {
  canAccess: boolean;
  isError: boolean;
  isLoading: boolean;
  retry: () => Promise<void>;
};

export default function useCanAccessRolePermissions(): RolePermissionsAccess {
  const { isOwner, organization, rolePermissions, refreshPermission } = useCurrentGroup();
  const { data: roles, isPending, isError, refetch } = useGetGroupsRoles(organization?.groupId);

  const retry = useCallback(async () => {
    await Promise.all([refreshPermission(), refetch()]);
  }, [refreshPermission, refetch]);

  return useMemo(() => {
    if (isOwner) {
      return { canAccess: true, isError: false, isLoading: false, retry };
    }

    const isLoading = rolePermissions === undefined || isPending;
    const hasError = rolePermissions === null || isError;

    if (isLoading || hasError) {
      return { canAccess: false, isError: hasError, isLoading, retry };
    }

    return {
      canAccess:
        roles?.some((role) =>
          canViewRolePermissionsTab(
            role.id === undefined ? undefined : rolePermissions[role.id.toString()],
          ),
        ) ?? false,
      isError: false,
      isLoading: false,
      retry,
    };
  }, [isError, isOwner, isPending, retry, rolePermissions, roles]);
}
