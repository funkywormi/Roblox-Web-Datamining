import { RefCallback, useEffect, useRef, useState } from 'react';
import { elementVisibilityService } from 'core-roblox-utilities';

const useVisibilityExposure = <T extends HTMLElement>(
  enabled: boolean,
  exposureKey: string,
  onExposure: () => void
): RefCallback<T> => {
  const [element, setElement] = useState<T | null>(null);
  const loggedExposureKey = useRef<string>();

  useEffect(() => {
    if (!element || !enabled) return undefined;

    return elementVisibilityService.observeVisibility({ element, threshold: 0.75 }, visible => {
      if (visible && loggedExposureKey.current !== exposureKey) {
        loggedExposureKey.current = exposureKey;
        onExposure();
      }
    });
  }, [element, enabled, exposureKey, onExposure]);

  return setElement;
};

export default useVisibilityExposure;
