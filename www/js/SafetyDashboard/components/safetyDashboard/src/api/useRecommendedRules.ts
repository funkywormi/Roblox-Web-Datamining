import { useQuery } from "@tanstack/react-query";
import * as http from "@rbx/core-scripts/http";
import type { RecommendedRule } from "../types/api";
import { RECOMMENDED_RULES_URL } from "../shared/url";
import { RECOMMENDED_RULES_QUERY_KEY } from "./queryKeys";

/**
 * Fetches the user's personalized educational content (recommended rules). The backend
 * currently returns six rules ordered by priority based on the user's violation history.
 */
const useRecommendedRules = () => {
  return useQuery<RecommendedRule[], Error>({
    queryKey: [RECOMMENDED_RULES_QUERY_KEY],
    queryFn: async () => {
      const response = await http.get<RecommendedRule[]>({
        url: RECOMMENDED_RULES_URL,
        withCredentials: true,
      });

      return response.data;
    },
    retry: false,
  });
};

export default useRecommendedRules;
