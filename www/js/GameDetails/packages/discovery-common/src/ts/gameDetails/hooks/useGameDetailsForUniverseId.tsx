import { useQuery } from "@tanstack/react-query";
import Intl from "@rbx/core-scripts/intl";
import bedev1Services from "../../common/services/bedev1Services";
import { TGetGameDetails } from "../../common/types/bedev1Types";

const queryKey = "getGameDetails";

const useGameDetailsForUniverseId = (
  universeId: string,
): {
  gameDetails: TGetGameDetails | undefined;
  hasError: boolean;
  isFetching: boolean;
} => {
  const languageCode = new Intl().getRobloxLocale();

  const {
    data: gameDetails,
    isError: hasError,
    isFetching,
  } = useQuery({
    queryKey: [queryKey, universeId],
    queryFn: () => bedev1Services.getGameDetails(universeId, languageCode),
  });

  return { gameDetails, hasError, isFetching };
};

export default useGameDetailsForUniverseId;
