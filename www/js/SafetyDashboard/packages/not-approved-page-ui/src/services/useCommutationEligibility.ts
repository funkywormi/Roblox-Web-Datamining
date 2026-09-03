import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useNotApprovedUIConfig } from "../providers/NotApprovedUIProvider";
import { CommutationEligibility } from "../utils/types";

/**
 * A hook that fetches the commutation eligibility data for a user.
 * Currently, we use this to check if the user is eligible for a second chance pass
 * (educational pass).
 */
const useCommutationEligibility = (): UseQueryResult<CommutationEligibility> => {
  const { httpGet, apiGatewayUrl } = useNotApprovedUIConfig();

  return useQuery<CommutationEligibility>({
    queryKey: ["commutation-eligibility"],
    queryFn: async () => {
      try {
        return await httpGet<CommutationEligibility>(
          `${apiGatewayUrl}/moderation-appeal-service/v2/consequence-commutation-eligibility`,
        );
      } catch (_error) {
        // If the request fails, default to not being eligible for any commutation.
        return {
          educational_pass_eligible: false,
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export default useCommutationEligibility;
