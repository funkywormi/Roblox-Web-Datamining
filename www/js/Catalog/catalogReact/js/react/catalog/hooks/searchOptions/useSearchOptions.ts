import { useEffect, useState } from 'react';
import CatalogAPIService from '../../services/catalogAPIService';
import { SearchOptionsData } from './searchOptions.types';
import getSearchOptions from './searchOptionsHelper';

function useSearchOptions(
  isMetadataInitialized: boolean
): {
  searchOptions: SearchOptionsData;
} {
  const [searchOptions, setSearchOptions] = useState<SearchOptionsData>({
    isSearchOptionsLoaded: false,
    creators: [],
    customText: 'custom'
  });

  const fetchSearchOptions = () => {
    CatalogAPIService.getNavigationMenuItems()
      .then(function success(result) {
        const generatedSearchOptions: SearchOptionsData = getSearchOptions(result.data);
        setSearchOptions({
          ...generatedSearchOptions,
          isSearchOptionsLoaded: true,
          hasSearchOptionsError: false
        });
      })
      .catch(() => {
        setSearchOptions(prev => ({
          ...prev,
          isSearchOptionsLoaded: true,
          hasSearchOptionsError: true
        }));
      });
  };

  useEffect(() => {
    if (isMetadataInitialized) {
      fetchSearchOptions();
    }
  }, [isMetadataInitialized]);

  return {
    searchOptions
  };
}

export default useSearchOptions;
