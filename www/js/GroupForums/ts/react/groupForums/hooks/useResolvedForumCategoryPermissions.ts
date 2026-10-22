import { useQueries } from '@tanstack/react-query';
import { GroupPermissions } from '../../shared/types';
import forumsService from '../services/forumsService';
import { getResolvedCategoryPermissionsKey } from '../services/queryKeys';
import { mapResolvedForumCategoryPermissions } from '../services/unifiedForumPermissions';

type UseResolvedForumCategoryPermissionsOptions = {
  groupId: number;
  categoryIds: string[];
  currentCategoryId?: string;
};

type UseResolvedForumCategoryPermissionsResult = {
  permissions: Record<string, GroupPermissions['groupForumsPermissions']>;
  hasCurrentCategoryPermissionError: boolean;
};

export default function useResolvedForumCategoryPermissions({
  groupId,
  categoryIds,
  currentCategoryId
}: UseResolvedForumCategoryPermissionsOptions): UseResolvedForumCategoryPermissionsResult {
  const queries = useQueries({
    queries: categoryIds.map(categoryId => ({
      queryKey: getResolvedCategoryPermissionsKey(groupId, categoryId),
      queryFn: async () =>
        forumsService.getResolvedGroupForumCategoryPermissions(groupId, categoryId),
      enabled: true,
      retry: 1,
      refetchOnWindowFocus: false
    }))
  });

  const permissions = queries.reduce<Record<string, GroupPermissions['groupForumsPermissions']>>(
    (result, query, index) => {
      if (!query.data) {
        return result;
      }
      return {
        ...result,
        [categoryIds[index]]: mapResolvedForumCategoryPermissions(query.data)
      };
    },
    {}
  );
  const currentCategoryQuery =
    currentCategoryId !== undefined ? queries[categoryIds.indexOf(currentCategoryId)] : undefined;

  return {
    permissions,
    hasCurrentCategoryPermissionError: currentCategoryQuery?.isError === true
  };
}
