import type { TIconProps } from "@rbx/foundation-ui";
import Presence from "@rbx/presence";

// Common Types
export enum TPageType {
  Home = "Home",
  Games = "Games",
}

export enum TContentType {
  Games = "Games",
}

export enum TTreatmentType {
  Carousel = "Carousel",
}

export enum TMetainfoValue {
  Invalid = "Invalid",
  HasLootBoxes = "HasLootBoxes",
  HasInGameTrading = "HasInGameTrading",
  IsUsingLootBoxApi = "IsUsingLootBoxApi",
  IsUsingInGameTradingApi = "IsUsingInGameTradingApi",
  HasAllowedExternalLinkReferences = "HasAllowedExternalLinkReferences",
  IsUsingAllowedExternalLinkReferencesApi = "IsUsingAllowedExternalLinkReferencesApi",
}

export enum TUniverseAvatarType {
  MorphToR6 = "MorphToR6",
  PlayerChoice = "PlayerChoice",
  MorphToR15 = "MorphToR15",
}

export enum TPaginationMethod {
  Scroll = "Scroll",
  Button = "Button",
}

export type TGamePassesResponse = {
  data: TGamePass[];
};

export type TGamePass = {
  id: number;
  name: string;
  displayName: string;
  productId: number;
  price: number;
  sellerName: string;
  sellerId: number;
  isOwned: boolean;
};

export type TSort = {
  token: string;
  name: string;
  displayName: string;
  gameSetTargetId?: number;
  gameSetTypeId: number;
  contextCountryRegionId: number;
  tokenExpiryInSeconds: number;
};

export type TMetaData = {
  suggestedKeyword?: string;
  correctedKeyword?: string;
  filteredKeyword?: string;
  paginationMethod?: TPaginationMethod;
  nextPageExclusiveStartId?: number;
  featuredSearchUniverseId?: number;
  hasMoreRows: boolean;
  emphasis: boolean;
  algorithm: string;
  algorithmQueryType: string;
  suggestionAlgorithm: string;
};

export type TFriendVisits = {
  userId: number;
};

type TMediaAssetInfo = {
  wideImageAssetId?: string;
  wideImageListId?: string;
  wideVideoAssetId?: string;
};

export type TMediaLayoutData = {
  primaryMediaAsset?: TMediaAssetInfo;
};

export enum TLayoutComponentType {
  TextLabel = "TextLabel",
  RatingWithGenre = "RatingWithGenre",
}

type TGameTileFooterAnalytics = {
  textLiteral?: string;
  locKey?: string;
};

export type TGameTileTextFooter = {
  type: TLayoutComponentType.TextLabel;
  text: {
    textLiteral: string;
  };
  analytics?: TGameTileFooterAnalytics;
};

export type TGameTileRatingWithGenreFooter = {
  type: TLayoutComponentType.RatingWithGenre;
  genre: {
    textLiteral: string;
  };
  analytics?: TGameTileFooterAnalytics;
};

type TGameTileFooter = TGameTileTextFooter | TGameTileRatingWithGenreFooter;

export type TGameTilePillComponent = {
  types: string[];
};

export type TGameTileIconClass =
  | {
      class: string;
      type: "core-ui";
    }
  | {
      class: TIconProps["name"];
      type: "foundation";
    };

export type TGameTilePillData = {
  id: string;
  text?: string;
  icons?: TGameTileIconClass[];
  animationClass?: string | null;
  componentType?: TGameTileBadgeComponentType;
};

export type TLayoutMetadata = {
  footer?: TGameTileFooter;
  tileBadgesByPosition?: TTileBadgesByPosition;
  pill?: TGameTilePillComponent;
  title?: string;
  primaryMediaAsset?: TMediaAssetInfo;
};

export type TTileBadgesByPosition = {
  ImageTopLeft?: TTileBadge[];
  ImageTopRight?: TTileBadge[];
  ImageBottomLeft?: TTileBadge[];
  ImageBottomRight?: TTileBadge[];
};

export enum TGameTileBadgeType {
  Text = "Text",
  Icon = "Icon",
  IconWithText = "IconWithText",
}

export enum TGameTileBadgeComponentType {
  Pill = "Pill",
  RoundedRectangle = "RoundedRectangle",
}

export type TTileBadge = {
  analyticsId: string;
  tileBadgeType: TGameTileBadgeType;
  text?: string;
  icons?: string[];
  isShimmerEnabled?: boolean;
  tileBadgeComponentType?: TGameTileBadgeComponentType;
};

type TLayoutDataBySort = {
  [topicId: string]: TLayoutMetadata;
};

export type TGameData = {
  totalUpVotes: number | undefined;
  totalDownVotes: number | undefined;
  universeId: number;
  name: string;
  placeId: number;
  rootPlaceId?: number;
  playerCount: number;
  isSponsored?: boolean;
  nativeAdData?: string;
  payerName?: string;
  placeIdOverride?: number;
  launchDataOverride?: string;
  isShowSponsoredLabel?: boolean;
  creatorName: string;
  creatorType: string;
  creatorId: number;
  creatorHasVerifiedBadge?: boolean;
  friendActivityTitle?: string;
  friendVisitedString?: string;
  minimumAge?: number;
  ageRecommendationDisplayName?: string;
  friendVisits?: TFriendVisits[];
  primaryMediaAsset?: TMediaAssetInfo;
  defaultLayoutData?: TLayoutMetadata;
  layoutDataBySort?: TLayoutDataBySort;
  contentMetadataMediaAsset?: TMediaAssetInfo;
  navigationUid?: string;
  canonicalUrlPath?: string;
  tileBadgesByPosition?: TTileBadgesByPosition;
  /**
   * contentMetadata is a field returned by APIs, but it is not a field
   * that should be used client-side, except for utils and mapper functions that
   * convert the API response to a client-side model (refer to tileBadgesByPosition)
   *
   * TODO: Clean up as part of https://roblox.atlassian.net/browse/CLIGROW-3785
   * @deprecated - This should only be used when converting server-side models to client-side models
   */
  contentMetadata?: Record<string, string>;
};

export type TPresence = {
  gameId?: string;
  lastLocation: string;
  lastOnline: string;
  placeId?: number;
  placeUrl?: string;
  rootPlaceId?: number;
  universeId?: number;
  userId: number;
  userPresenceType: (typeof Presence.PresenceType)[keyof typeof Presence.PresenceType];
};

export type TGameCreator = {
  id: number;
  name: string;
  type: string;
};

export type TRatingInformation = {
  RatingValue: string;
  RatingDescriptors: string[];
  InteractiveElements: string[];
  MetainfoValues: TMetainfoValue[];
  ImageUrl: string;
  RatingValueDescription: string;
};

export type TRating = {
  RatingCountryCode?: string;
  RatingProvider: string;
  RatingInformation: TRatingInformation[];
  RatingProviderUrl: string;
};

// GetOmniRecommendations
export type TOmniRecommendation = {
  ContentType: TContentType.Games;
  ContentId: number;
};

export type TOmniRecommendationSort = {
  Topic: string;
  TopicId: number;
  TreatmentType: TTreatmentType;
  RecommendationList: TOmniRecommendation[];
};

export type TGetOmniRecommendationsMetadataResponse = {
  ContentMetadata: {
    [TContentType.Games]: Record<number, TGameData>;
  };
};

export type TRefundPolicy = {
  policyText: string;
  learnMoreBaseUrl?: string;
  locale: string;
  articleId: string;
};
// GetPlaceDetails
export type TGetPlaceDetails = {
  placeId: number;
  name: string;
  description: string;
  url: string;
  builder: string;
  builderId: number;
  isPlayable: boolean;
  reasonProhibited: string;
  universeId: number;
  universeRootPlaceId: number;
  price: number;
  imageToken: string;
};

// GetGameDetails
export type TGetGameDetails = {
  id: number;
  rootPlaceId?: number;
  name: string;
  description?: string;
  creator: TGameCreator;
  price?: number;
  isGenreEnforced: true;
  isAllGenre: boolean;
  playing: number;
  visits: number;
  maxPlayers: number;
  favoritedCount: number;
  created: string;
  updated: string;
  copyingAllowed: boolean;
  studioAccessToApisAllowed: boolean;
  createVipServersAllowed: boolean;
  universeAvatarType: TUniverseAvatarType;
  // Old genre value being replaced by genre_l1 and genre_l2
  genre: string;

  // Genre from Updated Taxonomy
  // eslint-disable-next-line camelcase
  genre_l1?: string;

  // Subgenre (level 2 genre) from Updated Taxonomy
  // eslint-disable-next-line camelcase
  genre_l2?: string;

  // Untranslated genre (level 1) from Updated Taxonomy
  // eslint-disable-next-line camelcase
  untranslated_genre_l1?: string;

  gameRating?: TRating;
  isFavoritedByUser: boolean;
  sourceName?: string;
  sourceDescription?: string;
  licenseDescription?: string;
  refundLink?: string;
  localizedFiatPrice?: string;
  refundPolicy?: TRefundPolicy;
  isContentRestricted?: boolean;
  /** Studio creation source (e.g. "build" for Build experiences). */
  creationSource?: string;
};

// GetFriends
export type TGetFriendsResponse = {
  isOnline: boolean;
  isDeleted: boolean;
  description?: string;
  created: string;
  isBanned: boolean;
  id: number;
  name: string;
  displayName: string;
  presence?: TPresence;
  profileUrl?: string;
};

// GetPresenceUpdate
export type TPresenseUpdateEvent = CustomEvent<TPresence[] | undefined>;

// GetUniverseVoiceStatus
export type TGetUniverseVoiceStatus = {
  isUniverseEnabledForVoice: boolean;
  isUniverseEnabledForAvatarVideo: boolean;
};

export type TSupportedLocale = {
  id?: number;
  locale?: string;
  name?: string;
  nativeName?: string;
};

export type TGetUserLocaleResponse = {
  signupAndLogin?: TSupportedLocale;
  generalExperience?: TSupportedLocale;
  ugc?: TSupportedLocale;
};

// Types for fetching Asset CDN urls by assetId
type TAssetMetadata = {
  metadataType: number;
  value: string;
};

type TAssetLocation = {
  assetFormat: string;
  // Asset CDN URL
  location: string;
  assetMetadatas: TAssetMetadata[];
};

export type TAssetDataResponse = {
  locations: TAssetLocation[];
};

export type TGetPlayabilityStatus = {
  isPlayable: boolean;
  universeId: number;
};
