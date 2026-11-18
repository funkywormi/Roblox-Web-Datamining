import { useQuery } from "@tanstack/react-query";
import Intl from "@rbx/core-scripts/intl";
import bedev1Services from "../../common/services/bedev1Services";
import { TGetGameDetails } from "../../common/types/bedev1Types";

export const gameDetailsQueryOptions = (universeId: string) => ({
  queryKey: ["getGameDetails", universeId],
  queryFn: () => bedev1Services.getGameDetails(universeId, new Intl().getRobloxLocale()),
});

const useGameDetailsForUniverseId = (
  universeId: string,
): {
  gameDetails: TGetGameDetails | undefined;
  hasError: boolean;
  isFetching: boolean;
} => {
  const {
    data: gameDetails,
    isError: hasError,
    isFetching,
  } = useQuery({
    ...gameDetailsQueryOptions(universeId),
  });

  return { gameDetails, hasError, isFetching };
};

export default useGameDetailsForUniverseId;
