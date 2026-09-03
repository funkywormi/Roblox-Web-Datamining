import { useMemo } from "react";
import type { TGameData } from "@rbx/discovery-common";
import {
  useGamesByUniverseIds,
  useGameVotesByUniverseIds,
  GameDetailsResponse,
  GameVotesResponse,
} from "../services/gamesService";

type FetchFavoriteExperiencesDataResponse = {
  games: TGameData[];
  isLoading: boolean;
  isError: boolean;
};

type HydratedFavoriteGame = GameDetailsResponse & {
  rootPlaceId: number;
  creator: NonNullable<GameDetailsResponse["creator"]>;
};

const useFetchFavoriteExperiencesData = (
  universeIds: number[],
): FetchFavoriteExperiencesDataResponse => {
  const { data: detailsData, isLoading, isError } = useGamesByUniverseIds(universeIds);
  const { data: votesData } = useGameVotesByUniverseIds(universeIds);

  return useMemo(() => {
    if (!detailsData) {
      return { games: [], isLoading, isError };
    }

    const votesMap = new Map<number, GameVotesResponse>();
    if (votesData) {
      for (const vote of votesData) {
        votesMap.set(vote.id, vote);
      }
    }

    const games = detailsData
      .filter(
        (game): game is HydratedFavoriteGame => game.rootPlaceId != null && game.creator != null,
      )
      .map<TGameData>(game => ({
        universeId: game.id,
        placeId: game.rootPlaceId,
        name: game.name,
        playerCount: game.playing,
        totalUpVotes: votesMap.get(game.id)?.upVotes,
        totalDownVotes: votesMap.get(game.id)?.downVotes,
        creatorName: game.creator.name,
        creatorType: game.creator.type,
        creatorId: game.creator.id,
        creatorHasVerifiedBadge: game.creator.hasVerifiedBadge,
        canonicalUrlPath: game.canonicalUrlPath,
      }));

    return { games, isLoading, isError };
  }, [detailsData, votesData, isLoading, isError]);
};

export default useFetchFavoriteExperiencesData;
