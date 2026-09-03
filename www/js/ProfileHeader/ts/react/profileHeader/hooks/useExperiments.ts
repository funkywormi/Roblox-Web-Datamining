import { useEffect, useState } from 'react';
import { ExperimentationService } from 'Roblox';

type ExperimentParameterValues = { [parameter: string]: unknown } | null;

const getExperimentValuesForLayer = async (
  experimentLayer: string
): Promise<ExperimentParameterValues> => {
  if (ExperimentationService?.getAllValuesForLayer) {
    const ixpResult = await ExperimentationService.getAllValuesForLayer(experimentLayer);
    return ixpResult;
  }
  return {};
};

const useExperiments = (
  experimentLayer: string,
  logExposure = true
): { loading: boolean; data: ExperimentParameterValues } => {
  const [loading, setLoading] = useState(true);
  const [ixpData, setIxpData] = useState<ExperimentParameterValues>(null);

  useEffect(() => {
    getExperimentValuesForLayer(experimentLayer)
      .then(data => {
        setIxpData(data);
      })
      .catch(() => {
        // Return null if call to experimentation service fails.
        // This behaves as if user is not enrolled in any experiment
        setIxpData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [experimentLayer]);

  useEffect(() => {
    if (ixpData && logExposure && ExperimentationService?.logLayerExposure) {
      ExperimentationService.logLayerExposure(experimentLayer);
    }
  }, [logExposure, ixpData, experimentLayer]);

  return { loading, data: ixpData };
};

export default useExperiments;
