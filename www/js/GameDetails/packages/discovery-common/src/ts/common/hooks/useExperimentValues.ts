import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import ExperimentationService, { type ExperimentationInputs } from "@rbx/experimentation";
import configConstants from "../constants/configConstants";

type UseExperimentValuesOptions = {
  inputs?: ExperimentationInputs;
  enabled?: boolean;
};

/**
 * General hook that fetches all IXP values for a given layer
 * Accepts default values to fall back on if the IXP values are not found,
 * and which do not affect the cache key
 */
const useExperimentValues = <T extends Record<string, unknown>>(
  layerName: string,
  defaultValues: T,
  options?: UseExperimentValuesOptions,
): { ixpData: T; isLoading: boolean } => {
  const { inputs, enabled = true } = options ?? {};
  const { data, isLoading } = useQuery({
    queryKey: inputs ? [`ixp/${layerName}`, inputs] : [`ixp/${layerName}`],
    queryFn: async () => {
      try {
        return inputs
          ? await ExperimentationService.getAllValuesForLayer(layerName, undefined, inputs)
          : await ExperimentationService.getAllValuesForLayer(layerName);
      } catch {
        window.EventTracker?.fireEvent(configConstants.common.FetchExperimentationLayerValuesError);
        return {};
      }
    },
    enabled,
    staleTime: Infinity, // IXP data doesn't change frequently
  });

  return useMemo(
    () => ({
      // fallback to default values for any missing values
      ixpData: { ...defaultValues, ...data } as T,
      isLoading: enabled && isLoading,
    }),
    [data, defaultValues, enabled, isLoading],
  );
};

export default useExperimentValues;
