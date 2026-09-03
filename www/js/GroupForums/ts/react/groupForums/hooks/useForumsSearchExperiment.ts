import { useEffect, useState } from 'react';
import { ExperimentationService } from 'Roblox';
import { layers } from '../../shared/constants/experimentConstants';

const FORUMS_SEARCH_EXPERIMENT_PARAM = 'IsForumsSearchEnabled';

/**
 * Reads the forums search layer and logs the exposure for both arms. Reading the layer is what
 * enrolls the user, so call this only where the search controls render in treatment.
 */
function useForumsSearchExperiment(enabled: boolean): boolean {
  const [isForumsSearchEnabled, setIsForumsSearchEnabled] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    ExperimentationService.getAllValuesForLayer(layers.forumsSearch)
      .then(response => {
        setIsForumsSearchEnabled(response?.[FORUMS_SEARCH_EXPERIMENT_PARAM] === true);
        if (response && FORUMS_SEARCH_EXPERIMENT_PARAM in response) {
          ExperimentationService.logLayerExposure(layers.forumsSearch);
        }
      })
      .catch(() => {
        setIsForumsSearchEnabled(false);
      });
  }, [enabled]);

  return isForumsSearchEnabled;
}

export default useForumsSearchExperiment;
