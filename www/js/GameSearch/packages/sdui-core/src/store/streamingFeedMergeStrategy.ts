import type { SduiInputDataMergeStrategyResolver } from "../types";

/**
 * EntryMap is shallow-merged so new entries overwrite matching keys while preserving unmentioned entries,
 * and entryOrder is merged by index so a partial chunk does not replace the full order.
 */
export const streamingFeedMergeStrategy: SduiInputDataMergeStrategyResolver = path => {
  if (path.length === 1 && (path[0] === "entryMap" || path[0] === "entryOrder")) {
    return "merge";
  }
  return undefined;
};
