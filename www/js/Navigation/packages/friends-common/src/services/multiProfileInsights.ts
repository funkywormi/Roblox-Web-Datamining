import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-scripts/http";
import type { UrlConfig } from "@rbx/core-scripts/http";
import type { ProfileInsightJson } from "../constants/profileInsightsTypes";

type MultiProfileInsightsResponse = {
  userInsights?: {
    targetUser?: number;
    profileInsights?: ProfileInsightJson[] | null;
  }[];
};

export async function fetchMultiProfileInsights(
  userId: number,
): Promise<MultiProfileInsightsResponse> {
  const urlConfig: UrlConfig = {
    url: `${environmentUrls.apiGatewayUrl}/profile-insights-api/v1/multiProfileInsights`,
    retryable: true,
    withCredentials: true,
  };
  const { data } = await http.post<MultiProfileInsightsResponse>(urlConfig, {
    userIds: [userId],
    rankingStrategy: "tc_info_boost",
    count: 8,
  });
  return data;
}
