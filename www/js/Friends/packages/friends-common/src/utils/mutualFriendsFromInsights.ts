import type { ProfileInsightJson } from "../constants/profileInsightsTypes";
import type { MultiProfileInsightsResponse } from "../services/multiProfileInsights";

export function getMutualFriendDisplayNames(
  insights: ProfileInsightJson[] | null | undefined,
): string[] {
  if (!insights?.length) {
    return [];
  }

  for (const insight of insights) {
    const mutualFriends = insight.mutualFriendInsight?.mutualFriends;
    if (!mutualFriends) {
      continue;
    }

    return Object.values(mutualFriends)
      .map(friend => friend.displayName ?? friend.username ?? "")
      .filter(name => name.length > 0);
  }

  return [];
}

export function getMutualFriendsByUserId(
  response: MultiProfileInsightsResponse | undefined,
): Record<number, string[]> {
  const result: Record<number, string[]> = {};
  for (const entry of response?.userInsights ?? []) {
    if (entry.targetUser == null) {
      continue;
    }
    result[entry.targetUser] = getMutualFriendDisplayNames(entry.profileInsights);
  }
  return result;
}
