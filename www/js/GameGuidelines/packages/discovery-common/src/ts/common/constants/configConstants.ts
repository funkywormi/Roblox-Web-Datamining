export const homePage = {
  // deprecated by homePageTileDisplayConfigConstants after home page expansion
  maxTilesPerCarouselPage: 6,
  maxWideGameTilesPerCarouselPage: 4,
  minWideGameTilesPerCarouselPage: 2,
  gameTileWidth: 150,
  homeFeedMaxWidth: 970,
  wideGameTileTilesPerRowBreakpointWidth: 738,

  sortlessGridMaxTilesMetadataToFetch: 300,
  adSortHomePageId: 400000000,
  topicIdsWithoutSeeAll: [500000000, 500000001],
  friendsCarouselAngularBootstrapErrorEvent: "HomePageFriendsCarouselBootstrapError",
  missingNumberOfRowsForLoggingErrorEvent: "HomePageMissingNumberOfRowsForLoggingError",
  omniRecommendationEndpointErrorEvent: "HomePageOmniRecommendationEndpointError",
  omniRecommendationEndpointSuccessEvent: "HomePageOmniRecommendationEndpointSuccess",
  omniRecommendationFeedStatsLoggingErrorEvent: "HomePageOmniRecommendationFeedStatsLoggingError",
  linkStartDelimiter: "{linkStart}",
  linkEndDelimiter: "{linkEnd}",
};

export const gamesPage = {
  numGameCarouselLookAheadWindows: 3,
  adSortDiscoverId: 27,
  carouselContainerBufferWidth: 80,
  gameTileGutterWidth: 14,
  wideGameTileGutterWidth: 16,
  scrollerWidth: 30,
};

export const gameDetailsPage = {
  maxTilesPerCarouselPage: 6,
  visitsTruncationDigitsAfterDecimalPoint: 1,
  surveyImpressionsIntersectionThreshold: 0.5,
  requestRefundError: "RequestRefundError",
  votingPanelLoadFailure: "VotingPanelLoadFailure",
};

export const common = {
  maxTilesInGameImpressionsEvent: 25,
  gameImpressionsIntersectionThreshold: 0.5,
  filterImpressionsIntersectionThreshold: 0.5,
  wideTileHoverGrowWidthPx: 26,
  numberOfInGameAvatarIcons: 3,
  numberOfInGameNames: 1,
  maxFacepileFriendCountValue: 99,
  numberOfGameTilesPerLoad: 60,
  numberOfGamePassesPerLoad: 50,
  keyBoardEventCode: {
    enter: "Enter",
    escape: "Escape",
  },
  RatingPercentageText: "Label.RatingPercentage",
  NoMatchingEventContextFoundCounterEvent: "NoMatchingEventContextFound",
  NoMatchingSessionInfoTypeFoundCounterEvent: "NoMatchingSessionInfoTypeFound",
};

export const gameSearchPage = {
  // when 10% of pixels on sentinel tile are visible, load more data
  sentinelTileIntersectionThreshold: 0.1,
  unknownTopicId: "Unknown",
  omniSearchEndpointErrorEvent: "OmniSearchEndpointError",
  omniSearchEndpointSuccessEvent: "OmniSearchEndpointSuccess",
};

export const surveyLocation = {
  experienceDetails: "experienceDetails",
};

export const searchLandingPage = {
  searchLandingPageFetchRecommendationsError: "SearchLandingPageFetchRecommendationsError",
  searchLandingPageFetchRecommendationsSuccess: "SearchLandingPageFetchRecommendationsSuccess",
  searchLandingPageMissingSessionInfoError: "SearchLandingPageMissingSessionInfoError",
  searchLandingPageUnexpectedTreatmentTypeError: "SearchLandingPageUnexpectedTreatmentTypeError",
  searchLandingMissingSortIdError: "SearchLandingMissingSortIdError",
  missingSortIdDefault: -1,
  numberOfTilesPerCarousel: 5,
};

export const sortDetailPage = {
  mismatchedGamesSortMergeError: "MismatchedGamesSortMergeError",
  mismatchedSongsSortMergeError: "MismatchedSongsSortMergeError",
};

export const userSignal = {
  ExplicitFeedbackUnexpectedAppPageCounterEvent: "ExplicitFeedbackUnexpectedAppPage",
  ExplicitFeedbackMissingAppPageCounterEvent: "ExplicitFeedbackMissingAppPage",
  ExplicitFeedbackMissingTopicIdCounterEvent: "ExplicitFeedbackMissingTopicId",
  ExplicitFeedbackUserSignalFailedCounterEvent: "ExplicitFeedbackUserSignalFailed",
  ExplicitFeedbackSignalStateRevertFailedDueToMissingToggle:
    "ExplicitFeedbackSignalStateRevertFailedDueToMissingToggle",
  ExplicitFeedbackDisabledDueToMissingSetter: "ExplicitFeedbackDisabledDueToMissingSetter",
  HiddenStateUndoFailedDueToMissingSetter: "HiddenStateUndoFailedDueToMissingSetter",
};

export const errorContainer = {
  retryText: "Action.Retry", // CommonUI.Controls
  somethingWentWrongText: "Response.SomethingWentWrong", // CommonUI.Messages
};

export const gameTile = {
  UnsupportedMenuItemCounterEvent: "UnsupportedMenuItem",
  ReportAdDisabledDueToMissingEncryptedAdTrackingData:
    "ReportAdDisabledDueToMissingEncryptedAdTrackingData",
};

export const gameGuidelines = {
  UnexpectedIgrsRatingCounterEvent: "UnexpectedIgrsRating",
};

export default {
  homePage,
  gamesPage,
  gameDetailsPage,
  errorContainer,
  common,
  gameGuidelines,
};
