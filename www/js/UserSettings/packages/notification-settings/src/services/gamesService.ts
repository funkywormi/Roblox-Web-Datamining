import * as http from "@rbx/core-scripts/http";
import { getGamesByUniverseIdsUrl } from "../constants/urlConstants";

export type GameDetail = {
  id: number;
  rootPlaceId: number | null;
  name: string;
  creator?: { name: string };
};

type GamesMultigetResponse = {
  data: GameDetail[];
};

const getGamesByUniverseIds = async (universeIds: readonly number[]): Promise<GameDetail[]> => {
  if (universeIds.length === 0) {
    return [];
  }
  const response = await http.get<GamesMultigetResponse>({
    url: getGamesByUniverseIdsUrl(universeIds),
    withCredentials: true,
  });
  return response.data.data;
};

export default {
  getGamesByUniverseIds,
};
