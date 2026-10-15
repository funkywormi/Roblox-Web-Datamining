import { useCallback, useEffect, useMemo, useState } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import RealTime from "@rbx/core-scripts/realtime";
import {
  getTrustedFriendRequests,
  getTrustedFriendRequestsCount,
  ignoreAllTrustedFriendRequests,
  ignoreTrustedFriendRequest,
  trustedFriendRequestsCountQueryKey,
  trustedFriendRequestsListQueryKey,
  type TrustedFriendRequestItem,
} from "@rbx/friends-common";

const TRUSTED_CONNECTION_NOTIFICATIONS = "TrustedConnectionNotifications";
const START_PAGE = 1;
const UI_PAGE_SIZE = 3;
const SERVER_PAGE_SIZE = 10;
const DEFAULT_ACTION_ERROR = "Message.DefaultError";

type UseTrustedFriendRequestsResult = {
  count: number;
  pageRequests: TrustedFriendRequestItem[];
  isLoading: boolean;
  isError: boolean;
  currentPage: number;
  showPagination: boolean;
  hasNextPage: boolean;
  goToPage: (page: number) => void;
  ignoreRequest: (senderId: number) => void;
  ignoreAllRequests: () => void;
  ignoringSenderId: number | null;
  isIgnoringAll: boolean;
  isActionsBusy: boolean;
  actionError: string | null;
  clearActionError: () => void;
  refresh: () => Promise<void>;
};

const useTrustedFriendRequests = (): UseTrustedFriendRequestsResult => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(START_PAGE);
  const [actionError, setActionError] = useState<string | null>(null);

  const listQuery = useInfiniteQuery({
    queryKey: trustedFriendRequestsListQueryKey,
    queryFn: ({ pageParam }) =>
      getTrustedFriendRequests({
        limit: SERVER_PAGE_SIZE,
        cursor: typeof pageParam === "string" ? pageParam : undefined,
      }),
    getNextPageParam: lastPage => lastPage.nextPageExclusiveStartKey ?? undefined,
  });

  const { fetchNextPage, hasNextPage: listHasNextPage, isFetchingNextPage } = listQuery;

  const countQuery = useQuery({
    queryKey: trustedFriendRequestsCountQueryKey,
    queryFn: getTrustedFriendRequestsCount,
  });

  const allRequests = useMemo(
    () => (listQuery.data?.pages ?? []).flatMap(page => page.data),
    [listQuery.data],
  );

  const refresh = useCallback(async () => {
    setCurrentPage(START_PAGE);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: trustedFriendRequestsListQueryKey }),
      queryClient.invalidateQueries({ queryKey: trustedFriendRequestsCountQueryKey }),
    ]);
  }, [queryClient]);

  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

  const ignoreMutation = useMutation({
    mutationFn: ignoreTrustedFriendRequest,
    onSuccess: async () => {
      setActionError(null);
      await refresh();
    },
    onError: () => {
      setActionError(DEFAULT_ACTION_ERROR);
    },
  });

  const ignoreAllMutation = useMutation({
    mutationFn: ignoreAllTrustedFriendRequests,
    onSuccess: async () => {
      setActionError(null);
      await refresh();
    },
    onError: () => {
      setActionError(DEFAULT_ACTION_ERROR);
    },
  });

  const isActionsBusy = ignoreMutation.isPending || ignoreAllMutation.isPending;

  useEffect(() => {
    const handleTrustedConnectionEvent = () => {
      refresh().catch(() => undefined);
    };

    const realTimeClient = RealTime.GetClient();
    realTimeClient.Subscribe(TRUSTED_CONNECTION_NOTIFICATIONS, handleTrustedConnectionEvent);

    return () => {
      realTimeClient.Unsubscribe(TRUSTED_CONNECTION_NOTIFICATIONS, handleTrustedConnectionEvent);
    };
  }, [refresh]);

  const count = countQuery.data ?? allRequests.length;
  const pageCount = Math.max(Math.ceil(count / UI_PAGE_SIZE), 1);

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount);
    }
  }, [currentPage, pageCount]);

  const pageRequests = useMemo(
    () => allRequests.slice((currentPage - 1) * UI_PAGE_SIZE, currentPage * UI_PAGE_SIZE),
    [allRequests, currentPage],
  );

  const hasNextPage = currentPage < pageCount || listHasNextPage === true;
  const showPagination = listHasNextPage === true || count > UI_PAGE_SIZE;

  const goToPage = useCallback(
    (newPage: number) => {
      if (isFetchingNextPage) {
        return;
      }

      const neededCount = newPage * UI_PAGE_SIZE;
      const needsMoreData =
        newPage > currentPage && neededCount > allRequests.length && listHasNextPage;

      if (!needsMoreData) {
        setCurrentPage(newPage);
        return;
      }

      fetchNextPage()
        .then(result => {
          if (result.isError) {
            setActionError(DEFAULT_ACTION_ERROR);
            return;
          }
          setActionError(null);
          setCurrentPage(newPage);
        })
        .catch(() => {
          setActionError(DEFAULT_ACTION_ERROR);
        });
    },
    [allRequests.length, currentPage, fetchNextPage, isFetchingNextPage, listHasNextPage],
  );

  const ignoreRequest = useCallback(
    (senderId: number) => {
      if (isActionsBusy) {
        return;
      }
      ignoreMutation.mutate(senderId);
    },
    [ignoreMutation, isActionsBusy],
  );

  const ignoreAllRequests = useCallback(() => {
    if (isActionsBusy) {
      return;
    }
    ignoreAllMutation.mutate();
  }, [ignoreAllMutation, isActionsBusy]);

  const ignoringSenderId =
    ignoreMutation.isPending && typeof ignoreMutation.variables === "number"
      ? ignoreMutation.variables
      : null;

  return {
    count,
    pageRequests,
    isLoading: listQuery.isLoading || countQuery.isLoading,
    isError: listQuery.isError || countQuery.isError,
    currentPage,
    showPagination,
    hasNextPage,
    goToPage,
    ignoreRequest,
    ignoreAllRequests,
    ignoringSenderId,
    isIgnoringAll: ignoreAllMutation.isPending,
    isActionsBusy,
    actionError,
    clearActionError,
    refresh,
  };
};

export default useTrustedFriendRequests;
