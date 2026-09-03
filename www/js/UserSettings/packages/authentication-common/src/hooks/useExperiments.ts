import { useEffect, useState } from "react";
import ExperimentationService from "@rbx/experimentation";

const getExperimentsForLayer = async (
  experimentLayer: string,
): Promise<Record<string, unknown>> => {
  const ixpResult = await ExperimentationService.getAllValuesForLayer(experimentLayer);
  return ixpResult;
};

const useExperiments = (
  experimentLayer: string,
): Record<string, unknown> & { isLoading: boolean } => {
  const [ixpResult, setIxpResult] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getExperimentsForLayer(experimentLayer).then(
      data => {
        setIxpResult(data);
        setIsLoading(false);
      },
      () => {
        // return empty object if call to experimentation service fails
        // this behaves as if user is not enrolled in any experiment
        setIxpResult({});
        setIsLoading(false);
      },
    );
  }, [experimentLayer]);

  // Return an object that includes all experiment values plus isLoading
  // This maintains backward compatibility while adding the loading state
  return { ...ixpResult, isLoading };
};

export default useExperiments;
