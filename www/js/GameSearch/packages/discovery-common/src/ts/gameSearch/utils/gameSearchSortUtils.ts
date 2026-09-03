import { TGameData } from "../../common/types/bedev1Types";
import {
  TComponentType,
  TGameSearchSortData,
  TOmniSearchGameDataModel,
} from "../../common/types/bedev2Types";
import { extractTileBadgesByPositionFromContentMetadata } from "../../common/utils/gameTileLayoutUtils";

/**
 * Maps OmniSearch response model to a TGameData by adding the placeId, isShowSponsoredLabel, and contentMetadata properties
 */
export const getSearchResultsGamesList = (games: TOmniSearchGameDataModel[]): TGameData[] => {
  return games.map(game => {
    const gameData: TGameData = {
      ...game,
      placeId: game.rootPlaceId,
      isShowSponsoredLabel: game.isSponsored,
    };
    const { contentMetadata } = game;

    if (contentMetadata?.PlaceIdOverride && !isNaN(Number(contentMetadata.PlaceIdOverride))) {
      gameData.placeIdOverride = Number(contentMetadata.PlaceIdOverride);
    }
    if (contentMetadata?.LaunchDataOverride) {
      gameData.launchDataOverride = contentMetadata.LaunchDataOverride;
    }

    const tileBadgesByPosition = extractTileBadgesByPositionFromContentMetadata(contentMetadata);
    if (tileBadgesByPosition) {
      gameData.tileBadgesByPosition = tileBadgesByPosition;
    }

    return gameData;
  });
};

/**
 * Returns the topicId shared among all games in the search results, or undefined if not valid
 */
export const getGameSearchTopicId = (gameTopicIds: Set<string> | undefined): string | undefined => {
  // Verify that there is only one topicId
  if (!gameTopicIds || gameTopicIds.size !== 1) {
    return undefined;
  }

  return Array.from(gameTopicIds)[0];
};

/**
 * Looks up the componentType in the sorts array topicLayoutData for the given topicId
 */
export const getGameSearchComponentType = (
  topicId: string | undefined,
  sortsData: TGameSearchSortData[] | undefined,
): TComponentType | undefined => {
  // Look for an entry in sorts that corresponds to the topicId
  const sort = sortsData?.find(sortData => sortData.topicId === topicId);

  if (!sort) {
    return undefined;
  }

  return sort.topicLayoutData?.componentType ?? undefined;
};
