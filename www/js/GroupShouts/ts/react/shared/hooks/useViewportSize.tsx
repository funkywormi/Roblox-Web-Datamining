import { useCallback, useEffect, useState } from 'react';

type ViewportSizeReturn = {
  isSmallViewport: boolean;
};

const screenSmMax = 991;

const useViewportSize = (): ViewportSizeReturn => {
  const [isSmallViewport, setIsSmallViewport] = useState<boolean>(false);

  const updateBasedOnViewport = useCallback(() => {
    if (window.matchMedia(`(max-width: ${screenSmMax}px)`).matches) {
      if (isSmallViewport) return;
      setIsSmallViewport(true);
    } else {
      if (!isSmallViewport) return;
      setIsSmallViewport(false);
    }
  }, [isSmallViewport]);

  useEffect(() => {
    updateBasedOnViewport();
    window.addEventListener('resize', updateBasedOnViewport);

    return () => window.removeEventListener('resize', updateBasedOnViewport);
  }, [updateBasedOnViewport]);

  return {
    isSmallViewport
  };
};

export default useViewportSize;
