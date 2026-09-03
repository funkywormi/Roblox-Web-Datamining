import { useMemo } from "react";
import { TGameData, TLayoutMetadata } from "../types/bedev1Types";

export const getGameLayoutData = (
  gameData: TGameData,
  topicId?: string,
): TLayoutMetadata | undefined => {
  const baseLayoutData =
    gameData.layoutDataBySort && topicId !== undefined && gameData.layoutDataBySort[topicId]
      ? gameData.layoutDataBySort[topicId]
      : gameData.defaultLayoutData;

  // gameData.tileBadgesByPosition comes from the game data's contentMetadata
  // and is used to override the badge data in layoutDataBySort/defaultLayoutData
  // to support the ads usecase where the same game could appear twice in the
  // same sort (once sponsored and once not).
  if (gameData.tileBadgesByPosition) {
    return {
      ...(baseLayoutData ?? {}),
      tileBadgesByPosition: gameData.tileBadgesByPosition,
    };
  }

  return baseLayoutData;
};

const useGetGameLayoutData = (
  gameData: TGameData,
  topicId?: string,
): TLayoutMetadata | undefined => {
  return useMemo(() => {
    return getGameLayoutData(gameData, topicId);
  }, [gameData, topicId]);
};

export default useGetGameLayoutData;
