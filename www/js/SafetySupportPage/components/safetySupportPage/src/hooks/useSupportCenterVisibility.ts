import { useState, useEffect } from 'react';
import { getSupportCenterEnabled } from '../services/guacService';

interface UseSupportCenterVisibilityResult {
  isVisible: boolean;
  isLoading: boolean;
}

const useSupportCenterVisibility = (): UseSupportCenterVisibilityResult => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSupportCenterEnabled = async () => {
    setIsLoading(true);
    try {
      const result = await getSupportCenterEnabled();
      setIsVisible(result);
    } finally {
      // if GUAC call fails, don't block showing other options
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line no-void
    void fetchSupportCenterEnabled();
  }, []);

  return { isVisible, isLoading };
};

export default useSupportCenterVisibility;
