import { batchQuery } from "@rbx/core-lib/promise";
import type { ProfileInsightJson } from "../constants/profileInsightsTypes";
import {
  fetchMultiProfileInsights,
  type MultiProfileInsightsResponse,
} from "./multiProfileInsights";

const BATCH_DELAY_MS = 10;
// multiProfileInsights accepts large id lists; keep batches modest for payload size.
const MAX_BATCH_SIZE = 50;

const extractProfileInsightsForUser = (
  response: MultiProfileInsightsResponse,
  userId: number,
): ProfileInsightJson[] => {
  const entry = response.userInsights?.find(insight => insight.targetUser === userId);
  return entry?.profileInsights ?? [];
};

/**
 * Coalesces concurrent per-user multiProfileInsights lookups into one HTTP call
 * (same tick / short delay). Resolves to that user's `profileInsights` array.
 */
export const requestMultiProfileInsights = batchQuery(
  { delay: BATCH_DELAY_MS, maxSize: MAX_BATCH_SIZE },
  (userIds: number[]) => fetchMultiProfileInsights(userIds),
  extractProfileInsightsForUser,
);

export const requestMultiProfileInsightsProfileInfoBoost = batchQuery(
  { delay: BATCH_DELAY_MS, maxSize: MAX_BATCH_SIZE },
  (userIds: number[]) =>
    fetchMultiProfileInsights(userIds, {
      rankingStrategy: "profile_info_boost",
      count: 3,
    }),
  extractProfileInsightsForUser,
);
