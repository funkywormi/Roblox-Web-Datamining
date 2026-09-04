import { mergeEventParamsWithAnalyticsData } from "../../common/utils/analyticsDataUtils";
import {
  EventStreamMetadata,
  type TCarouselGameImpressions,
} from "../../common/constants/eventStreamConstants";
import type {
  TGameImpressionsEventSponsoredAdData,
  TGameImpressionsEventTileBadgeContextsData,
  TGameImpressionsEventThumbnailIdData,
} from "../../common/utils/parsingUtils";
import type {
  TAnalyticsData,
  TCollectionAnalyticsData,
  TSduiPageContext,
} from "../system/SduiTypes";
import {
  buildSessionAnalyticsData,
  getSessionInfoKey,
  parseBooleanField,
  parseMaybeStringNumberField,
  parseStringField,
} from "./analyticsParsingUtils";
import { buildSduiGameImpressionsAnalyticsData } from "./sduiGameImpressionsAnalyticsDataUtils";

// Accepts both the V1 (`TItemAnalyticsData[]`) and V2 (`(ItemAnalyticsData | null)[]`)
// item shapes.
type TItemAnalyticsDatas = ReadonlyArray<TAnalyticsData | null | undefined>;

const getThumbnailPersonalizationData = (
  useGridTiles: boolean,
  impressionIndexes: number[],
  itemAnalyticsDatas: TItemAnalyticsDatas,
): TGameImpressionsEventThumbnailIdData | Record<string, never> => {
  if (!useGridTiles) {
    return {};
  }

  return {
    [EventStreamMetadata.ThumbnailAssetIds]: impressionIndexes.map(index =>
      parseStringField(itemAnalyticsDatas[index]?.thumbnailAssetId, "0"),
    ),
    [EventStreamMetadata.ThumbnailListIds]: impressionIndexes.map(index =>
      parseStringField(itemAnalyticsDatas[index]?.thumbnailListId, "0"),
    ),
  };
};

const getTileBadgeData = (
  impressionIndexes: number[],
  itemAnalyticsDatas: TItemAnalyticsDatas,
): TGameImpressionsEventTileBadgeContextsData => ({
  [EventStreamMetadata.TileBadgeContexts]: impressionIndexes.map(index =>
    parseStringField(itemAnalyticsDatas[index]?.tileBadgeIds, "0"),
  ),
});

const getSponsoredAdData = (
  impressionIndexes: number[],
  itemAnalyticsDatas: TItemAnalyticsDatas,
  pageContext: TSduiPageContext,
): TGameImpressionsEventSponsoredAdData | Record<string, never> => {
  const adFlags = impressionIndexes.map(index =>
    parseBooleanField(itemAnalyticsDatas[index]?.adFlag, false, pageContext) === true ? 1 : 0,
  );

  if (!adFlags.some(adFlag => adFlag === 1)) {
    return {};
  }

  return {
    [EventStreamMetadata.AdsPositions]: adFlags,
    [EventStreamMetadata.AdFlags]: adFlags,
    [EventStreamMetadata.AdIds]: impressionIndexes.map(index =>
      parseStringField(itemAnalyticsDatas[index]?.adId, "0"),
    ),
  };
};

export type TBuildGameImpressionParamsArgs = {
  impressionIndexes: number[];
  itemAnalyticsDatas: TItemAnalyticsDatas;
  collectionAnalyticsData: TCollectionAnalyticsData;
  pageContext: TSduiPageContext;
  useGridTiles: boolean;
  componentTypeFallback: string;
};

export type TGameImpressionParams = TCarouselGameImpressions & Record<string, string | string[]>;

/**
 * Builds the event-stream `gameImpressions` payload shared by the V1
 * (`sendGameImpressionsFromSdui`) and V2 (`sduiGameImpressionsHandler`) paths.
 *
 */
export const buildGameImpressionParams = ({
  impressionIndexes,
  itemAnalyticsDatas,
  collectionAnalyticsData,
  pageContext,
  useGridTiles,
  componentTypeFallback,
}: TBuildGameImpressionParamsArgs): TGameImpressionParams => {
  const sessionInfoKey = getSessionInfoKey(pageContext) ?? "";
  const pageSessionInfo = parseStringField(collectionAnalyticsData[sessionInfoKey], "");

  const firstIndex = impressionIndexes[0];
  const itemComponentType =
    firstIndex !== undefined
      ? parseStringField(itemAnalyticsDatas[firstIndex]?.itemComponentType, componentTypeFallback)
      : componentTypeFallback;

  const knownParams: TCarouselGameImpressions = {
    [EventStreamMetadata.RootPlaceIds]: impressionIndexes.map(index =>
      parseMaybeStringNumberField(itemAnalyticsDatas[index]?.placeId, -1),
    ),
    [EventStreamMetadata.UniverseIds]: impressionIndexes.map(index =>
      parseMaybeStringNumberField(itemAnalyticsDatas[index]?.universeId, -1),
    ),
    ...getThumbnailPersonalizationData(useGridTiles, impressionIndexes, itemAnalyticsDatas),
    ...getTileBadgeData(impressionIndexes, itemAnalyticsDatas),
    ...getSponsoredAdData(impressionIndexes, itemAnalyticsDatas, pageContext),
    [EventStreamMetadata.NavigationUids]: impressionIndexes.map(index =>
      parseStringField(itemAnalyticsDatas[index]?.navigationUniverseId, "0"),
    ),
    [EventStreamMetadata.AbsPositions]: impressionIndexes,
    [EventStreamMetadata.SortPos]:
      // Decremented since server collectionPosition will be 1-indexed for Lua
      collectionAnalyticsData.collectionPosition >= 0
        ? collectionAnalyticsData.collectionPosition - 1
        : -1,
    [EventStreamMetadata.ComponentType]: itemComponentType,
    [EventStreamMetadata.GameSetTypeId]: collectionAnalyticsData.collectionId ?? -1,
    [EventStreamMetadata.GameSetTargetId]: parseMaybeStringNumberField(
      collectionAnalyticsData.gameSetTargetId,
      -1,
    ),
    [EventStreamMetadata.Page]: pageContext.pageName,
    ...buildSessionAnalyticsData(pageSessionInfo, pageContext),
  };

  const dynamicAnalyticsData = buildSduiGameImpressionsAnalyticsData(
    impressionIndexes,
    itemAnalyticsDatas,
    collectionAnalyticsData,
  );

  return mergeEventParamsWithAnalyticsData(knownParams, dynamicAnalyticsData);
};
