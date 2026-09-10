import environmentUrls from "@rbx/environment-urls";
import chatHttpTransport from "./chatHttpTransport";
import type { TMultiProfileInsightsResponse, TProfileInsight } from "../types/api";

// The React environmentUrls has no `profileInsightsApi` key, so use the apiGatewayUrl route the
// legacy chat falls back to. Ranking strategy "tc_info_boost" surfaces trusted-connection insights.
const PROFILE_INSIGHTS_BASE_URL = `${environmentUrls.apiGatewayUrl}/profile-insights-api`;

export const getProfileInsights = async (
  userId: number,
  rankingStrategy = "tc_info_boost",
): Promise<TProfileInsight[]> => {
  const body = await chatHttpTransport.post<TMultiProfileInsightsResponse>(
    {
      url: `${PROFILE_INSIGHTS_BASE_URL}/v1/multiProfileInsights`,
      retryable: true,
      withCredentials: true,
    },
    { userIds: [userId], rankingStrategy },
  );
  const userInsights = body.userInsights ?? [];
  return userInsights.find(insight => insight.targetUser === userId)?.profileInsights ?? [];
};
