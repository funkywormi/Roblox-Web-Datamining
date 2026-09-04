import { useEffect, useState } from 'react';
import { ExperimentationService } from 'Roblox';

const getExperimentsForLayer = async (
  experimentLayer: string
): Promise<{ [parameter: string]: unknown }> => {
  if (ExperimentationService?.getAllValuesForLayer) {
    const ixpResult = await ExperimentationService.getAllValuesForLayer(experimentLayer);
    return ixpResult;
  }
  return {};
};

const useExperiments = (
  experimentLayer: string
): { [experimentName: string]: unknown } & { isLoading: boolean } => {
  const [ixpResult, setIxpResult] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getExperimentsForLayer(experimentLayer).then(
      function success(data) {
        setIxpResult(data);
        setIsLoading(false);
      },
      function error() {
        // return empty object if call to experimentation service fails
        // this behaves as if user is not enrolled in any experiment
        setIxpResult({});
        setIsLoading(false);
      }
    );
  }, [experimentLayer]);

  // Return an object that includes all experiment values plus isLoading
  // This maintains backward compatibility while adding the loading state
  return { ...ixpResult, isLoading };
};

export default useExperiments;
