import {
  ContentType as ContentTypeEnum,
  EventContext,
  parseEventParams as parseEventParamsUnifiedLogging,
} from "@rbx/unified-logging";
import { eventTypes } from "@rbx/core-scripts/event-stream";
import { uuidService } from "@rbx/core-scripts/legacy/core-utilities";
import { AttributionType, getAttributionId } from "../utils/attributionUtils";
import { getHttpReferrer } from "../utils/browserUtils";
import { PageContext } from "../types/pageContext";
import { GameTileOverflowMenuItems } from "../types/gameTileOverflowMenuItems";
import { GameTileHiddenReason } from "../types/gameTileHiddenReason";
import { common } from "./configConstants";

// converts a PageContext to an EventContext to get a ctx that matches app ctx
export const getEventContext = (pageContext?: PageContext): EventContext | string => {
  switch (pageContext) {
    case PageContext.HomePage:
      return EventContext.Home;
    case PageContext.GamesPage:
      return EventContext.Games;
    case PageContext.SpotlightPage:
      return EventContext.Spotlight;
    case PageContext.SearchLandingPage:
      return EventContext.SearchLanding;
    case PageContext.GameDetailPage:
      return EventContext.GameDetail;
    case PageContext.SongListPage:
      return EventContext.SongList;
    case PageContext.SearchPage:
      return EventContext.SearchPage;
    case PageContext.UserProfilePage:
      return EventContext.UserProfile;
    case PageContext.PreAuthLandingPage:
      return EventContext.PreAuthLanding;
    default:
      window.EventTracker?.fireEvent(common.NoMatchingEventContextFoundCounterEvent);
      return "UNKNOWN";
  }
};

export const parseEventParams = (params: Record<string, any>): Record<string, string | number> => {
  return Object.keys(params).reduce<Record<string, string | number>>((acc, key) => {
    if (typeof params[key] === "object" && params[key]) {
      acc[key] = JSON.stringify(params[key]);
    }

    if (typeof params[key] === "number") {
      acc[key] = params[key];
    }

    if (typeof params[key] === "string") {
      acc[key] = encodeURIComponent(params[key]);
    }

    if (typeof params[key] === "boolean") {
      acc[key] = params[key] ? 1 : 0;
    }

    return acc;
  }, {});
};

const { pageLoad, formInteraction } = eventTypes;

export enum EventStreamMetadata {
  ActionType = "actionType",
  AbsPositions = "absPositions",
  AdsPositions = "adsPositions",
  AdFlags = "adFlags",
  Algorithm = "algorithm",
  AppliedFilters = "appliedFilters",
  AttributionId = "attributionId",
  AutoAdvance = "autoAdvance",
  ComponentType = "componentType",
  Context = "ctx",
  ContentType = "contentType",
  Direction = "direction",
  Distance = "distance",
  HttpReferrer = "httpReferrer",
  EmphasisFlag = "emphasisFlag",
  FilterId = "filterId",
  FilterIds = "filterIds",
  FooterTextLiterals = "footerTextLiterals",
  FooterLocalizationKeys = "footerLocalizationKeys",
  GameSetTargetId = "gameSetTargetId",
  GameSetTypeId = "gameSetTypeId",
  HeroUnitId = "heroUnitId",
  ImageAssetId = "imageAssetId",
  ImpressionThreshold = "impressionThreshold",
  InteractionType = "interactionType",
  InteractionUuid = "interactionUuid",
  IsAd = "isAd",
  IsButtonExpanded = "isButtonExpanded",
  IsVideo = "isVideo",
  IsYoutubeVideo = "isYoutubeVideo",
  ItemId = "itemId",
  LaunchData = "launchData",
  MediaGalleryEventType = "evt",
  NativeAdData = "nativeAdData",
  AdIds = "adIds",
  NumberOfLoadedTiles = "numberOfLoadedTiles",
  Page = "page",
  PageContext = "pageContext",
  PageSession = "pageSession",
  PlaceId = "placeId",
  PlaceIdOverride = "placeIdOverride",
  PlayContext = "playContext",
  Position = "position",
  PositionsInTopic = "positionsInTopic",
  Pos = "pos",
  PreviousOptionContextTag = "previousOptionContextTag",
  PreviousOptionId = "previousOptionId",
  PreviousIndex = "previousIndex",
  QueryText = "queryText",
  QueryTexts = "queryTexts",
  ResourceId = "resourceId",
  RootPlaceIds = "rootPlaceIds",
  ScreenSizeX = "screenSizeX",
  ScreenSizeY = "screenSizeY",
  ScrollAreaSize = "scrollAreaSize",
  ScrollDepth = "scrollDepth",
  SelectedOptionContextTag = "selectedOptionContextTag",
  SelectedOptionContextTags = "selectedOptionContextTags",
  SelectedOptionId = "selectedOptionId",
  SelectedOptionIds = "selectedOptionIds",
  SelectedIndex = "selectedIndex",
  ShareLinkType = "shareLinkType",
  ShareLinkId = "shareLinkId",
  SortId = "sortId",
  SortPos = "sortPos",
  SortSubId = "sortSubId",
  StartDepth = "startDepth",
  StartPos = "startPos",
  SubPageName = "subPageName",
  SuggestionKwd = "suggestionKwd",
  SuggestionReplacedKwd = "suggestionReplacedKwd",
  SuggestionCorrectedKwd = "suggestionCorrectedKwd",
  SuggestionAlgorithm = "suggestionAlgorithm",
  Topics = "topics",
  TreatmentType = "treatmentType",
  UniverseId = "universeId",
  UniverseIds = "universeIds",
  UnplayableReason = "unplayableReason",
  FriendId = "friendId",
  VideoAssetId = "videoAssetId",
  VideoThumbnailAssetIds = "videoThumbnailAssetIds",
  ThumbnailAssetIds = "thumbnailAssetIds",
  ThumbnailListIds = "thumbnailListIds",
  LinkPath = "linkPath",
  RowOnPage = "rowOnPage",
  RowsOnPage = "rowsOnPage",
  PositionInRow = "positionInRow",
  PositionsInRow = "positionsInRow",
  NavigationUids = "navigationUids",
  TileBadgeContexts = "tileBadgeContexts",
  ButtonName = "buttonName",
  IsInterested = "isInterested",
  IsActive = "isActive",
  InterestedUniverseIds = "interestedUniverseIds",
  MenuItem = "menuItem",
  AvailableMenuItems = "availableMenuItems",
  HiddenReason = "hiddenReason",
}

export enum EventType {
  GameImpressions = "gameImpressions",
  GameDetailReferral = "gameDetailReferral",
  SortDetailReferral = "sortDetailReferral",
  FeedScroll = "feedScroll",
  NavigateToSortLink = "navigateToSortLink",
  InterestCatcherClick = "interestCatcherClick",
  FilterImpressions = "filterImpressions",
  GamesFilterClick = "gamesFilterClick",
  RequestRefundClick = "requestRefundClick",
  GameTileOverflowMenuAction = "gameTileOverflowMenuAction",
  GameTileHiddenAction = "gameTileHiddenAction",
  NotInterestedFeedbackFormAction = "notInterestedFeedbackFormAction",
  MediaGalleryMediaChanged = "mediaGalleryMediaChanged",
  QuerySuggestionClicked = "querySuggestionClicked",
  QueryImpressions = "queryImpressions",
  ExpandableTextImpression = "expandableTextImpression",
  GameDetailUnavailable = "gameDetailUnavailable",
}

export enum SessionInfoType {
  HomePageSessionInfo = "homePageSessionInfo",
  GameSearchSessionInfo = "gameSearchSessionInfo",
  DiscoverPageSessionInfo = "discoverPageSessionInfo",
  SearchLandingPageSessionInfo = "searchLandingPageSessionInfo",
  SpotlightPageSessionInfo = "spotlightPageSessionInfo",
  PreAuthLandingPageSessionInfo = "preAuthLandingPageSessionInfo",
}

export type TDiscoverySessionInfo = {
  [key in SessionInfoType]?: string;
};

export type TEvent = [
  { name: string; type: EventType; context: string },
  Record<string, string | number>,
];

export type TBuildNavigateToSortLinkEventProperties = () => TNavigateToSortLink | undefined;

type TBaseGameImpressions = {
  [EventStreamMetadata.RootPlaceIds]: number[];
  [EventStreamMetadata.AbsPositions]: number[];
  [EventStreamMetadata.PositionsInTopic]?: number[];
  [EventStreamMetadata.UniverseIds]: number[];
  [EventStreamMetadata.GameSetTypeId]?: number | string;
  [EventStreamMetadata.GameSetTargetId]?: number | string;
  [EventStreamMetadata.SortId]?: string;
  [EventStreamMetadata.SortSubId]?: string;
  [EventStreamMetadata.AdsPositions]?: number[];
  [EventStreamMetadata.AdFlags]?: number[];
  [EventStreamMetadata.AdIds]?: string[];
  [EventStreamMetadata.ThumbnailAssetIds]?: string[];
  [EventStreamMetadata.ThumbnailListIds]?: string[];
  [EventStreamMetadata.VideoThumbnailAssetIds]?: number[];
  [EventStreamMetadata.NavigationUids]?: string[];
  [EventStreamMetadata.TileBadgeContexts]?: string[];
  [EventStreamMetadata.FooterTextLiterals]?: string[];
  [EventStreamMetadata.FooterLocalizationKeys]?: string[];
  [EventStreamMetadata.AppliedFilters]?: string;
  [EventStreamMetadata.ComponentType]?: string;
};

export type TGridGameImpressions = TBaseGameImpressions & {
  [EventStreamMetadata.SuggestionKwd]?: string;
  [EventStreamMetadata.SuggestionReplacedKwd]?: string;
  [EventStreamMetadata.SuggestionCorrectedKwd]?: string;
  [EventStreamMetadata.SuggestionAlgorithm]?: string;
  [EventStreamMetadata.Algorithm]?: string;
  [SessionInfoType.GameSearchSessionInfo]?: string;
  [SessionInfoType.HomePageSessionInfo]?: string;
  [EventStreamMetadata.EmphasisFlag]?: boolean;
  [EventStreamMetadata.SortPos]?: number;
  [EventStreamMetadata.NumberOfLoadedTiles]?: number;
  [EventStreamMetadata.Page]:
    | PageContext.SearchPage
    | PageContext.SortDetailPageDiscover
    | PageContext.SortDetailPageHome
    | PageContext.HomePage
    | PageContext.InterestCatcher;
};

export enum ScrollDirection {
  Horizontal = "horizontal",
  Vertical = "vertical",
}

export type TFeedScroll = {
  [EventStreamMetadata.StartPos]: number;
  [EventStreamMetadata.Distance]: number;
  [EventStreamMetadata.Direction]: ScrollDirection;
  [EventStreamMetadata.PageSession]: string;
  [EventStreamMetadata.GameSetTypeId]?: number;
  [EventStreamMetadata.GameSetTargetId]?: number;
  [EventStreamMetadata.SortId]?: string;
  [EventStreamMetadata.SortPos]?: number;
  [EventStreamMetadata.ScrollDepth]: number;
  [EventStreamMetadata.StartDepth]: number;
  [EventStreamMetadata.ScreenSizeX]: number;
  [EventStreamMetadata.ScreenSizeY]: number;
  [EventStreamMetadata.ScrollAreaSize]: number;
};

export type TNavigateToSortLink =
  | {
      [EventStreamMetadata.LinkPath]: string;
      [EventStreamMetadata.SortPos]: number;
      [EventStreamMetadata.GameSetTypeId]: number;
      [EventStreamMetadata.GameSetTargetId]?: number;
      [EventStreamMetadata.Page]: PageContext.HomePage | PageContext.GamesPage;
      [SessionInfoType.HomePageSessionInfo]?: string;
      [SessionInfoType.DiscoverPageSessionInfo]?: string;
    }
  | Record<string, never>;

export type TCarouselGameImpressions = TBaseGameImpressions & {
  [EventStreamMetadata.SortPos]: number;
  [SessionInfoType.HomePageSessionInfo]?: string;
  [SessionInfoType.DiscoverPageSessionInfo]?: string;
  [SessionInfoType.SearchLandingPageSessionInfo]?: string;
  [SessionInfoType.PreAuthLandingPageSessionInfo]?: string;
  [EventStreamMetadata.Page]:
    | PageContext.SortDetailPageDiscover
    | PageContext.SortDetailPageHome
    | PageContext.HomePage
    | PageContext.GamesPage
    | PageContext.GameDetailPage
    | PageContext.SearchLandingPage
    | PageContext.SpotlightPage
    | PageContext.SongListPage
    | PageContext.PreAuthLandingPage;
};

export type TGameImpressions = TCarouselGameImpressions | TGridGameImpressions;

export type TSortDetailReferral =
  | {
      [EventStreamMetadata.Position]: number;
      [EventStreamMetadata.SortId]?: number;
      [EventStreamMetadata.GameSetTypeId]?: number;
      [EventStreamMetadata.GameSetTargetId]?: number;
      [SessionInfoType.DiscoverPageSessionInfo]?: string;
      [SessionInfoType.HomePageSessionInfo]?: string;
      [EventStreamMetadata.TreatmentType]?: string;
      [EventStreamMetadata.Page]: PageContext.HomePage | PageContext.GamesPage;
    }
  | Record<string, never>;

// Common params for both gameDetailReferral and playGameClicked events
export type TCommonReferralParams = {
  [EventStreamMetadata.IsAd]?: boolean | string;
  [EventStreamMetadata.NativeAdData]?: string;
  [EventStreamMetadata.HeroUnitId]?: string;
  [EventStreamMetadata.Position]: number;
  [EventStreamMetadata.PositionInRow]?: number;
  [EventStreamMetadata.RowOnPage]?: number;
  [EventStreamMetadata.SortPos]?: number;
  [EventStreamMetadata.NumberOfLoadedTiles]?: number;
  [EventStreamMetadata.GameSetTypeId]?: number | string;
  [EventStreamMetadata.SortId]?: string;
  [EventStreamMetadata.SortSubId]?: string;
  [EventStreamMetadata.AttributionId]?: string;
  [SessionInfoType.DiscoverPageSessionInfo]?: string;
  [SessionInfoType.GameSearchSessionInfo]?: string;
  [SessionInfoType.HomePageSessionInfo]?: string;
  [SessionInfoType.SpotlightPageSessionInfo]?: string;
  [SessionInfoType.PreAuthLandingPageSessionInfo]?: string;
  [EventStreamMetadata.Page]:
    | PageContext.SearchPage
    | PageContext.SortDetailPageDiscover
    | PageContext.SortDetailPageHome
    | PageContext.HomePage
    | PageContext.GamesPage
    | PageContext.GameDetailPage
    | PageContext.PeopleListInHomePage
    | PageContext.SearchLandingPage
    | PageContext.SpotlightPage
    | PageContext.UserProfilePage
    | PageContext.SongListPage
    | PageContext.PreAuthLandingPage;
  [EventStreamMetadata.PlaceIdOverride]?: number;
  [EventStreamMetadata.LaunchData]?: string;
};

export type TGameDetailReferral =
  | (TCommonReferralParams & {
      [EventStreamMetadata.ContentType]?: string;
      [EventStreamMetadata.ActionType]?: string;
      [EventStreamMetadata.InteractionUuid]?: string;
      [EventStreamMetadata.PlaceId]: number;
      [EventStreamMetadata.UniverseId]: number;
      [EventStreamMetadata.GameSetTargetId]?: number;
      [EventStreamMetadata.FriendId]?: number;
      [EventStreamMetadata.AppliedFilters]?: string;
      [SessionInfoType.DiscoverPageSessionInfo]?: string;
      [SessionInfoType.GameSearchSessionInfo]?: string;
      [SessionInfoType.HomePageSessionInfo]?: string;
      [SessionInfoType.SearchLandingPageSessionInfo]?: string;
      [SessionInfoType.PreAuthLandingPageSessionInfo]?: string;
      [EventStreamMetadata.Page]:
        | PageContext.SearchPage
        | PageContext.SortDetailPageDiscover
        | PageContext.SortDetailPageHome
        | PageContext.HomePage
        | PageContext.GamesPage
        | PageContext.GameDetailPage
        | PageContext.PeopleListInHomePage
        | PageContext.SearchLandingPage
        | PageContext.SpotlightPage
        | PageContext.UserProfilePage
        | PageContext.SongListPage
        | PageContext.PreAuthLandingPage;
      // PlayContext is included so it gets passed through the URL to the game
      // detail page, where the play button reads it from query params.
      // It is not actually used for the referral event
      [EventStreamMetadata.PlayContext]?:
        | PageContext.HomePage
        | PageContext.GameDetailPage
        | PageContext.GamesPage
        | PageContext.SearchLandingPage
        | PageContext.SpotlightPage
        | PageContext.SortDetailPageDiscover
        | PageContext.PreAuthLandingPage;
      [EventStreamMetadata.ShareLinkType]?: string;
      [EventStreamMetadata.ShareLinkId]?: string;
    })
  | Record<string, never>;

export type TPlayGameClicked = TCommonReferralParams & {
  [EventStreamMetadata.PlaceId]: number;
  [EventStreamMetadata.UniverseId]: number;
  [EventStreamMetadata.IsAd]: string;
  [EventStreamMetadata.PlayContext]:
    | PageContext.HomePage
    | PageContext.GameDetailPage
    | PageContext.GamesPage
    | PageContext.SpotlightPage
    | PageContext.SortDetailPageDiscover
    | PageContext.SongListPage
    | PageContext.PreAuthLandingPage;
};

export type TRequestRefundClick =
  | {
      [EventStreamMetadata.PlaceId]: number;
    }
  | Record<string, never>;

export enum TInterestCatcherButton {
  Skip = "skip",
  Continue = "continue",
  Interested = "interested",
}

export type TInterestCatcherClick =
  | {
      [EventStreamMetadata.ButtonName]: TInterestCatcherButton;
      [SessionInfoType.HomePageSessionInfo]?: string;
      [EventStreamMetadata.Page]: PageContext.HomePage;

      // Additional fields for Skip/Continue button clicks
      [EventStreamMetadata.InterestedUniverseIds]?: number[];

      // Additional fields for Interested button clicks
      [EventStreamMetadata.Position]?: number;
      [EventStreamMetadata.PlaceId]?: number;
      [EventStreamMetadata.UniverseId]?: number;
      [EventStreamMetadata.GameSetTypeId]?: number;
      [EventStreamMetadata.NumberOfLoadedTiles]?: number;
      [EventStreamMetadata.IsInterested]?: boolean;
    }
  | {};

export type TFilterImpressions =
  | {
      [EventStreamMetadata.AbsPositions]: number[];
      [EventStreamMetadata.FilterIds]: string[];
      [EventStreamMetadata.SelectedOptionIds]: string[];
      [EventStreamMetadata.GameSetTypeId]: number;
      [EventStreamMetadata.GameSetTargetId]?: number;
      [EventStreamMetadata.SortPos]: number;
      [SessionInfoType.DiscoverPageSessionInfo]: string;
      [EventStreamMetadata.Page]: PageContext.GamesPage;
      [EventStreamMetadata.SelectedOptionContextTags]: string[];
    }
  | {};

export enum TGamesFilterButton {
  OpenDropdown = "openDropdown",
  CloseDropdown = "closeDropdown",
  Apply = "apply",
}

export type TGamesFilterClick =
  | {
      [EventStreamMetadata.ButtonName]: TGamesFilterButton;
      [EventStreamMetadata.GameSetTypeId]: number;
      [EventStreamMetadata.GameSetTargetId]?: number;
      [EventStreamMetadata.SortPos]: number;
      [EventStreamMetadata.FilterId]: string;
      [EventStreamMetadata.SelectedOptionId]: string;
      [EventStreamMetadata.PreviousOptionId]?: string;
      [SessionInfoType.DiscoverPageSessionInfo]: string;
      [EventStreamMetadata.Page]: PageContext.GamesPage;
      [EventStreamMetadata.SelectedOptionContextTag]?: string;
      [EventStreamMetadata.PreviousOptionContextTag]?: string;
      [EventStreamMetadata.IsActive]?: boolean;
    }
  | {};

export enum GameTileOverflowMenuActionType {
  GameTileOverflowMenuItemOpened = "GameTileOverflowMenuItemOpened",
  GameTileOverflowMenuItemClosed = "GameTileOverflowMenuItemClosed",
  GameTileOverflowMenuItemActivated = "GameTileOverflowMenuItemActivated",
}

export type TGameTileOverflowMenuAction =
  | {
      [EventStreamMetadata.UniverseId]: string;
      [EventStreamMetadata.SortId]?: string;
      [EventStreamMetadata.ActionType]: GameTileOverflowMenuActionType;
      [EventStreamMetadata.MenuItem]?: GameTileOverflowMenuItems;
      [EventStreamMetadata.AvailableMenuItems]?: string[];
      [SessionInfoType.HomePageSessionInfo]?: string;
    }
  | {};

export enum GameTileHiddenActionType {
  GameTileHiddenUndone = "GameTileHiddenUndone",
}

export type TGameTileHiddenAction =
  | {
      [EventStreamMetadata.UniverseId]: string;
      [EventStreamMetadata.SortId]?: string;
      [EventStreamMetadata.ActionType]: GameTileHiddenActionType;
      [EventStreamMetadata.HiddenReason]?: GameTileHiddenReason;
      [SessionInfoType.HomePageSessionInfo]?: string;
    }
  | {};

export enum NotInterestedFeedbackFormActionType {
  NotInterestedFeedbackFormOpened = "NotInterestedFeedbackFormOpened",
  NotInterestedFeedbackFormClosedWithoutSubmit = "NotInterestedFeedbackFormClosedWithoutSubmit",
  NotInterestedFeedbackFormSubmitted = "NotInterestedFeedbackFormSubmitted",
}

export type TNotInterestedFeedbackFormAction =
  | {
      [EventStreamMetadata.UniverseId]: string;
      [EventStreamMetadata.SortId]?: string;
      [EventStreamMetadata.ActionType]: NotInterestedFeedbackFormActionType;
      [SessionInfoType.HomePageSessionInfo]?: string;
    }
  | {};

export enum MediaGalleryActionEventType {
  MediaGalleryMediaChanged = "mediaGalleryMediaChanged",
}

export type TMediaGalleryAction = {
  [EventStreamMetadata.MediaGalleryEventType]: MediaGalleryActionEventType;
  [EventStreamMetadata.Context]: string;
  [EventStreamMetadata.UniverseId]: string;
  [EventStreamMetadata.PlaceId]: string;
  [EventStreamMetadata.PreviousIndex]: number;
  [EventStreamMetadata.SelectedIndex]: number;
  [EventStreamMetadata.ImageAssetId]?: string;
  [EventStreamMetadata.VideoAssetId]?: string;
  [EventStreamMetadata.AutoAdvance]: boolean;
  [EventStreamMetadata.IsVideo]: boolean;
  [EventStreamMetadata.IsYoutubeVideo]: boolean;
};

export type TQuerySuggestionClicked = {
  [EventStreamMetadata.Context]: EventContext | string;
  [EventStreamMetadata.ComponentType]?: string;
  [EventStreamMetadata.SortId]: string;
  [EventStreamMetadata.SortPos]: number;
  [EventStreamMetadata.QueryText]: string;
  [EventStreamMetadata.Pos]: number;
  [SessionInfoType.SearchLandingPageSessionInfo]?: string;
};

export type TQueryImpressions = {
  [EventStreamMetadata.Context]: EventContext | string;
  [EventStreamMetadata.ComponentType]?: string;
  [EventStreamMetadata.SortId]: string;
  [EventStreamMetadata.SortPos]: number;
  [EventStreamMetadata.QueryTexts]: string[];
  [EventStreamMetadata.AbsPositions]: number[];
  [SessionInfoType.SearchLandingPageSessionInfo]?: string;
};

export type TGameDetailUnavailable = {
  [EventStreamMetadata.UniverseId]?: string;
  [EventStreamMetadata.PlaceId]?: string;
  [EventStreamMetadata.UnplayableReason]?: string;
  [EventStreamMetadata.HttpReferrer]?: string;
};

export type TExpandableTextImpressions = {
  [EventStreamMetadata.ImpressionThreshold]: number;
  /**
   * Long texts are often hidden behind a "show more" button. This field
   * indicates whether the button has been expanded and all text is visible.
   * Note the different meanings:
   * 1. is_button_expanded=true indicates that the button exists has been expanded and all text is visible
   * 2. is_button_expanded=false indicates that the button exists and has been collapsed and some of the text is hidden
   * 3. is_button_expanded=undefined indicates that the button does not exist and all the text is visible
   */
  [EventStreamMetadata.IsButtonExpanded]?: boolean;
  [EventStreamMetadata.ContentType]: ContentTypeEnum;
  /**
   * This is a specific set of PageContext values rather than allowing all
   * PageContext because it gets mapped to an EventContext. If adding a new value,
   * please make sure the `getEventContext` method above handles it
   */
  [EventStreamMetadata.PageContext]: PageContext.GameDetailPage;
  [EventStreamMetadata.ItemId]: number;
  [EventStreamMetadata.ComponentType]: string;
} & TDiscoverySessionInfo;

export default {
  [EventType.GameImpressions]: ({ ...params }: TGameImpressions): TEvent => [
    {
      name: EventType.GameImpressions,
      type: EventType.GameImpressions,
      context: formInteraction,
    },
    parseEventParams({
      ...params,
    }),
  ],
  [EventType.GameDetailReferral]: (params: TGameDetailReferral = {}): TEvent => [
    {
      name: EventType.GameDetailReferral,
      type: EventType.GameDetailReferral,
      context: pageLoad,
    },
    parseEventParams({
      [EventStreamMetadata.AttributionId]: getAttributionId(AttributionType.GameDetailReferral),
      [EventStreamMetadata.HttpReferrer]: getHttpReferrer(),
      [EventStreamMetadata.ContentType]: ContentTypeEnum.Game,
      [EventStreamMetadata.ActionType]: "OpenGameDetails",
      [EventStreamMetadata.InteractionUuid]: uuidService.generateRandomUuid(),
      ...params,
    }),
  ],
  [EventType.SortDetailReferral]: (params: TSortDetailReferral = {}): TEvent => [
    {
      name: EventType.SortDetailReferral,
      type: EventType.SortDetailReferral,
      context: pageLoad,
    },
    parseEventParams({
      ...params,
    }),
  ],
  [EventType.NavigateToSortLink]: (params: TNavigateToSortLink = {}): TEvent => [
    {
      name: EventType.NavigateToSortLink,
      type: EventType.NavigateToSortLink,
      context: formInteraction,
    },
    parseEventParams({
      ...params,
    }),
  ],
  [EventType.InterestCatcherClick]: (params: TInterestCatcherClick = {}): TEvent => [
    {
      name: EventType.InterestCatcherClick,
      type: EventType.InterestCatcherClick,
      context: formInteraction,
    },
    parseEventParams({
      ...params,
    }),
  ],
  [EventType.FilterImpressions]: (params: TFilterImpressions = {}): TEvent => [
    {
      name: EventType.FilterImpressions,
      type: EventType.FilterImpressions,
      context: formInteraction,
    },
    parseEventParams({
      ...params,
    }),
  ],
  [EventType.GamesFilterClick]: (params: TGamesFilterClick = {}): TEvent => [
    {
      name: EventType.GamesFilterClick,
      type: EventType.GamesFilterClick,
      context: formInteraction,
    },
    parseEventParams({
      ...params,
    }),
  ],
  [EventType.RequestRefundClick]: (params: TRequestRefundClick): TEvent => [
    {
      name: EventType.RequestRefundClick,
      type: EventType.RequestRefundClick,
      context: formInteraction,
    },
    parseEventParams({
      [EventStreamMetadata.PlaceId]: params.placeId,
    }),
  ],
  [EventType.GameTileOverflowMenuAction]: (
    params: TGameTileOverflowMenuAction,
    page?: PageContext,
  ): TEvent => [
    {
      name: EventType.GameTileOverflowMenuAction,
      type: EventType.GameTileOverflowMenuAction,
      context: getEventContext(page),
    },
    parseEventParamsUnifiedLogging({
      ...params,
    }),
  ],
  [EventType.GameTileHiddenAction]: (params: TGameTileHiddenAction, page?: PageContext): TEvent => [
    {
      name: EventType.GameTileHiddenAction,
      type: EventType.GameTileHiddenAction,
      context: getEventContext(page),
    },
    parseEventParamsUnifiedLogging({
      ...params,
    }),
  ],
  [EventType.NotInterestedFeedbackFormAction]: (
    params: TNotInterestedFeedbackFormAction,
    page?: PageContext,
  ): TEvent => [
    {
      name: EventType.NotInterestedFeedbackFormAction,
      type: EventType.NotInterestedFeedbackFormAction,
      context: getEventContext(page),
    },
    parseEventParamsUnifiedLogging({
      ...params,
    }),
  ],
  [EventType.MediaGalleryMediaChanged]: (params: TMediaGalleryAction): TEvent => [
    {
      name: EventType.MediaGalleryMediaChanged,
      type: EventType.MediaGalleryMediaChanged,
      context: formInteraction,
    },
    parseEventParamsUnifiedLogging({
      ...params,
    }),
  ],
  [EventType.QuerySuggestionClicked]: (params: TQuerySuggestionClicked): TEvent => [
    {
      name: EventType.QuerySuggestionClicked,
      type: EventType.QuerySuggestionClicked,
      context: formInteraction,
    },
    parseEventParamsUnifiedLogging({
      ...params,
    }),
  ],
  [EventType.QueryImpressions]: (params: TQueryImpressions): TEvent => [
    {
      name: EventType.QueryImpressions,
      type: EventType.QueryImpressions,
      context: formInteraction,
    },
    parseEventParamsUnifiedLogging({
      ...params,
    }),
  ],
  [EventType.ExpandableTextImpression]: ({
    pageContext,
    ...params
  }: TExpandableTextImpressions): TEvent => [
    {
      name: EventType.ExpandableTextImpression,
      type: EventType.ExpandableTextImpression,
      context: formInteraction,
    },
    parseEventParamsUnifiedLogging({
      ...params,
      [EventStreamMetadata.PageContext]: getEventContext(pageContext),
      [EventStreamMetadata.InteractionUuid]: uuidService.generateRandomUuid(),
    }),
  ],
  [EventType.GameDetailUnavailable]: (params: TGameDetailUnavailable = {}): TEvent => [
    {
      name: EventType.GameDetailUnavailable,
      type: EventType.GameDetailUnavailable,
      context: pageLoad,
    },
    parseEventParams({
      [EventStreamMetadata.HttpReferrer]: getHttpReferrer(),
      ...params,
    }),
  ],
};
