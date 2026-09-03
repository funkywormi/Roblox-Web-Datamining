import { TGameData } from "../../common/types/bedev1Types";
import { extractTileBadgesByPositionFromContentMetadata } from "../../common/utils/gameTileLayoutUtils";

export const mapGameRecommendationGames = (games: TGameData[]): TGameData[] =>
  games.map(game => {
    const tileBadgesByPosition = extractTileBadgesByPositionFromContentMetadata(
      game.contentMetadata,
    );
    return tileBadgesByPosition ? { ...game, tileBadgesByPosition } : game;
  });

export default {
  mapGameRecommendationGames,
};
