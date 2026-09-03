import * as http from "@rbx/core-scripts/http";
import { UrlConfig } from "@rbx/core-scripts/http";
import { getGameDetailsUrl } from "../utils/urls";

export type GameDetailsResponse = {
  id: number;
  rootPlaceId?: number;
  name: string;
  playing: number;
  canonicalUrlPath?: string;
  creator: {
    id: number;
    name: string;
    type: string;
    hasVerifiedBadge?: boolean;
  };
};

type GetGamesResponse = {
  data: GameDetailsResponse[];
};

const getGameDetailsByUniverseIds = async (
  universeIds: number[],
): Promise<Map<number, GameDetailsResponse>> => {
  const uniqueUniverseIds = [...new Set(universeIds)];
  const urlConfig: UrlConfig = {
    url: getGameDetailsUrl(uniqueUniverseIds),
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await http.get<GetGamesResponse>(urlConfig);
  const gamesByUniverseId = new Map<number, GameDetailsResponse>();

  for (const game of response.data.data) {
    gamesByUniverseId.set(game.id, game);
  }

  return gamesByUniverseId;
};

export { getGameDetailsByUniverseIds };
