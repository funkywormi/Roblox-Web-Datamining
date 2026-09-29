import { useCallback, useEffect, useRef } from 'react';
import { ExperimentationService } from 'Roblox';

// A sighting can arrive before the values do, so it waits rather than dropping the exposure.
const useLayerExposure = (layerName: string, hasValues: boolean): (() => void) => {
  const hasLogged = useRef(false);
  const isPending = useRef(false);

  const send = useCallback(() => {
    if (hasLogged.current) return;
    hasLogged.current = true;
    ExperimentationService.logLayerExposure(layerName);
  }, [layerName]);

  useEffect(() => {
    if (hasValues && isPending.current) {
      isPending.current = false;
      send();
    }
  }, [hasValues, send]);

  return useCallback(() => {
    if (!hasValues) {
      isPending.current = true;
      return;
    }
    send();
  }, [hasValues, send]);
};

export default useLayerExposure;
