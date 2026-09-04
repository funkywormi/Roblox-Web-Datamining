import type {
  AnalyticsContext,
  CollectionAnalyticsData,
  FilterPillsInputDataFilterGroup,
  ItemAnalyticsData,
  SduiPageContext,
} from "@rbx/sdui-core";
import {
  EventStreamMetadata,
  type TFilterImpressions,
} from "../../../common/constants/eventStreamConstants";
import { parseMaybeStringNumberField, parseStringField } from "../../utils/analyticsParsingUtils";
import { findAnalyticsFieldInAncestors } from "./findAnalyticsFieldInAncestors";
import {
  buildSessionAnalyticsData,
  getSessionInfoKey,
  resolvePageForReferral,
} from "./pageReferralUtils";

export const FILTER_PILL_ITEM_COMPONENT_TYPE = "FILTER_PILL";
export const FILTER_PILLS_CAROUSEL_COMPONENT_TYPE = "FILTER_PILLS_CAROUSEL";

type OptionWithContextTag = {
  optionId: string;
  optionContextTag?: string;
};

function getOptionContextTagOrZero(
  selectedOptionId: string | undefined,
  filterOptions: readonly OptionWithContextTag[],
): string {
  if (!selectedOptionId) {
    return "0";
  }
  const option = filterOptions.find(option => option.optionId === selectedOptionId);
  return option?.optionContextTag !== "" ? (option?.optionContextTag ?? "0") : "0";
}

export function buildFilterPillsCollectionAnalyticsData(
  analyticsContext: AnalyticsContext | undefined,
  filterGroupCount: number,
  pageSessionInfo: string,
  pageContext: SduiPageContext,
): CollectionAnalyticsData {
  return {
    collectionId: parseMaybeStringNumberField(
      findAnalyticsFieldInAncestors("collectionId", analyticsContext, -1),
      -1,
    ),
    contentType: "Game",
    itemsPerRow: filterGroupCount,
    collectionPosition: parseMaybeStringNumberField(
      findAnalyticsFieldInAncestors("collectionPosition", analyticsContext, -1),
      -1,
    ),
    totalNumberOfItems: filterGroupCount,
    collectionComponentType: FILTER_PILLS_CAROUSEL_COMPONENT_TYPE,
    gameSetTargetId: parseMaybeStringNumberField(
      findAnalyticsFieldInAncestors("gameSetTargetId", analyticsContext, 0),
      0,
    ),
    ...buildSessionAnalyticsData(pageSessionInfo, pageContext),
  };
}

export function buildFilterPillItemAnalyticsData(
  filterGroup: FilterPillsInputDataFilterGroup,
  index: number,
): ItemAnalyticsData {
  return {
    id: filterGroup.filterId,
    itemPosition: index + 1,
    itemComponentType: FILTER_PILL_ITEM_COMPONENT_TYPE,
    filterId: filterGroup.filterId,
    selectedOptionId: filterGroup.selectedOptionId,
    selectedOptionContextTag: getOptionContextTagOrZero(
      filterGroup.selectedOptionId,
      filterGroup.options,
    ),
  };
}

export type BuildFilterImpressionParamsArgs = {
  impressionIndexes: number[];
  itemAnalyticsDatas: ReadonlyArray<ItemAnalyticsData | null | undefined>;
  collectionAnalyticsData: CollectionAnalyticsData;
  pageContext: SduiPageContext;
};

export function buildFilterImpressionParams({
  impressionIndexes,
  itemAnalyticsDatas,
  collectionAnalyticsData,
  pageContext,
}: BuildFilterImpressionParamsArgs): TFilterImpressions {
  const sessionInfoKey = getSessionInfoKey(pageContext) ?? "";
  const pageSessionInfo = parseStringField(collectionAnalyticsData[sessionInfoKey], "");
  const gameSetTargetId = parseMaybeStringNumberField(collectionAnalyticsData.gameSetTargetId, 0);

  return {
    [EventStreamMetadata.AbsPositions]: impressionIndexes,
    [EventStreamMetadata.FilterIds]: impressionIndexes.map(index =>
      parseStringField(itemAnalyticsDatas[index]?.filterId ?? itemAnalyticsDatas[index]?.id, ""),
    ),
    [EventStreamMetadata.SelectedOptionIds]: impressionIndexes.map(index =>
      parseStringField(itemAnalyticsDatas[index]?.selectedOptionId, ""),
    ),
    [EventStreamMetadata.SelectedOptionContextTags]: impressionIndexes.map(index =>
      parseStringField(itemAnalyticsDatas[index]?.selectedOptionContextTag, "0"),
    ),
    [EventStreamMetadata.GameSetTypeId]: collectionAnalyticsData.collectionId,
    ...(gameSetTargetId > 0 && {
      [EventStreamMetadata.GameSetTargetId]: gameSetTargetId,
    }),
    [EventStreamMetadata.SortPos]:
      collectionAnalyticsData.collectionPosition >= 0
        ? collectionAnalyticsData.collectionPosition - 1
        : -1,
    [EventStreamMetadata.Page]: resolvePageForReferral(pageContext),
    ...buildSessionAnalyticsData(pageSessionInfo, pageContext),
  };
}
