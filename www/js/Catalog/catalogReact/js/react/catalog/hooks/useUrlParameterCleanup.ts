import { useState, useEffect, useCallback } from 'react';
import UtilityService from '../services/utilityService';
import { SearchOptionsData } from './searchOptions/searchOptions.types';
import { CatalogQuery } from './catalogQuery/catalogQuery.types';
import { isQueryParamKey, normalizeQueryParamKey } from '../constants/queryParams.types';

export interface UseUrlParameterCleanupProps {
  searchOptions: SearchOptionsData;
  initializeCatalogQuery: (
    searchOptions: SearchOptionsData,
    ignoreSearchParams?: boolean
  ) => CatalogQuery;
  setKeywordForDisplay: (keyword: string) => void;
  setCreatorNameForDisplay: (creatorName: string) => void;
  setMinPriceForDisplay: (price: number | '') => void;
  setMaxPriceForDisplay: (price: number | '') => void;
}

export interface UseUrlParameterCleanupReturn {
  currentUrl: string;
  setCurrentUrl: (url: string) => void;
  cleanupUrlParameters: () => void;
  constructQueriesFromURL: (ignoreSearchParams?: boolean) => void;
}

/**
 * Custom hook that handles URL parameter cleanup and synchronization
 * Manages URL parameter validation, cleanup, and query construction from URL
 */
export function useUrlParameterCleanup({
  searchOptions,
  initializeCatalogQuery,
  setKeywordForDisplay,
  setCreatorNameForDisplay,
  setMinPriceForDisplay,
  setMaxPriceForDisplay
}: UseUrlParameterCleanupProps): UseUrlParameterCleanupReturn {
  const [currentUrl, setCurrentUrl] = useState(window.location.href);

  const cleanupUrlParameters = useCallback(() => {
    // Clean up URL parameters by removing unused ones
    if (searchOptions.isSearchOptionsLoaded) {
      const searchParams = new URLSearchParams(window.location.search);

      // Check if we should redirect to home by testing the category/taxonomy combination
      const rawQueryParams = UtilityService.getQueriesValueIntoInt(searchParams);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const categoryResult = UtilityService.testCategoryValidityForRedirect(
        rawQueryParams,
        searchOptions
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (categoryResult.shouldRedirectToHome) {
        // Clear all parameters and redirect to clean home page
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        UtilityService.appendQueryParamsToUrl({}, setCurrentUrl);
        return;
      }

      // Check if there are any unknown parameters or incorrectly cased parameters that need to be removed
      let hasUnknownParams = false;
      let hasCaseMismatchParams = false;
      searchParams.forEach((value, key) => {
        if (!isQueryParamKey(key)) {
          hasUnknownParams = true;
        } else {
          // Check if the key needs case normalization
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
          const normalizedKey = normalizeQueryParamKey(key);
          if (normalizedKey && normalizedKey !== key) {
            hasCaseMismatchParams = true;
          }
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const filteredParams = UtilityService.filterUnknownQueryParams(rawQueryParams);

      // Update URL if there are parameters to filter out OR unknown parameters to remove OR case mismatches
      if (
        Object.keys(rawQueryParams).length !== Object.keys(filteredParams).length ||
        hasUnknownParams ||
        hasCaseMismatchParams
      ) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        UtilityService.appendQueryParamsToUrl(filteredParams, setCurrentUrl);
      }
    }
  }, [searchOptions, setCurrentUrl]);

  const constructQueriesFromURL = useCallback(
    (ignoreSearchParams?: boolean) => {
      const newCatalogQuery = initializeCatalogQuery(searchOptions, ignoreSearchParams);
      setKeywordForDisplay(newCatalogQuery.keyword || '');
      setCreatorNameForDisplay(newCatalogQuery.creatorName || '');
      setMinPriceForDisplay(
        newCatalogQuery.minPrice == null || newCatalogQuery.minPrice === undefined
          ? ''
          : newCatalogQuery.minPrice
      );
      setMaxPriceForDisplay(
        newCatalogQuery.maxPrice == null || newCatalogQuery.maxPrice === undefined
          ? ''
          : newCatalogQuery.maxPrice
      );

      // Clean up URL parameters after constructing queries
      if (!ignoreSearchParams) {
        cleanupUrlParameters();
      }
    },
    [
      initializeCatalogQuery,
      searchOptions,
      setCreatorNameForDisplay,
      setKeywordForDisplay,
      setMinPriceForDisplay,
      setMaxPriceForDisplay,
      cleanupUrlParameters
    ]
  );

  // Handle URL changes (back/forward navigation)
  useEffect(() => {
    const handleUrlChange = () => {
      const newUrl = window.location.href;
      if (newUrl !== currentUrl) {
        setCurrentUrl(newUrl);
        constructQueriesFromURL();
      }
    };

    // Listen for the 'popstate' event, which is triggered by changes in the browser's history (e.g., navigating back/forward)
    window.addEventListener('popstate', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [constructQueriesFromURL, currentUrl]);

  // Clean up URL parameters when search options are loaded
  useEffect(() => {
    if (searchOptions.isSearchOptionsLoaded) {
      cleanupUrlParameters();
    }
  }, [searchOptions.isSearchOptionsLoaded, cleanupUrlParameters]);

  return {
    currentUrl,
    setCurrentUrl,
    cleanupUrlParameters,
    constructQueriesFromURL
  };
}

export default useUrlParameterCleanup;
