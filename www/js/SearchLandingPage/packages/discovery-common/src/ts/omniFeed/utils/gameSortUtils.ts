import { EventStreamMetadata } from "../../common/constants/eventStreamConstants";
import { TGameData } from "../../common/types/bedev1Types";
import {
  TExploreApiFiltersSort,
  TExploreApiFiltersSortResponse,
  TExploreApiGameSort,
  TExploreApiGameSortResponse,
  TExploreApiSongsSortResponse,
  TExploreApiSongsSort,
  TExploreApiSort,
  TExploreApiSortResponse,
  TExploreApiSorts,
  TExploreApiSortsResponse,
  TExploreApiSearchPillsSort,
  TExploreApiSearchPillsSortResponse,
  TGameSort,
  TOmniRecommendationGame,
  TOmniRecommendationGameSort,
  TOmniRecommendationsContentMetadata,
  TOmniRecommendationSduiSort,
  TOmniRecommendationSort,
  TTreatmentType,
} from "../../common/types/bedev2Types";
import { sortDetailPage } from "../../common/constants/configConstants";
import {
  TOmniRecommendationAnalyticsData,
  TUniverseIdToAnalyticsDataMap,
} from "../../common/types/analyticsTypes";
import { extractTileBadgesByPositionFromContentMetadata } from "../../common/utils/gameTileLayoutUtils";

export const hydrateOmniRecommendationGames = (
  recommendations: TOmniRecommendationGame[] | null,
  contentMetadata: TOmniRecommendationsContentMetadata | null,
): TGameData[] => {
  return (recommendations ?? [])
    .map(
      ({
        contentType,
        contentId,
        contentMetadata: recommendationContentMetadata,
      }: TOmniRecommendationGame) => {
        const data = contentMetadata?.[contentType]?.[contentId];
        if (data) {
          const gameData = { ...data } as TGameData;

          const nativeAdData = recommendationContentMetadata?.EncryptedAdTrackingData;
          gameData.isSponsored = nativeAdData != null && nativeAdData.length > 0;
          gameData.nativeAdData = nativeAdData;
          gameData.payerName = recommendationContentMetadata?.PayerName;

          if (
            recommendationContentMetadata?.PlaceIdOverride &&
            !isNaN(Number(recommendationContentMetadata.PlaceIdOverride))
          ) {
            gameData.placeIdOverride = Number(recommendationContentMetadata.PlaceIdOverride);
          }
          if (recommendationContentMetadata?.LaunchDataOverride) {
            gameData.launchDataOverride = recommendationContentMetadata.LaunchDataOverride;
          }

          const primaryWideImageAssetId = recommendationContentMetadata?.PrimaryWideImageAssetId;
          const primaryWideImageListId = recommendationContentMetadata?.PrimaryWideImageListId;
          const primaryWideVideoAssetId = recommendationContentMetadata?.PrimaryWideVideoAssetId;

          if (primaryWideImageAssetId || primaryWideImageListId || primaryWideVideoAssetId) {
            gameData.contentMetadataMediaAsset = {
              ...(primaryWideImageAssetId ? { wideImageAssetId: primaryWideImageAssetId } : {}),
              ...(primaryWideImageListId ? { wideImageListId: primaryWideImageListId } : {}),
              ...(primaryWideVideoAssetId ? { wideVideoAssetId: primaryWideVideoAssetId } : {}),
            };
          }

          const tileBadgesByPosition = extractTileBadgesByPositionFromContentMetadata(
            recommendationContentMetadata,
          );
          if (tileBadgesByPosition) {
            gameData.tileBadgesByPosition = tileBadgesByPosition;
          }

          return gameData;
        }

        return data;
      },
    )
    .filter(
      (recommendation: TGameData | undefined): recommendation is TGameData =>
        recommendation !== undefined,
    );
};

export const isOmniRecommendationGameSort = (
  gameSort: TGameSort,
): gameSort is TOmniRecommendationGameSort => {
  return "recommendationList" in gameSort;
};

export const isOmniRecommendationSduiSort = (
  sort: TOmniRecommendationSort,
): sort is TOmniRecommendationSduiSort => {
  return sort.treatmentType === TTreatmentType.Sdui;
};

export const isGameSortFromOmniRecommendations = (
  sort: TOmniRecommendationSort,
): sort is TOmniRecommendationGameSort => {
  return "recommendationList" in sort;
};

export const isExploreApiGameSort = (gameSort: TGameSort): gameSort is TExploreApiGameSort => {
  return "games" in gameSort;
};

export const isGameSortFromExploreApi = (sort: TExploreApiSort): sort is TExploreApiGameSort => {
  return "games" in sort;
};

export const isSongSortFromExploreApi = (sort: TExploreApiSort): sort is TExploreApiSongsSort => {
  return "songs" in sort;
};

export const isFilterSortFromExploreApi = (
  sort: TExploreApiSort,
): sort is TExploreApiFiltersSort => {
  return "filters" in sort;
};

export const getHydratedGameData = (
  sort: TGameSort,
  contentMetadata: TOmniRecommendationsContentMetadata | null,
): TGameData[] => {
  if (isOmniRecommendationGameSort(sort)) {
    return hydrateOmniRecommendationGames(sort.recommendationList, contentMetadata);
  }

  if (isExploreApiGameSort(sort)) {
    return sort.games;
  }

  return [];
};

const isExploreApiGameSortResponse = (
  sort: TExploreApiSortResponse,
): sort is TExploreApiGameSortResponse => {
  return "games" in sort;
};

const isExploreApiSongSortResponse = (
  sort: TExploreApiSortResponse,
): sort is TExploreApiSongsSortResponse => {
  return "songs" in sort;
};

const isExploreApiSearchPillsSortResponse = (
  sort: TExploreApiSortResponse,
): sort is TExploreApiSearchPillsSortResponse => {
  return "queries" in sort && sort.treatmentType === TTreatmentType.SearchPillCarousel;
};

export const mapExploreApiGameSortResponse = (
  sort: TExploreApiGameSortResponse,
): TExploreApiGameSort => {
  return {
    topic: sort.sortDisplayName,
    // TODO CLIGROW-2270 Unify gameSetTypeId and sortId across SLP and Charts backend response
    topicId: sort.gameSetTypeId,
    treatmentType: sort.treatmentType,
    games: sort.games.map(game => {
      const tileBadgesByPosition = extractTileBadgesByPositionFromContentMetadata(
        game.contentMetadata,
      );
      return {
        ...game,
        placeId: game.placeId ?? game.rootPlaceId,
        ...(tileBadgesByPosition ? { tileBadgesByPosition } : {}),
      };
    }),
    sortId: sort.sortId,
    gameSetTargetId: sort.gameSetTargetId,
    contentType: sort.contentType,
    nextPageToken: sort.nextPageToken || "",
    subtitle: sort.subtitle,
    topicLayoutData: sort.topicLayoutData,
    appliedFilters: sort.appliedFilters,
  };
};

const mapExploreApiFiltersSortResponse = (
  sort: TExploreApiFiltersSortResponse,
): TExploreApiFiltersSort => {
  return {
    topic: sort.sortDisplayName,
    topicId: sort.gameSetTypeId,
    treatmentType: sort.treatmentType,
    filters: sort.filters,
    sortId: sort.sortId,
    gameSetTargetId: sort.gameSetTargetId,
    contentType: sort.contentType,
    nextPageToken: sort.nextPageToken || "",
    subtitle: sort.subtitle,
    topicLayoutData: sort.topicLayoutData,
  };
};

const mapExploreApiSearchPillsSortResponse = (
  sort: TExploreApiSearchPillsSortResponse,
): TExploreApiSearchPillsSort => {
  return {
    topic: sort.sortDisplayName,
    topicId: sort.gameSetTypeId,
    treatmentType: sort.treatmentType,
    queries: sort.queries,
    sortId: sort.sortId,
    gameSetTargetId: sort.gameSetTargetId,
    contentType: sort.contentType,
    nextPageToken: sort.nextPageToken || "",
    topicLayoutData: sort.topicLayoutData,
  };
};

const mapExploreApiSongSortResponse = (
  sort: TExploreApiSongsSortResponse,
): TExploreApiSongsSort => {
  return {
    topic: sort.sortDisplayName,
    topicId: sort.gameSetTypeId,
    treatmentType: sort.treatmentType,
    songs: sort.songs,
    sortId: sort.sortId,
    gameSetTargetId: sort.gameSetTargetId,
    contentType: sort.contentType,
    nextPageToken: sort.nextPageToken || "",
    subtitle: sort.subtitle,
    topicLayoutData: sort.topicLayoutData,
  };
};

export const mapExploreApiSortResponse = (sort: TExploreApiSortResponse): TExploreApiSort => {
  if (isExploreApiSearchPillsSortResponse(sort)) {
    return mapExploreApiSearchPillsSortResponse(sort);
  }

  if (isExploreApiGameSortResponse(sort)) {
    return mapExploreApiGameSortResponse(sort);
  }

  if (isExploreApiSongSortResponse(sort)) {
    return mapExploreApiSongSortResponse(sort);
  }

  return mapExploreApiFiltersSortResponse(sort);
};

export const mapExploreApiSortsResponse = (data: TExploreApiSortsResponse): TExploreApiSorts => {
  return {
    header: data.header?.sorts
      ? {
          sorts: data.header.sorts.map(sort => mapExploreApiSortResponse(sort)),
          layoutData: data.header.layoutData,
        }
      : undefined,
    sorts: data.sorts.map(sort => mapExploreApiSortResponse(sort)),
    nextSortsPageToken: data.nextSortsPageToken,
  };
};

// The explore API responses contain items in differently named keys depending
// on the response type. For example, the Games sort response has a `games`
// array, whereas the Songs sort response has a `songs` array.
//
// This function exists to help with "load more" scenarios where we need to add
// more results to the existing sort results. In this case, we need to make sure
// the new sort and the previous sort match so we, for example, don't try to
// merge song data with game data
export const joinExploreApiSorts = (
  newSort: TExploreApiSort,
  prevSort: TExploreApiSort,
): TExploreApiSort => {
  if (isGameSortFromExploreApi(prevSort)) {
    if (isGameSortFromExploreApi(newSort)) {
      return {
        ...prevSort,
        games: [...prevSort.games, ...newSort.games],
        nextPageToken: newSort.nextPageToken,
      };
    }
    window.EventTracker?.fireEvent(sortDetailPage.mismatchedGamesSortMergeError);
  }

  if (isSongSortFromExploreApi(prevSort)) {
    if (isSongSortFromExploreApi(newSort)) {
      return {
        ...prevSort,
        songs: [...prevSort.songs, ...newSort.songs],
        nextPageToken: newSort.nextPageToken,
      };
    }
    window.EventTracker?.fireEvent(sortDetailPage.mismatchedSongsSortMergeError);
  }

  return {
    ...prevSort,
    nextPageToken: newSort.nextPageToken,
  };
};

export const getSortTargetId = (sort: TGameSort | undefined): number | undefined => {
  if (sort && isExploreApiGameSort(sort)) {
    return sort.gameSetTargetId;
  }

  return undefined;
};

export const getSortId = (sort: TGameSort | undefined): string | undefined => {
  if (sort && isExploreApiGameSort(sort)) {
    return sort.sortId;
  }

  return undefined;
};

export const getSortTargetIdMetadata = (
  sort: TGameSort | undefined,
):
  | {
      [EventStreamMetadata.GameSetTargetId]: number;
    }
  | {} => {
  const gameSetTargetId = getSortTargetId(sort);

  if (gameSetTargetId !== undefined) {
    return {
      [EventStreamMetadata.GameSetTargetId]: gameSetTargetId,
    };
  }

  return {};
};

/**
 * Get all the header sorts from the previous sorts data and the new sorts data.
 * Only add new sorts to header sorts if nothing has been added to body sorts yet, otherwise ignore incoming header sorts.
 * This is because we don't want to suddenly add sorts to the sticky header as the user scrolls and loads more charts sorts.
 */
export const getAllHeaderSorts = (
  prevSortsData: TExploreApiSorts | undefined,
  newSortsData: TExploreApiSorts,
): TExploreApiSort[] => {
  const previousHeaderSorts = prevSortsData?.header?.sorts;
  const previousBodySorts = prevSortsData?.sorts;

  if (previousBodySorts && previousBodySorts.length > 0) {
    return previousHeaderSorts ?? [];
  }
  return [...(previousHeaderSorts ?? []), ...(newSortsData.header?.sorts ?? [])];
};

/**
 * Extracts the filters from the first filter sort found in the Explore API response
 */
export const extractFiltersFromExploreSorts = (
  sorts: TExploreApiSort[],
): Map<string, string> | undefined => {
  const firstFilterSort = sorts.find(isFilterSortFromExploreApi);

  if (!firstFilterSort) {
    return undefined;
  }

  const filters = new Map<string, string>();

  firstFilterSort.filters.forEach(filter => {
    filters.set(filter.filterType, filter.selectedOptionId);
  });

  return filters;
};

export const getSortAppliedFiltersMetadata = (
  sort: TGameSort | undefined,
): { [EventStreamMetadata.AppliedFilters]: string } | {} => {
  if (sort && isExploreApiGameSort(sort) && sort.appliedFilters) {
    return {
      [EventStreamMetadata.AppliedFilters]: encodeURIComponent(sort.appliedFilters),
    };
  }

  return {};
};

/**
 * Parse the appliedFilters string passed from BE in the format of
 * "filterType=selectedOptionId,filterType=selectedOptionId"
 */
export const parseAppliedFilters = (sort: TGameSort): Record<string, string> => {
  if (isExploreApiGameSort(sort) && sort.appliedFilters) {
    const filtersObj: Record<string, string> = {};

    const allFilters = sort.appliedFilters.split(",");

    allFilters.forEach(filter => {
      const [filterType, filterValue] = filter.split("=");

      if (filterType && filterValue) {
        filtersObj[filterType] = filterValue;
      }
    });

    return filtersObj;
  }

  return {};
};

/**
 * Builds a structured analytics data object that preserves the separation between
 * sort-level and item-level analytics data. This separation is important because
 * sort-level data and item-level data are only merged for events for specific experiences.
 * If the event is for a group of experiences (e.g. game impressions), then the sort-level data
 * is sent as a separate key while the item-level data for each experience is
 * aggregated into arrays.
 */
export const buildOmniRecommendationAnalyticsData = (
  recommendationList: TOmniRecommendationGame[],
  sortAnalyticsData?: Record<string, string>,
): TOmniRecommendationAnalyticsData => {
  const itemLevel: TUniverseIdToAnalyticsDataMap = {};
  recommendationList.forEach(item => {
    itemLevel[item.contentId] = item.analyticsData;
  });

  return {
    sortLevel: sortAnalyticsData ?? {},
    itemLevel,
  };
};

export default {
  hydrateOmniRecommendationGames,
  getHydratedGameData,
  mapExploreApiSortsResponse,
  getSortTargetIdMetadata,
  isGameSortFromOmniRecommendations,
  extractFiltersFromExploreSorts,
};
