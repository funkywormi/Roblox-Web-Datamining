"use client";

import { useQuery } from "@tanstack/react-query";
import { requestIsUserBlocked } from "@rbx/friends-common/user-blocking";
import type { UserId } from "@rbx/www-common/user";

const USER_BLOCK_STATUS_QUERY_KEY = "discovery-common/user-block-status";

export function useUserBlockStatus({
  targetUserId,
  viewerUserId,
}: {
  targetUserId: number;
  viewerUserId: UserId;
}): boolean {
  const enabled = Number(viewerUserId) !== targetUserId;
  const blockStatusQuery = useQuery({
    queryKey: [USER_BLOCK_STATUS_QUERY_KEY, viewerUserId, targetUserId],
    queryFn: () => requestIsUserBlocked(targetUserId),
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  return blockStatusQuery.data === true;
}
