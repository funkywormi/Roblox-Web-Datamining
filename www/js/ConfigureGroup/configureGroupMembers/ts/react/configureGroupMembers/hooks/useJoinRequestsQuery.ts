import {
  GetNextPageParamFunction,
  InfiniteData,
  QueryFunction,
  QueryKey,
  useInfiniteQuery,
  useQueryClient
} from '@tanstack/react-query';
import { useCallback } from 'react';
import { GroupJoinRequest, User } from '../../shared/types';
import { formatJoinRequestCountText } from '../../shared/constants/joinRequestsConstants';
import { GetJoinRequestsResponse, SortOrder } from '../types';
import groupMembersService from '../services/groupMembersService';

const COUNT_DEFAULT_SORT_ORDER: SortOrder = 'Desc';

interface UseJoinRequestsQueryParams {
  groupId: number;
  filteredUserId?: number;
  sortOrder?: SortOrder;
}

interface UseJoinRequestsQueryResult {
  queryKey: QueryKey;
  queryFn: QueryFunction<GetJoinRequestsResponse>;
  getNextPageParam: GetNextPageParamFunction<GetJoinRequestsResponse>;
  getItemsFromDataPages: (data?: InfiniteData<GetJoinRequestsResponse>) => Array<GroupJoinRequest>;
  getUserFromItem: (item: GroupJoinRequest) => User;
}

export const getJoinRequestsQueryKey = (
  groupId: number,
  filters?: { filteredUserId?: number; sortOrder?: SortOrder }
): QueryKey => {
  const baseKey = ['groups', groupId, 'join-requests'];

  return filters ? [...baseKey, filters] : baseKey;
};

const getNextPageParam = (lastPage: GetJoinRequestsResponse) => lastPage.nextPageCursor;
const getUserFromItem = (item: GroupJoinRequest) => item.requester;

const getItemsFromDataPages = (data?: InfiniteData<GetJoinRequestsResponse>) => {
  if (!data?.pages) return [];
  const allJoinRequests: Array<GroupJoinRequest> = [];
  for (const page of data.pages) {
    allJoinRequests.push(...page.data);
  }
  return allJoinRequests;
};

const useJoinRequestsQuery = ({
  groupId,
  filteredUserId,
  sortOrder
}: UseJoinRequestsQueryParams): UseJoinRequestsQueryResult => {
  const queryKey = getJoinRequestsQueryKey(groupId, { filteredUserId, sortOrder });

  const queryFn = useCallback(
    async ({ pageParam }: { pageParam?: string }) => {
      if (filteredUserId) {
        // maintain same data shape as paged response
        const joinRequest = await groupMembersService.getJoinRequest({
          groupId,
          userId: filteredUserId
        });
        return {
          data: joinRequest ? [joinRequest] : []
        };
      }
      return groupMembersService.getJoinRequests({
        groupId,
        cursor: pageParam,
        sortOrder
      });
    },
    [filteredUserId, groupId, sortOrder]
  );

  return {
    queryKey,
    queryFn,
    getNextPageParam,
    getItemsFromDataPages,
    getUserFromItem
  };
};

interface UseJoinRequestsCountParams {
  groupId: number;
  enabled: boolean;
  staleTime?: number;
}

interface UseJoinRequestsCountResult {
  count: number;
  hasMore: boolean;
  displayText: string;
  showPill: boolean;
}

// Shares its cache entry with `useJoinRequestsQuery` (sortOrder=Desc, no
// filteredUserId): when the admin opens the Requests tab the InfiniteQueryList
// reuses the page already primed by the badge instead of refetching.
export const useJoinRequestsCount = ({
  groupId,
  enabled,
  staleTime
}: UseJoinRequestsCountParams): UseJoinRequestsCountResult => {
  const { data } = useInfiniteQuery({
    queryKey: getJoinRequestsQueryKey(groupId, { sortOrder: COUNT_DEFAULT_SORT_ORDER }),
    queryFn: () =>
      groupMembersService.getJoinRequests({ groupId, sortOrder: COUNT_DEFAULT_SORT_ORDER }),
    getNextPageParam,
    enabled,
    staleTime
  });

  const firstPage = data?.pages?.[0];
  const count = firstPage?.data.length ?? 0;
  const hasMore = Boolean(firstPage?.nextPageCursor);
  const displayText = formatJoinRequestCountText(count, hasMore);

  return {
    count,
    hasMore,
    displayText,
    showPill: count > 0
  };
};

export const useJoinRequestsQueryUpdates = ({
  groupId
}: {
  groupId: number;
}): {
  removeJoinRequest: (userId: number) => void;
} => {
  const queryClient = useQueryClient();
  const queryKeyPrefix = getJoinRequestsQueryKey(groupId);

  const removeJoinRequest = (userId: number) => {
    queryClient.setQueriesData(
      { queryKey: queryKeyPrefix },
      (oldData: InfiniteData<GetJoinRequestsResponse> | undefined) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map(page => ({
            ...page,
            data: page.data.filter((member: GroupJoinRequest) => member.requester.userId !== userId)
          }))
        };
      }
    );
  };

  return { removeJoinRequest };
};

export default useJoinRequestsQuery;
