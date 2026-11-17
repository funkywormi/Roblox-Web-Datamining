"use client";

import { useQuery } from "@tanstack/react-query";
import {
  requestMultiProfileInsightsProfileInfoBoost,
  type ProfileInsightJson,
} from "@rbx/friends-common/profile-insights";

const USER_SEARCH_PROFILE_INSIGHTS_QUERY_KEY = "discovery-common/user-search-profile-insights";

export function useUserSearchProfileInsights(targetUserId: number): ProfileInsightJson[] {
  const profileInsightsQuery = useQuery({
    queryKey: [USER_SEARCH_PROFILE_INSIGHTS_QUERY_KEY, targetUserId],
    queryFn: () => requestMultiProfileInsightsProfileInfoBoost(targetUserId),
    staleTime: 5 * 60 * 1000,
  });

  return profileInsightsQuery.data ?? [];
}
