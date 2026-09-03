import { useState } from 'react';
import { Layout, SearchItemsError } from '../constants/types';

const useLayoutState = () => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [isSearchItemsLoaded, setIsSearchItemsLoaded] = useState<boolean>(false);
  const [searchItemsError, setSearchItemsError] = useState<SearchItemsError>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [adsInitialized, setAdsInitialized] = useState<boolean>(false);

  const [showError, setShowError] = useState<boolean>();

  const layout: Layout = {
    initialized,
    isSearchItemsLoaded,
    searchItemsError,
    loading,
    adsInitialized,

    showError
  };

  return {
    initialized,
    setInitialized,
    setIsSearchItemsLoaded,
    searchItemsError,
    setSearchItemsError,
    setLoading,
    adsInitialized,
    setAdsInitialized,

    showError,
    setShowError,

    layout
  };
};

export default useLayoutState;
