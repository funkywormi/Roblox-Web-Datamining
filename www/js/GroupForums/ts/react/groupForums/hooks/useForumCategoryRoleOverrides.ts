import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { GroupRolePermissions } from '../../shared/types';
import forumsService from '../services/forumsService';
import { getCategoryRolesPermissionsKey } from '../services/queryKeys';

type UseForumCategoryRoleOverridesOptions = {
  groupId: number;
  categoryId: string;
  onError: () => void;
};

export default function useForumCategoryRoleOverrides({
  groupId,
  categoryId,
  onError
}: UseForumCategoryRoleOverridesOptions): UseQueryResult<GroupRolePermissions[]> {
  return useQuery({
    queryKey: getCategoryRolesPermissionsKey(groupId, categoryId),
    queryFn: async () => {
      const response = await forumsService.getGroupForumCategoryRolesPermissions(
        groupId,
        categoryId
      );
      return response.data;
    },
    onError,
    retry: false,
    refetchOnWindowFocus: false
  });
}
