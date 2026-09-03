import { TGameData, TPaginationMethod } from "./bedev1Types";

export enum TContentType {
  Game = "Game",
  CatalogAsset = "CatalogAsset",
  CatalogBundle = "CatalogBundle",
}

export enum TTreatmentType {
  Carousel = "Carousel",
  AvatarCarousel = "AvatarCarousel",
  SortlessGrid = "SortlessGrid",
  FriendCarousel = "FriendCarousel",
  InterestGrid = "InterestGrid",
  Pills = "Pills",
  Sdui = "sdui",
  SongCarousel = "SongCarousel",
  SearchPillCarousel = "SearchPillCarousel",
}

export enum TSduiTreatmentType {
  Carousel = "Carousel",
  HeroUnit = "HeroUnit",
}

export enum TRequestIntent {
  AmpUpsellFeatureGranted = "ampUpsellFeatureGranted",
}

export enum TSortTopic {
  Sponsored = "Sponsored",
  SponsoredGame = "SponsoredGame",
}

export enum TComponentType {
  AppGameTileNoMetadata = "AppGameTileNoMetadata",
  GridTile = "GridTile",
  EventTile = "EventTile",
  InterestTile = "InterestTile",
  ExperienceEventsTile = "ExperienceEventsTile",
}

export type TWideTileComponentType =
  | TComponentType.GridTile
  | TComponentType.EventTile
  | TComponentType.InterestTile
  | TComponentType.ExperienceEventsTile;

export enum TPlayerCountStyle {
  Always = "Always",
  Hover = "Hover",
  Footer = "Footer",
}

export enum TPlayButtonStyle {
  Disabled = "Disabled",
  Enabled = "Enabled",
}

export enum THoverStyle {
  imageOverlay = "imageOverlay",
}

export type TCatalog = {
  name: string;
  creatorName: string;
  creatorType: string;
  creatorId: number;
  lowestPrice?: number;
  price?: number;
  premiumPrice?: number;
  numberRemaining?: number;
  noPriceStatus: string;
  itemStatus: string[];
  itemRestrictions: string[];
  itemId: number;
  itemType: string;
};

export type TOmniRecommendationGame = {
  analyticsData: Record<string, string>;
  contentType: TContentType.Game;
  contentId: number;
  contentMetadata: Record<string, string>;
};
export type TOmniRecommendationCatalog = {
  contentType: TContentType.CatalogAsset | TContentType.CatalogBundle;
  contentId: number;
};
export type TOmniRecommendation = TOmniRecommendationGame | TOmniRecommendationCatalog;

export type TTopicLayoutData = {
  componentType?: TComponentType;
  playerCountStyle?: TPlayerCountStyle;
  playButtonStyle?: TPlayButtonStyle;
  hoverStyle?: THoverStyle;
  infoText?: string;
  hideSeeAll?: "true" | "false";
  navigationRootPlaceId?: string;
  isSponsoredFooterAllowed?: "true" | "false";
  isSponsoredRatingFooterAllowed?: "true" | "false";
  linkPath?: string;
  subtitleLinkPath?: string;
  endTimestamp?: string;
  countdownString?: string;
  backgroundImageAssetId?: string;
  hideTileMetadata?: "true" | "false";
  enableExplicitFeedback?: "true" | "false";
  enableSponsoredFeedback?: "true" | "false";
  sponsoredUserCohort?: string;
  enableReportAd?: "true" | "false";
  sponsoredFooterAdLabelText?: string;
  sponsoredFooterAdLabelFirst?: "true" | "false";
  sponsoredFooterIncludeRatingContent?: "true" | "false";
  ampUpsellFeatureName?: string;
  ampUpsellNamespace?: string;
};

type TSharedGameSort = {
  topic: string;
  topicId: number;
  treatmentType:
    | TTreatmentType.Carousel
    | TTreatmentType.SortlessGrid
    | TTreatmentType.InterestGrid;
  subtitle?: string;
  topicLayoutData?: TTopicLayoutData;
  subId?: string;
};

export type TOmniRecommendationSduiSort = {
  topicId: number;
  treatmentType: TTreatmentType.Sdui;
  numberOfRows?: number;

  feedItemKey: string;
};

export type TOmniRecommendationGameSort = TSharedGameSort & {
  analyticsData: Record<string, string>;
  recommendationList: TOmniRecommendationGame[] | null;
  numberOfRows?: number;
};

export type TOmniRecommendationCatalogSort = {
  topic: string;
  topicId: number;
  treatmentType: TTreatmentType.AvatarCarousel;
  recommendationList: TOmniRecommendationCatalog[] | null;
  numberOfRows?: number;
};

export type TOmniRecommendationFriendSort = {
  topic: string;
  topicId: number;
  treatmentType: TTreatmentType.FriendCarousel;
  numberOfRows?: number;
};

export type TFilterOption = {
  optionId: string;
  optionDisplayName: string;
  optionContextTag?: string;
};

export type TFiltersData = {
  filterId: string;
  filterDisplayName: string;
  filterType: string;
  filterOptions: TFilterOption[];
  selectedOptionId: string;
  inactiveOptionIds?: string[];
};

type TSharedExploreApiSortResponse = {
  sortDisplayName: string;
  sortId: string;
  contentType: string;
  nextPageToken?: string;
  gameSetTypeId: number;
  gameSetTargetId?: number;
  subtitle?: string;
  topicLayoutData?: TTopicLayoutData;
};

export type TExploreApiGameSortResponse = TSharedExploreApiSortResponse & {
  treatmentType: TTreatmentType.Carousel;
  games: TGameData[];
  appliedFilters?: string;
};

export type TExploreApiFiltersSortResponse = TSharedExploreApiSortResponse & {
  treatmentType: TTreatmentType.Pills;
  filters: TFiltersData[];
};

export type TQueryData = {
  query: string;
  contentType: string;
  itemLayoutData: Record<string, string>;
};

export type TExploreApiSearchPillsSortResponse = TSharedExploreApiSortResponse & {
  treatmentType: TTreatmentType.SearchPillCarousel;
  queries: TQueryData[];
};

export type TSongData = {
  assetId: number;
  title: string;
  artist: string;
  albumArtAssetId: number;
  isPrivate: boolean;
  duration: number;
};

export type TExploreApiSongsSortResponse = TSharedExploreApiSortResponse & {
  treatmentType: TTreatmentType.SongCarousel;
  songs: TSongData[];
};

export type TExploreApiSortResponse =
  | TExploreApiGameSortResponse
  | TExploreApiFiltersSortResponse
  | TExploreApiSongsSortResponse
  | TExploreApiSearchPillsSortResponse;

export type TExploreApiHeaderSortResponse = {
  sorts: TExploreApiSortResponse[];
  layoutData?: TTopicLayoutData;
};

export type TExploreApiSortsResponse = {
  header?: TExploreApiHeaderSortResponse;
  sorts: TExploreApiSortResponse[];
  nextSortsPageToken: string;
};

export type TExploreApiGameSort = TSharedGameSort & {
  games: TGameData[];
  sortId: string;
  contentType: string;
  nextPageToken: string;
  gameSetTargetId?: number;
  appliedFilters?: string;
};

export type TExploreApiFiltersSort = {
  topic: string;
  topicId: number;
  treatmentType: TTreatmentType.Pills;
  subtitle?: string;
  topicLayoutData?: TTopicLayoutData;
  filters: TFiltersData[];
  nextPageToken: string;
  sortId: string;
  contentType: string;
  gameSetTargetId?: number;
};

export type TExploreApiSearchPillsSort = {
  topic: string;
  topicId: number;
  gameSetTargetId?: number;
  treatmentType: TTreatmentType.SearchPillCarousel;
  topicLayoutData?: TTopicLayoutData;
  queries: TQueryData[];
  sortId: string;
  contentType: string;
  nextPageToken: string;
};

export type TExploreApiSongsSort = {
  topic: string;
  topicId: number;
  gameSetTargetId?: number;
  songs: TSongData[];
  treatmentType: TTreatmentType.SongCarousel;
  nextPageToken: string;
  sortId: string;
  contentType: string;
  subtitle?: string;
  topicLayoutData?: TTopicLayoutData;
};

export type TSongSort = TExploreApiSongsSort;

export type TExploreApiSort =
  | TExploreApiGameSort
  | TExploreApiFiltersSort
  | TExploreApiSongsSort
  | TExploreApiSearchPillsSort;

export type TExploreApiHeaderSort = {
  sorts: TExploreApiSort[];
  layoutData?: TTopicLayoutData;
};

export type TExploreApiSorts = {
  header?: TExploreApiHeaderSort;
  sorts: TExploreApiSort[];
  nextSortsPageToken: string;
};

export type TGameSort = TExploreApiGameSort | TOmniRecommendationGameSort;

export type TOmniRecommendationSort =
  | TOmniRecommendationGameSort
  | TOmniRecommendationCatalogSort
  | TOmniRecommendationFriendSort
  | TOmniRecommendationSduiSort;

export type TSort =
  | TGameSort
  | TOmniRecommendationCatalogSort
  | TOmniRecommendationFriendSort
  | TExploreApiFiltersSort
  | TOmniRecommendationSduiSort
  | TSongSort
  | TExploreApiSearchPillsSort;

export type TGetOmniRecommendationsMetadataResponse = {
  contentMetadata: TOmniRecommendationsContentMetadata;
};

export type TOmniRecommendationsContentMetadata = {
  [TContentType.Game]: Record<string, TGameData>;
  [TContentType.CatalogAsset]: Record<string, TCatalog>;
  [TContentType.CatalogBundle]: Record<string, TCatalog>;
};

export enum TOmniSearchPageType {
  All = "all",
}

export enum TOmniSearchContentType {
  Game = "Game",
  Text = "Text",
}

export type TOmniSearchContentDataModel = {
  contentType: string;
  contentId: number;
};

export type TOmniSearchGameDataModel = {
  contentType: string; // 'Game'
  contentId: number; // universeId
  universeId: number;
  rootPlaceId: number;
  name: string;
  description: string;
  playerCount: number;
  totalUpVotes: number;
  totalDownVotes: number;
  emphasis: boolean;
  isSponsored: boolean;
  nativeAdData: string;
  creatorName: string;
  creatorType: string;
  creatorId: number;
  creatorHasVerifiedBadge?: boolean;
  contentMetadata?: Record<string, string>;
  canonicalUrlPath?: string;
};

export type TOmniSearchTextDataModel = {
  topicId: string; // e.g. 'HotlineSearchText'
  contentType: string; // 'Text'
  contentId: number; // 0 for text data model
  name: string; // content of the text
  defaultLayoutData: TTopicLayoutData;
};

export type TOmniSearchContentGroup = {
  topicId: string; // e.g. 'HotlineSearchText'
  contentGroupType: string;
  contents: TOmniSearchContentDataModel[];
};

export type TGameSearchSortData = {
  topicId: string;
  topicLayoutData: TTopicLayoutData;
};

export type TGetOmniSearchResponse = {
  searchResults: TOmniSearchContentGroup[];
  sorts?: TGameSearchSortData[];
  filteredSearchQuery: string;
  paginationMethod?: TPaginationMethod;
  nextPageToken: string;
};

export type TGetOmniSearchParsedResponse = {
  filteredSearchQuery: string;
  nextPageToken: string;
  gamesList: TOmniSearchGameDataModel[];
  gameTopicIds: Set<string>;
  textList: TOmniSearchTextDataModel[];
  paginationMethod?: TPaginationMethod;
  sorts: TGameSearchSortData[];
};

export type TGuacAppPolicyBehaviorResponse = {
  EnableAggregateLikesFavoritesCount: boolean;
  experienceDetailsNoticeType: string;
  shouldShowVpcPlayButtonUpsells: boolean;
};

export type TProfile = {
  userId: number;
  names: { combinedName: string; username: string };
};

export type TGetProfilesResponse = {
  profileDetails: TProfile[];
};

export type TCanUserManagePlaceRequestBody = {
  requests: {
    subject: {
      subjectType: string;
      subjectId: string;
    };
    action: string;
    assetId: number;
  }[];
};

export type TCanUserManagePlaceResponse = {
  results: {
    value: {
      status: string;
    };
  }[];
};

export type TPrivateServerDiscount = {
  source: string;
  robux: number;
};

export type TPrivateServerResponseData = {
  isAvailable: boolean;
  price: number;
  privateServerProductId: number;
  privateServerLimit: number;
  discounts: TPrivateServerDiscount[];
};

export type TPrivateServerSettingsResponse = {
  rootPlaceId: number;
  privateServerData: TPrivateServerResponseData;
};

export type TSortIdMapping = {
  genreToSortId: Record<string, string>;
};
