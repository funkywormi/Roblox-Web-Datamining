import { useQuery } from "@tanstack/react-query";
import playButtonService from "../services/playButtonService";
import { TAgeGuidelinesResponse } from "../types/playButtonTypes";

const AGE_RECOMMENDATION_QUERY_KEY = "ageRecommendation";

/**
 * Fetches age recommendation data for a universe.
 *
 * @param universeId - Universe ID to fetch age recommendation data for
 * @param shouldDisableQuery - If true, skip fetching and return a non-loading (idle) state
 */
const useAgeRecommendationDataForUniverseId = (
  universeId: string,
  shouldDisableQuery = false,
): {
  ageRecommendationData: TAgeGuidelinesResponse | undefined;
  hasError: boolean;
  isLoading: boolean;
} => {
  const isQueryEnabled = Boolean(universeId) && !shouldDisableQuery;

  const {
    data: ageRecommendationData,
    isError: hasError,
    isLoading: isLoadingAgeRecommendation,
  } = useQuery<TAgeGuidelinesResponse>({
    queryKey: [AGE_RECOMMENDATION_QUERY_KEY, universeId],
    queryFn: () => playButtonService.getAgeRecommendation(universeId),
    enabled: isQueryEnabled,
  });

  return {
    ageRecommendationData,
    hasError,
    isLoading: isQueryEnabled && isLoadingAgeRecommendation,
  };
};

export default useAgeRecommendationDataForUniverseId;
