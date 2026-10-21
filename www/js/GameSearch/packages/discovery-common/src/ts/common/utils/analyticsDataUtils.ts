import { TOmniRecommendationAnalyticsData } from "../types/analyticsTypes";
import {
  ANALYTICS_ARRAY_KEY_SUFFIX,
  ANALYTICS_DATA_KEY_SUFFIX,
} from "../constants/analyticsConstants";

/**
 * Transforms the analytics data for a single tile into event properties by merging
 * sort-level and item-level data, then suffixing each key with `_analyticsData`.
 * Item-level analytics takes precedence over sort-level analytics for the same key.
 *
 * Since the fields in analytics data are dynamic, we can't set a pre-defined list
 * of keys to read from query params. So we use the suffix in a query param to
 * indicate that it needs to be handled.
 *
 * @example analyticsData: { sortLevel: { sortId: "xyz" }, itemLevel: { 1: { sourceId: "abc" } } }
 *          buildOmniRecommendationTileAnalyticsData(1, analyticsData)
 *          returns: { sortId_analyticsData: "xyz", sourceId_analyticsData: "abc" }
 */
export const buildOmniRecommendationTileAnalyticsData = (
  universeId: number,
  analyticsData: TOmniRecommendationAnalyticsData,
): Record<string, string> => {
  const merged: Record<string, string> = {
    // Sort-level comes first because item-level should override for the same key
    ...analyticsData.sortLevel,
    ...(analyticsData.itemLevel[universeId] ?? {}),
  };

  const result: Record<string, string> = {};
  Object.entries(merged).forEach(([key, value]) => {
    result[`${key}${ANALYTICS_DATA_KEY_SUFFIX}`] = value;
  });
  return result;
};

/**
 * Merges scalar collection-/sort-level analytics with item-level values
 * aggregated into `{key}_arr` arrays aligned to `itemDataList` order.
 * Missing item keys are filled with `missingValue` (default `"0"`).
 *
 * Shared by omni-recommendation and SDUI gameImpressions builders.
 */
export const buildAnalyticsDataWithItemArrAggregation = (
  sortLevel: Record<string, string>,
  itemDataList: ReadonlyArray<Record<string, string>>,
  missingValue = "0",
): Record<string, string | string[]> => {
  const itemKeys = new Set(itemDataList.flatMap(data => Object.keys(data)));

  const itemResult: Record<string, string[]> = {};
  itemKeys.forEach(key => {
    itemResult[`${key}${ANALYTICS_ARRAY_KEY_SUFFIX}`] = itemDataList.map(
      data => data[key] ?? missingValue,
    );
  });

  return {
    // Sort-/collection-level comes first so item-level `_arr` keys can coexist
    // with the same bare key when both levels define it.
    ...sortLevel,
    ...itemResult,
  };
};

/**
 * Builds analytics data for game impression events. Sort-level data stays scalar.
 * Item-level data is aggregated into per-key arrays (suffixed with `_arr`).
 *
 * If an item-level key exists for one universe but not another, "0" is used as
 * the default in the missing universe's position. Note that this is only
 * relevant for viewed universes. If there are 3 total universes, 2 of them are
 * viewed, and the 1 non-viewed universe has a property that is not present in
 * the other 2, this property is not included in the returned object
 *
 * @example analyticsData: {
 *            sortLevel: { sortKey: "xyz" },
 *            itemLevel: { 1: { b: "item_a" }, 2: { c: "item_b" } }
 *          }
 *          viewedUniverseIds: [1, 2]
 *          returns: { sortKey: "xyz", b_arr: ["item_a", "0"], c_arr: ["0", "item_b"] }
 */
export const buildOmniRecommendationGameImpressionsAnalyticsData = (
  viewedUniverseIds: number[],
  analyticsData: TOmniRecommendationAnalyticsData,
): Record<string, string | string[]> => {
  const itemDataList = viewedUniverseIds.map(id => analyticsData.itemLevel[id] ?? {});
  return buildAnalyticsDataWithItemArrAggregation(analyticsData.sortLevel, itemDataList);
};

/**
 * Filters analytics data params to only include string values, discarding arrays.
 * The API contract guarantees analyticsData values are strings, but query-string
 * parsing can produce string[] if a user modifies the URL
 */
export const filterAnalyticsDataQueryParams = (
  params: Record<string, string | string[]>,
): Record<string, string> => {
  const result: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string") {
      result[key] = value;
    }
  });
  return result;
};

/**
 * Merges event params with analytics data. If there are overlapping keys, the event params will take precedence.
 */
export const mergeEventParamsWithAnalyticsData = <
  T extends Record<string, unknown>,
  U extends Record<string, string | string[]>,
>(
  eventParams: T,
  analyticsData: U,
): U & T => ({ ...analyticsData, ...eventParams });
