import { useQuery } from "@tanstack/react-query";
import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-scripts/http";
import { UrlConfig } from "@rbx/core-scripts/http";

export type GameDetailsResponse = {
  id: number;
  rootPlaceId?: number;
  name: string;
  description?: string;
  playing: number;
  visits?: number;
  canonicalUrlPath?: string;
  creator?: {
    id: number;
    name: string;
    type: string;
    hasVerifiedBadge?: boolean;
  };
};

type GetGamesResponse = {
  data: GameDetailsResponse[];
};

async function fetchGamesByUniverseIds(universeIds: number[]): Promise<GameDetailsResponse[]> {
  const uniqueUniverseIds = Array.from(new Set(universeIds));
  const urlConfig: UrlConfig = {
    url: `${environmentUrls.gamesApi}/v1/games?universeIds=${uniqueUniverseIds.join(",")}`,
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

  return universeIds
    .map(universeId => gamesByUniverseId.get(universeId))
    .filter((game): game is GameDetailsResponse => game !== undefined);
}

export function useGamesByUniverseIds(universeIds: number[]) {
  return useQuery({
    queryKey: ["gamesByUniverseIds", universeIds],
    queryFn: () => fetchGamesByUniverseIds(universeIds),
    enabled: universeIds.length > 0,
  });
}

export type GameVotesResponse = {
  id: number;
  upVotes: number;
  downVotes: number;
};

type GetGameVotesResponse = {
  data: GameVotesResponse[];
};

async function fetchGameVotesByUniverseIds(universeIds: number[]): Promise<GameVotesResponse[]> {
  const uniqueUniverseIds = Array.from(new Set(universeIds));
  const urlConfig: UrlConfig = {
    url: `${environmentUrls.gamesApi}/v1/games/votes?universeIds=${uniqueUniverseIds.join(",")}`,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await http.get<GetGameVotesResponse>(urlConfig);
  return response.data.data;
}

export function useGameVotesByUniverseIds(universeIds: number[]) {
  return useQuery({
    queryKey: ["gameVotesByUniverseIds", universeIds],
    queryFn: () => fetchGameVotesByUniverseIds(universeIds),
    enabled: universeIds.length > 0,
  });
}
