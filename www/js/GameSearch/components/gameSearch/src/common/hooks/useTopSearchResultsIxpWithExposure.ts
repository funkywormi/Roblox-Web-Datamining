import { useEffect, useRef } from "react";
import ExperimentationService from "@rbx/experimentation";

import { TOP_SEARCH_RESULTS_LAYER_NAME } from "../constants/ixpConstants";

export const useTopSearchResultsIxpWithExposure = (): void => {
  const hasLoggedExposure = useRef(false);

  useEffect(() => {
    if (hasLoggedExposure.current) {
      return;
    }

    hasLoggedExposure.current = true;
    ExperimentationService.getAllValuesForLayer(TOP_SEARCH_RESULTS_LAYER_NAME)
      .then(values => {
        if (Object.keys(values).length > 0) {
          ExperimentationService.logLayerExposure(TOP_SEARCH_RESULTS_LAYER_NAME);
        }
      })
      .catch(() => {
        hasLoggedExposure.current = false;
      });
  }, []);
};
