import experimentationService from "@rbx/experimentation";
import { useCallback } from "react";

function useExperimentationService() {
  const getABTestEnrollment = useCallback(
    async <T extends { [parameter: string]: unknown }>(
      projectId: number,
      layerName: string,
      parameters: {},
    ): Promise<T> => {
      const ixpPromise: Promise<T> = experimentationService.getAllValuesForLayer(
        layerName,
      ) as Promise<T>;
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      ixpPromise.then(() => {
        experimentationService.logLayerExposure(layerName);
      });
      return ixpPromise;
    },
    [],
  );

  return { getABTestEnrollment };
}

export default useExperimentationService;
