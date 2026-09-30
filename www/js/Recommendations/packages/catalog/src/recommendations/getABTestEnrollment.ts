import ExperimentationService from "@rbx/experimentation";

const getABTestEnrollment = async <T extends Record<string, unknown>>(
  projectId: number,
  layerName: string,
  parameters: {},
): Promise<T> => {
  const ixpPromise: Promise<T> = ExperimentationService.getAllValuesForLayer(
    layerName,
  ) as Promise<T>;
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  ixpPromise.then(() => {
    ExperimentationService.logLayerExposure(layerName);
  });
  return ixpPromise;
};

export default getABTestEnrollment;
