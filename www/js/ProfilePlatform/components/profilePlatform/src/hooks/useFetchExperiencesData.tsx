import { useMemo } from "react";
import type { TGameData } from "@rbx/discovery-common";
import {
  useGamesByUniverseIds,
  useGameVotesByUniverseIds,
  GameDetailsResponse,
  GameVotesResponse,
} from "../services/gamesService";

// TGameData has no `visits`; the Experiences slideshow panel shows Active + Visits (grid tiles do not),
// so carry visits alongside. GameTile takes the base TGameData and ignores the extra field.
export type TExperienceGameData = TGameData & { visits?: number; description?: string };

type FetchExperiencesDataResponse = {
  games: TExperienceGameData[];
  isLoading: boolean;
  isError: boolean;
};

type HydratedExperienceGame = GameDetailsResponse & {
  rootPlaceId: number;
  creator: NonNullable<GameDetailsResponse["creator"]>;
};

const useFetchExperiencesData = (universeIds: number[]): FetchExperiencesDataResponse => {
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
        (game): game is HydratedExperienceGame => game.rootPlaceId != null && game.creator != null,
      )
      .map<TExperienceGameData>(game => ({
        universeId: game.id,
        placeId: game.rootPlaceId,
        name: game.name,
        description: game.description,
        playerCount: game.playing,
        visits: game.visits,
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

export default useFetchExperiencesData;
