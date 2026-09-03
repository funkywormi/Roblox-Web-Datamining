import { EventContext, parseEventParams } from "@rbx/unified-logging";
import { sendEvent } from "@rbx/core-scripts/event-stream";
import { homePage } from "../../common/constants/configConstants";
import { SessionInfoType } from "../../common/constants/eventStreamConstants";
import { TOmniRecommendationSort } from "../../common/types/bedev2Types";
import {
  isGameSortFromOmniRecommendations,
  isOmniRecommendationSduiSort,
} from "../../omniFeed/utils/gameSortUtils";
import {
  TOmniRecommendationSduiTree,
  TSduiPageContext,
  TServerDrivenComponentConfig,
} from "../system/SduiTypes";
import { getEventContext } from "./analyticsParsingUtils";
import { TGetOmniRecommendationsResponse } from "../../common/services/bedev2Services";

const ERROR_EVENT_NAME = "webDiscoverySduiError";
const OMNI_FEED_STATS_EVENT_NAME = "DiscoverySdui_FeedStats";

export enum SduiErrorNames {
  ActiveFriendsFooterPlaceDetailsFetchError = "ActiveFriendsFooterPlaceDetailsFetchError",
  AnalyticsBuilderInvalidCollectionAnalyticsData = "AnalyticsBuilderInvalidCollectionAnalyticsData",
  AnalyticsBuilderInvalidItemAnalyticsData = "AnalyticsBuilderInvalidItemAnalyticsData",
  AnalyticsParsingDiscardedInvalidParam = "AnalyticsParsingDiscardedInvalidParam",
  AssetImageMissingAssetUrl = "AssetImageMissingAssetUrl",
  BuildBaseActionParamsMissingItem = "BuildBaseActionParamsMissingItem",
  BuildBaseImpressionParamsInvalidItemsPerRow = "BuildBaseImpressionParamsInvalidItemsPerRow",
  BuildBaseImpressionParamsMissingItem = "BuildBaseImpressionParamsMissingItem",
  BuildItemImpressionParamsMissingItem = "BuildItemImpressionParamsMissingItem",
  CollectionCarouselMissingItem = "CollectionCarouselMissingItem",
  CollectionCarouselItemMissingComponentType = "CollectionCarouselItemMissingComponentType",
  CollectionCarouselHeaderNotReactElement = "CollectionCarouselHeaderNotReactElement",
  CollectionGridMissingItem = "CollectionGridMissingItem",
  CollectionGridItemMissingComponentType = "CollectionGridItemMissingComponentType",
  CollectionComponentItemsImpressedButMissing = "CollectionComponentItemsImpressedButMissing",
  CollectionComponentChildNotReactElement = "CollectionComponentChildNotReactElement",
  ComponentNotFound = "ComponentNotFound",
  FriendsPresenceFetchFailure = "FriendsPresenceFetchFailure",
  InvalidEventContextForPage = "InvalidEventContextForPage",
  InvalidImageQualityLevelConditionValue = "InvalidImageQualityLevelConditionValue",
  InvalidMaxWidthConditionValue = "InvalidMaxWidthConditionValue",
  InvalidMinWidthConditionValue = "InvalidMinWidthConditionValue",
  InvalidPageForSessionAnalytics = "InvalidPageForSessionAnalytics",
  InvalidParsedMaxWidthConditionValue = "InvalidParsedMaxWidthConditionValue",
  InvalidParsedMinWidthConditionValue = "InvalidParsedMinWidthConditionValue",
  InvalidPresenceConditionValue = "InvalidPresenceConditionValue",
  InvalidPresenceUpdateEvent = "InvalidPresenceUpdateEvent",
  NestedPropParseFailure = "NestedPropParseFailure",
  ParseBooleanFieldInvalidNumber = "ParseBooleanFieldInvalidNumber",
  ParseBooleanFieldInvalidString = "ParseBooleanFieldInvalidString",
  ParseBooleanFieldInvalidType = "ParseBooleanFieldInvalidType",
  PropParseFailure = "PropParseFailure",
  PropParserNotFound = "PropParserNotFound",
  ReportItemActionMissingCollectionData = "ReportItemActionMissingCollectionData",
  ReportItemImpressionsMissingData = "ReportItemImpressionsMissingData",
  ReportItemImpressionsNoIndexesToSend = "ReportItemImpressionsNoIndexesToSend",
  SduiActionOpenGameDetailsInvalidId = "SduiActionOpenGameDetailsInvalidId",
  SduiActionOpenSeeAllInvalidCollectionId = "SduiActionOpenSeeAllInvalidCollectionId",
  SduiActionOpenSeeAllInvalidCollectionName = "SduiActionOpenSeeAllInvalidCollectionName",
  SduiActionOpenSignupInvalidGetSignupUrl = "SduiActionOpenSignupInvalidGetSignupUrl",
  SduiComponentBuildPropsAndChildrenInvalidConfig = "SduiComponentBuildPropsAndChildrenInvalidConfig",
  SduiFeedItemBoundaryError = "SduiFeedItemBoundaryError",
  SduiLandingPageConfigurationNotFound = "SduiLandingPageConfigurationNotFound",
  SduiLandingPageDataFetchError = "SduiLandingPageDataFetchError",
  SduiLandingPageDataParseError = "SduiLandingPageDataParseError",
  SduiLandingPageDeviceFeaturesFetchError = "SduiLandingPageDeviceFeaturesFetchError",
  SduiLandingPagePageSlugFetchError = "SduiLandingPagePageSlugFetchError",
  SduiParseAssetUrlInvalidFormat = "SduiParseAssetUrlInvalidFormat",
  SduiParseAssetUrlInvalidInput = "SduiParseAssetUrlInvalidInput",
  SduiParseAssetUrlIntoComponentInvalidAssetType = "SduiParseAssetUrlIntoComponentInvalidAssetType",
  SduiParseAssetUrlIntoComponentInvalidRbxThumb = "SduiParseAssetUrlIntoComponentInvalidRbxThumb",
  SduiParseAssetUrlIntoComponentNoSupportedThumbSizeForType = "SduiParseAssetUrlIntoComponentNoSupportedThumbSizeForType",
  SduiParseAutomaticSizeInvalidInput = "SduiParseAutomaticSizeInvalidInput",
  SduiParseCallbackInvalidConfig = "SduiParseCallbackInvalidConfig",
  SduiParseColorValueInvalidInput = "SduiParseColorValueInvalidInput",
  SduiParseFoundationButtonSizeInvalidInput = "SduiParseFoundationButtonSizeInvalidInput",
  SduiParseFoundationButtonVariantInvalidInput = "SduiParseFoundationButtonVariantInvalidInput",
  SduiParseFoundationTokenInvalidInput = "SduiParseFoundationTokenInvalidInput",
  SduiParseFoundationTokenInvalidInputPath = "SduiParseFoundationTokenInvalidInputPath",
  SduiParseFoundationTokenInvalidOutputType = "SduiParseFoundationTokenInvalidOutputType",
  SduiParseFoundationTokenMissingTokens = "SduiParseFoundationTokenMissingTokens",
  SduiParseGradientInvalidConfig = "SduiParseGradientInvalidConfig",
  SduiParseIconInvalidInput = "SduiParseIconInvalidInput",
  SduiParseUDim2InvalidInput = "SduiParseUDim2InvalidInput",
  SduiParseVector2InvalidInput = "SduiParseVector2InvalidInput",
  SduiParseUiComponentInvalidConfig = "SduiParseUiComponentInvalidConfig",
  SduiParseWebTextElementInvalidInput = "SduiParseWebTextElementInvalidInput",
  ServerDrivenFeedItemMissingFeedOrFeedItems = "ServerDrivenFeedItemMissingFeedOrFeedItems",
  ServerDrivenFeedItemMissingItem = "ServerDrivenFeedItemMissingItem",
  SessionInfoKeyNotFound = "SessionInfoKeyNotFound",
  SingleItemCollectionItemImpressedButMissing = "SingleItemCollectionItemImpressedButMissing",
  SingleItemCollectionMissingItem = "SingleItemCollectionMissingItem",
  SingleItemCollectionItemMissingItemComponentType = "SingleItemCollectionItemMissingItemComponentType",
  TemplateResolutionCircularReference = "TemplateResolutionCircularReference",
  TemplateResolutionComponentTypeMismatch = "TemplateResolutionComponentTypeMismatch",
  TemplateResolutionTemplateNotFound = "TemplateResolutionTemplateNotFound",
  UnsupportedConditionalPropsCondition = "UnsupportedConditionalPropsCondition",
  UnknownImageQualityLevelConditionValue = "UnknownImageQualityLevelConditionValue",
  UnknownPresenceConditionKey = "UnknownPresenceConditionKey",
  UnknownResponsivePropConditionKey = "UnknownResponsivePropConditionKey",
  UnsupportedSduiPage = "UnsupportedSduiPage",
}

/**
 * Convert TSduiPageContext to EventContext, or fallback to 'unknown'.
 */
const getErrorPageContext = (
  pageContext: TSduiPageContext | undefined,
): EventContext | "unknown" => {
  if (pageContext) {
    const eventContext = getEventContext(pageContext);

    if (eventContext) {
      return eventContext;
    }
  }

  return "unknown";
};

/**
 * Logs an error with the SDUI system to both the real-time tracker (simple key)
 * and the event stream (more detailed information, but delayed).
 */
export const logSduiError = (
  errorName: string,
  errorMessage: string,
  pageContext: TSduiPageContext | undefined,
): void => {
  window.EventTracker?.fireEvent(errorName);

  const params = {
    errorName,
    errorMessage,
  };
  sendEvent(
    {
      name: ERROR_EVENT_NAME,
      type: ERROR_EVENT_NAME,
      context: getErrorPageContext(pageContext),
    },
    parseEventParams(params),
  );
};

/**
 * Returns the number of items in an SDUI collection, either through props.items.length or props.item (1).
 */
export const getSortItemCountFromSduiTree = (
  feedItemKey: string,
  sduiTree: TOmniRecommendationSduiTree | undefined,
): number => {
  const feedItems = sduiTree?.feed?.props?.feedItems as TServerDrivenComponentConfig[];

  if (!feedItems || !Array.isArray(feedItems)) {
    return 0;
  }

  const feedItem: TServerDrivenComponentConfig | undefined = feedItems.find(
    sduiFeedItem => sduiFeedItem.feedItemKey === feedItemKey,
  );

  if (feedItem?.props?.items && Array.isArray(feedItem.props.items)) {
    return feedItem.props.items.length;
  }

  if (feedItem?.props?.item) {
    return 1;
  }

  return 0;
};

export const getSortItemCountFromNonSduiSort = (sort: TOmniRecommendationSort): number => {
  if (
    isGameSortFromOmniRecommendations(sort) &&
    sort.recommendationList &&
    Array.isArray(sort.recommendationList)
  ) {
    return sort.recommendationList.length;
  }

  return 0;
};

export const logOmniFeedStats = (
  response: TGetOmniRecommendationsResponse,
  homePageSessionInfo: string,
): void => {
  try {
    const { sorts, sdui: sduiTree } = response;

    const itemCountsByTopicId: Record<string, number> = {};
    const isSduiSortByTopicId: Record<string, boolean> = {};

    sorts.forEach(sort => {
      if (sort.topicId) {
        if (isOmniRecommendationSduiSort(sort)) {
          isSduiSortByTopicId[sort.topicId] = true;

          itemCountsByTopicId[sort.topicId] =
            (itemCountsByTopicId[sort.topicId] ?? 0) +
            getSortItemCountFromSduiTree(sort.feedItemKey, sduiTree);
        } else {
          isSduiSortByTopicId[sort.topicId] = false;

          itemCountsByTopicId[sort.topicId] =
            (itemCountsByTopicId[sort.topicId] ?? 0) + getSortItemCountFromNonSduiSort(sort);
        }
      }
    });

    const eventParams: Record<string, string | number> = {
      [SessionInfoType.HomePageSessionInfo]: homePageSessionInfo,
    };

    Object.entries(itemCountsByTopicId).forEach(([topicId, itemCount]) => {
      eventParams[`${topicId}_item_count`] = itemCount;
      eventParams[`${topicId}_is_sdui`] = isSduiSortByTopicId[topicId] ? 1 : 0;
    });

    sendEvent(
      {
        name: OMNI_FEED_STATS_EVENT_NAME,
        type: OMNI_FEED_STATS_EVENT_NAME,
        context: EventContext.Home,
      },
      parseEventParams(eventParams),
    );
  } catch {
    // Fire counter, but do not block the main execution on the feed stat logs
    window.EventTracker?.fireEvent(homePage.omniRecommendationFeedStatsLoggingErrorEvent);
  }
};

export default logSduiError;
