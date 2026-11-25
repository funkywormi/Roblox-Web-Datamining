"use client";

import { useQuery } from "@tanstack/react-query";
import { requestFollowingStatus } from "../followingService";

const FOLLOWING_STATUS_QUERY_KEY = "discovery-common/following-status";

export function useFollowingStatus(targetUserId: number): boolean {
  const followingStatusQuery = useQuery({
    queryKey: [FOLLOWING_STATUS_QUERY_KEY, targetUserId],
    queryFn: () => requestFollowingStatus(targetUserId),
    staleTime: Infinity,
  });

  return followingStatusQuery.data === true;
}
