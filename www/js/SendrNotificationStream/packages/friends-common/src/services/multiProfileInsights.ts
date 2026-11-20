import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-scripts/http";
import type { UrlConfig } from "@rbx/core-scripts/http";
import type { ProfileInsightJson } from "../constants/profileInsightsTypes";

export type MultiProfileInsightsResponse = {
  userInsights?: {
    targetUser?: number;
    profileInsights?: ProfileInsightJson[] | null;
  }[];
};

export type MultiProfileInsightsOptions = {
  count?: number;
  rankingStrategy?: "profile_info_boost" | "tc_info_boost";
};

export async function fetchMultiProfileInsights(
  userIds: number | number[],
  { rankingStrategy = "tc_info_boost", count = 8 }: MultiProfileInsightsOptions = {},
): Promise<MultiProfileInsightsResponse> {
  const ids = Array.isArray(userIds) ? userIds : [userIds];
  if (ids.length === 0) {
    return { userInsights: [] };
  }

  const urlConfig: UrlConfig = {
    url: `${environmentUrls.apiGatewayUrl}/profile-insights-api/v1/multiProfileInsights`,
    retryable: true,
    withCredentials: true,
  };
  const { data } = await http.post<MultiProfileInsightsResponse>(urlConfig, {
    userIds: ids,
    rankingStrategy,
    count,
  });
  return data;
}
