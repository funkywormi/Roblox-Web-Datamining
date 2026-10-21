"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, parseUserId, type UserId } from "@rbx/www-common/user";
import { requestFriendshipStatus } from "./friendshipStatusBatcher";
import type { FriendshipStatus } from "./friendshipStatus";

const FRIENDSHIP_STATUS_QUERY_KEY = "discovery-common/friendship-status";

export const friendshipStatusQueryKey = (viewerUserId: UserId, targetUserId: UserId) =>
  [FRIENDSHIP_STATUS_QUERY_KEY, viewerUserId, targetUserId] as const;

type UseFriendshipStatusResult = {
  friendshipStatus: FriendshipStatus | undefined;
  isFriendshipStatusLoading: boolean;
  isSelf: boolean;
  targetUserId: UserId | null;
  viewerUserId: UserId | undefined;
};

export function useFriendshipStatus(userId: string | undefined): UseFriendshipStatusResult {
  const viewerUserId = getCurrentUser()?.id;
  const targetUserId = userId == null ? null : parseUserId(userId.trim());
  const isSelf = viewerUserId != null && viewerUserId === targetUserId;
  const canFetchFriendshipStatus = viewerUserId != null && targetUserId != null && !isSelf;

  const friendshipStatusQuery = useQuery({
    queryKey:
      viewerUserId != null && targetUserId != null
        ? friendshipStatusQueryKey(viewerUserId, targetUserId)
        : ([FRIENDSHIP_STATUS_QUERY_KEY, "unavailable", userId] as const),
    queryFn: () => {
      if (viewerUserId == null || targetUserId == null) {
        return Promise.reject(new Error("Friendship status requires valid viewer and target IDs"));
      }
      return requestFriendshipStatus(viewerUserId, targetUserId);
    },
    enabled: canFetchFriendshipStatus,
    staleTime: Infinity,
  });

  return {
    friendshipStatus: friendshipStatusQuery.data,
    isFriendshipStatusLoading: friendshipStatusQuery.isFetching,
    isSelf,
    targetUserId,
    viewerUserId,
  };
}
