import { ExperimentationService } from 'Roblox';

export const getABTestEnrollment = (
  layerName: string
): Promise<{
  [parameter: string]: unknown;
}> => {
  const ixpPromise = ExperimentationService.getAllValuesForLayer(layerName);
  ixpPromise
    .then(() => {
      ExperimentationService.logLayerExposure(layerName);
    })
    .catch(() => {
      console.warn('Could not fetch IXP values');
    });
  return ixpPromise;
};

export default getABTestEnrollment;
