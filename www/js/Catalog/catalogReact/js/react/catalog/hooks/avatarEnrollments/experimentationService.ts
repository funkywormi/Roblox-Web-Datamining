import { ExperimentationService } from 'Roblox';
import { useCallback } from 'react';

function useExperimentationService() {
  const getABTestEnrollment = useCallback(
    async <T extends { [parameter: string]: unknown }>(
      projectId: number,
      layerName: string,
      parameters: {}
    ): Promise<T> => {
      const ixpPromise: Promise<T> = ExperimentationService.getAllValuesForLayer(
        layerName
      ) as Promise<T>;
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      ixpPromise.then(() => {
        ExperimentationService.logLayerExposure(layerName);
      });
      return ixpPromise;
    },
    []
  );

  return { getABTestEnrollment };
}

export default useExperimentationService;
