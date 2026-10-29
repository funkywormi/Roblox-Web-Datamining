/**
 * Transport parameter names declared by `GameImpressionsV2Event` via
 * `(event.json).parameter_name` in proto-schemas
 * (eventstream/webfrontend/game_impressions_event_v2.proto). Kept as a static
 * list so the generated schema stays out of the bundle; tests compare it against
 * the `@rbx/event-stream-proto` devDependency, so bump that catalog version and
 * update this list together.
 */
export const GAME_IMPRESSIONS_V2_PARAMETER_NAMES: ReadonlySet<string> = new Set([
  "lt",
  "page",
  "ctx",
  "url",
  "gameSetTypeId",
  "sortPos",
  "rootPlaceIds",
  "universeIds",
  "absPositions",
  "adsPositions",
  "homePageSessionInfo",
  "discoverPageSessionInfo",
  "gameSearchSessionInfo",
  "suggestionKwd",
  "friendId",
  "position",
  "emphasisFlag",
  "adIds",
  "adFlags",
  "numberOfLoadedTiles",
  "thumbnailAssetIds",
  "gameSetTargetId",
  "rowsOnPage",
  "positionsInRow",
  "navigationUids",
  "tileBadgeContexts",
  "appliedFilters",
  "thumbnailListIds",
  "searchLandingPageSessionInfo",
  "componentType",
  "footerTextLiterals",
  "footerLocalizationKeys",
  "videoThumbnailAssetIds",
  "positionsInTopic",
  "sortSubId",
  "sourceSortId_arr",
  "newGameEnum_arr",
  "selectedOption",
  "sortId",
  "omniSearchType",
  "searchUuid",
  "spotlightPageSessionInfo",
  "preAuthLandingPageSessionInfo",
  "contentType",
  "interactionUuid",
  "hasSponsoredContent",
]);

/**
 * Keeps only keys that `GameImpressionsV2Event` can parse. Broad SDUI analytics
 * context may contain many more fields; they must not reach the event transport.
 */
export const filterGameImpressionsToV2Schema = <T extends Record<string, unknown>>(
  params: T,
): Partial<T> => {
  const filtered: Record<string, unknown> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && GAME_IMPRESSIONS_V2_PARAMETER_NAMES.has(key)) {
      filtered[key] = value;
    }
  });

  return filtered as Partial<T>;
};
