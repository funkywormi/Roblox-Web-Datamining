import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { GroupRolePermissions } from '@rbx/group-management';
import forumsService from '../services/forumsService';
import { getResolvedGroupRolePermissionsKey } from '../services/queryKeys';

type UseResolvedGroupRolePermissionsOptions = {
  groupId: number;
  onError: () => void;
};

export default function useResolvedGroupRolePermissions({
  groupId,
  onError
}: UseResolvedGroupRolePermissionsOptions): UseQueryResult<GroupRolePermissions> {
  return useQuery({
    queryKey: getResolvedGroupRolePermissionsKey(groupId),
    queryFn: async () => forumsService.getResolvedGroupRolePermissions(groupId),
    onError,
    retry: false,
    refetchOnWindowFocus: false
  });
}
