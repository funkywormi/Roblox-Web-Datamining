import {
  GetNextPageParamFunction,
  InfiniteData,
  QueryFunction,
  QueryKey,
  useQueryClient
} from '@tanstack/react-query';
import { useCallback } from 'react';
import { GetBannedUsersResponse, GroupBan } from '../types';
import groupMembersService from '../services/groupMembersService';
import { User } from '../../shared/types';

interface UseBannedUsersQueryParams {
  groupId: number;
  filteredUserId?: number;
}

interface UseBannedUsersQueryResult {
  queryKey: QueryKey;
  queryFn: QueryFunction<GetBannedUsersResponse>;
  getNextPageParam: GetNextPageParamFunction<GetBannedUsersResponse>;
  getItemsFromDataPages: (data?: InfiniteData<GetBannedUsersResponse>) => Array<GroupBan>;
  getUserFromItem: (item: GroupBan) => User;
}

const getQueryKey = (groupId: number, userId?: number): QueryKey => [
  'group-banned-users',
  groupId,
  userId
];

const getNextPageParam = (lastPage: GetBannedUsersResponse) => lastPage.nextPageCursor;
const getUserFromItem = (item: GroupBan) => item.user;

const getItemsFromDataPages = (data?: InfiniteData<GetBannedUsersResponse>) => {
  if (!data?.pages) return [];
  const items: Array<GroupBan> = [];
  for (const page of data.pages) {
    items.push(...page.data);
  }
  return items;
};

const useBannedUsersQuery = ({
  groupId,
  filteredUserId
}: UseBannedUsersQueryParams): UseBannedUsersQueryResult => {
  const queryKey = getQueryKey(groupId, filteredUserId);

  const queryFn = useCallback(
    async ({ pageParam }: { pageParam?: string }) => {
      if (filteredUserId) {
        // maintain same data shape as paged response
        const bannedUser = await groupMembersService.getUserBannedFromGroup({
          groupId,
          userId: filteredUserId
        });
        return {
          data: bannedUser ? [bannedUser] : []
        };
      }
      return groupMembersService.getUsersBannedFromGroup({
        groupId,
        cursor: pageParam
      });
    },
    [filteredUserId, groupId]
  );

  return {
    queryKey,
    queryFn,
    getNextPageParam,
    getItemsFromDataPages,
    getUserFromItem
  };
};

export const useBannedUsersQueryUpdates = ({
  groupId
}: {
  groupId: number;
}): { removeBan: (userId: number) => void } => {
  const queryClient = useQueryClient();
  const queryKey = getQueryKey(groupId);

  const removeBan = useCallback(
    (userId: number) => {
      queryClient.setQueryData(
        queryKey,
        (oldData: InfiniteData<GetBannedUsersResponse> | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              data: page.data.filter((member: GroupBan) => member.user.userId !== userId)
            }))
          };
        }
      );
    },
    [queryClient, queryKey]
  );

  return { removeBan };
};

export default useBannedUsersQuery;
