import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import ExperimentationService from "@rbx/experimentation";
import configConstants from "../constants/configConstants";

/**
 * General hook that fetches all IXP values for a given layer
 * Accepts default values to fall back on if the IXP values are not found,
 * and which do not affect the cache key
 */
const useExperimentValues = <T extends Record<string, unknown>>(
  layerName: string,
  defaultValues: T,
): { ixpData: T; isLoading: boolean } => {
  const { data, isLoading } = useQuery({
    queryKey: [`ixp/${layerName}`],
    queryFn: async () => {
      try {
        return await ExperimentationService.getAllValuesForLayer(layerName);
      } catch {
        window.EventTracker?.fireEvent(configConstants.common.FetchExperimentationLayerValuesError);
        return {};
      }
    },
    staleTime: Infinity, // IXP data doesn't change frequently
  });

  return useMemo(
    () => ({
      // fallback to default values for any missing values
      ixpData: { ...defaultValues, ...data } as T,
      isLoading,
    }),
    [data, defaultValues, isLoading],
  );
};

export default useExperimentValues;
