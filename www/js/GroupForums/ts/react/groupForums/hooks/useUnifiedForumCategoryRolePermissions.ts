import { useQuery } from '@tanstack/react-query';
import { ForumCategoryRolePermissionResponse } from '../types';
import forumsService from '../services/forumsService';
import { getCategoryRolePermissionsKey } from '../services/queryKeys';

type UseUnifiedForumCategoryRolePermissionsOptions = {
  groupId: number;
  categoryId: string;
  roleId?: number;
  enabled: boolean;
  onError: () => void;
};

type UseUnifiedForumCategoryRolePermissionsResult = {
  data?: ForumCategoryRolePermissionResponse;
  isLoading: boolean;
};

export default function useUnifiedForumCategoryRolePermissions({
  groupId,
  categoryId,
  roleId,
  enabled,
  onError
}: UseUnifiedForumCategoryRolePermissionsOptions): UseUnifiedForumCategoryRolePermissionsResult {
  const { data, isLoading } = useQuery({
    queryKey: getCategoryRolePermissionsKey(groupId, categoryId, roleId ?? 0),
    queryFn: async () => {
      if (!roleId) {
        throw new Error('roleId required');
      }
      return forumsService.getUnifiedGroupForumCategoryRolePermissions(groupId, categoryId, roleId);
    },
    enabled: enabled && !!roleId,
    onError,
    retry: false,
    refetchOnWindowFocus: false
  });

  return { data, isLoading };
}
