import experimentationService from "@rbx/experimentation";

export const getABTestEnrollment = (
  layerName: string,
): Promise<{
  [parameter: string]: unknown;
}> => {
  const ixpPromise = experimentationService.getAllValuesForLayer(layerName);
  ixpPromise
    .then(() => {
      experimentationService.logLayerExposure(layerName);
    })
    .catch(() => {
      console.warn("Could not fetch IXP values");
    });
  return ixpPromise;
};

export default getABTestEnrollment;
