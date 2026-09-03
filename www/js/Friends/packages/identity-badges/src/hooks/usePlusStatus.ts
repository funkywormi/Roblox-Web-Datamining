import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { requestPlusStatus } from "../services/plusStatusBatcher";
import type { PlusStatusByUserId } from "../services/plusStatusService";
import { useIsPlusBadgeEnabled } from "./useIsPlusBadgeEnabled";

const PER_USER_QUERY_KEY = "identity-badges/plusStatus/byUser";

const perUserQueryKey = (userId: number) => [PER_USER_QUERY_KEY, userId] as const;

export const usePlusStatus = (
  userIds: readonly number[],
): { data: PlusStatusByUserId; isLoading: boolean } => {
  const enabled = useIsPlusBadgeEnabled();

  const dedupedIds = useMemo(() => [...new Set(userIds)].sort((a, b) => a - b), [userIds]);

  // One react-query entry per user. The microtask coalescer in
  // plusStatusBatcher batches concurrent ids that miss cache into a single
  // fetchPlusStatusForUsers HTTP call, so subset/superset id sets reuse the
  // per-user cache and grown id sets fetch only the new ids.
  // staleTime: Infinity — Plus status only refreshes on full page load. This
  // hook is for cosmetic badging; do not gate features on it.
  const results = useQueries({
    queries: dedupedIds.map(id => ({
      queryKey: perUserQueryKey(id),
      queryFn: () => requestPlusStatus(id),
      enabled,
      staleTime: Infinity,
    })),
  });

  const data: PlusStatusByUserId = {};
  let isLoading = false;
  dedupedIds.forEach((id, i) => {
    data[id] = results[i]?.data === true;
    if (results[i]?.isFetching) {
      isLoading = true;
    }
  });

  return { data, isLoading };
};

export default usePlusStatus;
