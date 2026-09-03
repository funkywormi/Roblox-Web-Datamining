import { buildAnalyticsDataWithItemArrAggregation } from "../../common/utils/analyticsDataUtils";

type TAnalyticsRecord = Record<string, unknown> | null | undefined;
type TItemAnalyticsDatas = ReadonlyArray<TAnalyticsRecord>;

/**
 * Keeps string keys with string/number/boolean values and stringifies them
 * (including empty strings). Drops nested objects, arrays, null, and undefined.
 * Matches lua-apps `SduiGameImpressionsHandler.filterAndStringifyAnalyticsData`.
 */
export const filterAndStringifyAnalyticsData = (data: TAnalyticsRecord): Record<string, string> => {
  if (!data || typeof data !== "object") {
    return {};
  }

  const result: Record<string, string> = {};

  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      result[key] = String(value);
    }
  });

  return result;
};

/**
 * Builds dynamic analytics fields for SDUI `gameImpressions`:
 * - collection scalars pass through as-is (e.g. `selectedOption`)
 * - item scalars aggregate into `{key}_arr` aligned to impressionIndexes
 */
export const buildSduiGameImpressionsAnalyticsData = (
  impressionIndexes: number[],
  itemAnalyticsDatas: TItemAnalyticsDatas,
  collectionAnalyticsData: Record<string, unknown>,
): Record<string, string | string[]> => {
  const sortLevel = filterAndStringifyAnalyticsData(collectionAnalyticsData);
  const itemDataList = impressionIndexes.map(index =>
    filterAndStringifyAnalyticsData(itemAnalyticsDatas[index]),
  );

  return buildAnalyticsDataWithItemArrAggregation(sortLevel, itemDataList);
};
