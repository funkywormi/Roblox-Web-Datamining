import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { getGameDetailsByUniverseIds, GameDetailsResponse } from "../services/gamesService";

const useGameDetailsByUniverseIds = (universeIds: number[]) => {
  const queryClient = useQueryClient();

  const normalizedUniverseIds = useMemo(
    () => [...new Set(universeIds)].sort((left, right) => left - right),
    [universeIds],
  );

  const query = useQuery<Map<number, GameDetailsResponse | null>>({
    retry: 1,
    queryKey: ["game-details-bulk", normalizedUniverseIds],
    queryFn: async () => {
      const cachedEntries = normalizedUniverseIds.flatMap(universeId => {
        const gameDetails = queryClient.getQueryData<GameDetailsResponse>([
          "game-details",
          universeId,
        ]);

        return gameDetails !== undefined ? [[universeId, gameDetails] as const] : [];
      });

      const cachedGameDetails = new Map<number, GameDetailsResponse>(cachedEntries);

      const missingUniverseIds = normalizedUniverseIds.filter(
        universeId => !cachedGameDetails.has(universeId),
      );

      if (missingUniverseIds.length === 0) {
        return cachedGameDetails;
      }

      const fetchedGameDetails = await getGameDetailsByUniverseIds(missingUniverseIds);

      const nullGameDetails = new Map<number, GameDetailsResponse | null>();
      for (const universeId of missingUniverseIds) {
        const gameDetails = fetchedGameDetails.get(universeId);
        if (gameDetails) {
          queryClient.setQueryData(["game-details", universeId], gameDetails);
        } else {
          // cache null for universeIds that are missing from the response to avoid refetching on every render
          nullGameDetails.set(universeId, null);
          queryClient.setQueryData(["game-details", universeId], null);
        }
      }

      return new Map<number, GameDetailsResponse | null>([
        ...cachedGameDetails,
        ...fetchedGameDetails,
        ...nullGameDetails,
      ]);
    },
    enabled: normalizedUniverseIds.length > 0,
    refetchOnWindowFocus: false,
  });

  return query;
};

export default useGameDetailsByUniverseIds;
