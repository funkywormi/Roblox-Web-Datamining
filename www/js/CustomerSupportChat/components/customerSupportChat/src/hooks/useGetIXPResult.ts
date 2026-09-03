import { useQuery, UseQueryResult } from "@tanstack/react-query";
import ExperimentationService from "@rbx/experimentation";

// This hook fetches the IXP result for a given experiment layer and parameter name.
export default function useGetIXPResult(
  experimentLayer: string,
  parameterName: string,
): UseQueryResult {
  return useQuery({
    queryKey: ["rbxIXPResult", experimentLayer, parameterName],
    queryFn: async () => {
      const ixpResult = await ExperimentationService.getAllValuesForLayer(experimentLayer);
      if (!ixpResult || !(parameterName in ixpResult)) {
        return null;
      }
      return ixpResult[parameterName];
    },
  });
}
