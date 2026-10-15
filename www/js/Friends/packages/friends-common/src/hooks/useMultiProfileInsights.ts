import { useMemo, useRef } from "react";
import { useQueries } from "@tanstack/react-query";
import type { ProfileInsightJson } from "../constants/profileInsightsTypes";
import { requestMultiProfileInsights } from "../services/multiProfileInsightsBatcher";

const DEFAULT_STALE_TIME = 5 * 60 * 1000;

export const multiProfileInsightsQueryKeys = {
  all: () => ["multiProfileInsightsBatch"] as const,
  user: (userId: number) => [...multiProfileInsightsQueryKeys.all(), userId] as const,
};

export type UseMultiProfileInsightsResult = {
  /** Raw profile insights keyed by target user id. */
  data: Record<number, ProfileInsightJson[]>;
  isLoading: boolean;
};

/**
 * Per-user React Query cache for multiProfileInsights.
 * Concurrent callers coalesce into a single batched HTTP request via
 * {@link requestMultiProfileInsights}.
 */
export const useMultiProfileInsights = (
  userIds: readonly number[],
  {
    enabled = true,
    staleTime = DEFAULT_STALE_TIME,
  }: { enabled?: boolean; staleTime?: number } = {},
): UseMultiProfileInsightsResult => {
  const uniqueIds = useMemo(() => [...new Set(userIds)], [userIds]);

  const results = useQueries({
    queries: uniqueIds.map(userId => ({
      queryKey: multiProfileInsightsQueryKeys.user(userId),
      queryFn: () => requestMultiProfileInsights(userId),
      enabled: enabled && uniqueIds.length > 0,
      staleTime,
    })),
  });

  const insights = results.map(result => result.data);
  const cache = useRef<{
    insights: (ProfileInsightJson[] | undefined)[];
    data: Record<number, ProfileInsightJson[]>;
  } | null>(null);
  if (
    cache.current?.insights.length !== insights.length ||
    cache.current.insights.some((entry, i) => entry !== insights[i])
  ) {
    const data: Record<number, ProfileInsightJson[]> = {};
    uniqueIds.forEach((userId, i) => {
      const entry = insights[i];
      if (entry != null) {
        data[userId] = entry;
      }
    });
    cache.current = { insights, data };
  }

  const isLoading =
    enabled &&
    uniqueIds.length > 0 &&
    results.some(result => result.data === undefined && result.status !== "error");

  return { data: cache.current.data, isLoading };
};
