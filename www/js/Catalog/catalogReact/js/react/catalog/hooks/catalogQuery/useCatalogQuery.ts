import { useCallback, useEffect, useState } from 'react';
import {
  Category,
  Creator,
  CurrencyType,
  SalesTypeFilter,
  Topic,
  SortAggregation,
  SortOption,
  Subcategory
} from '../../constants/types';
import { CatalogQuery } from './catalogQuery.types';
import { createCatalogQuery } from './catalogQueryHelper';
import { SearchOptionsData } from '../searchOptions/searchOptions.types';
import catalogConstants from '../../constants/catalogConstants';
import useCountCatalogQueryDifferences from './useCountCatalogQueryDifferences';

function useCatalogQuery(
  searchOptionsData: SearchOptionsData,
  setKeywordForDisplay: (keyword: string) => void
) {
  const [catalogQuery, setCatalogQuery] = useState<CatalogQuery>({
    topics: []
  });

  const numberOfAppliedFilters = useCountCatalogQueryDifferences(catalogQuery, searchOptionsData);

  const [isCatalogQueryInitialized, setIsCatalogQueryInitialized] = useState<boolean>(false);

  const setCategory = (category: Category | undefined) => {
    const topicBasedBrowsingEnabledForCategory: boolean =
      category === undefined
        ? false
        : catalogConstants.topics.categoriesToShowTopics.includes(category?.categoryId);

    setCatalogQuery(currentState => ({
      ...currentState,
      category,
      topicBasedBrowsingEnabledForCategory
    }));
  };

  const setSubcategory = (subcategory: Subcategory | null | undefined) => {
    setCatalogQuery(currentState => ({ ...currentState, subcategory, cursor: undefined }));
  };

  const setSortType = (sortType: SortOption | undefined) => {
    setCatalogQuery(currentState => ({ ...currentState, sortType, cursor: undefined }));
  };

  const setSortAggregation = (sortAggregation: SortAggregation | undefined) => {
    setCatalogQuery(currentState => ({ ...currentState, sortAggregation, cursor: undefined }));
  };

  const setCreator = (creator: Creator | null | undefined) => {
    setCatalogQuery(currentState => ({ ...currentState, creator, cursor: undefined }));
  };

  const setCreatorName = (creatorName: string | null | undefined) => {
    setCatalogQuery(currentState => ({
      ...currentState,
      creatorName,
      cursor: undefined
    }));
  };

  const setCurrencyType = (currencyType: CurrencyType | null | undefined) => {
    setCatalogQuery(currentState => ({ ...currentState, currencyType, cursor: undefined }));
  };

  const setMinPrice = (minPrice: number | null | undefined) => {
    setCatalogQuery(currentState => ({ ...currentState, minPrice, cursor: undefined }));
  };

  const setMaxPrice = (maxPrice: number | null | undefined) => {
    setCatalogQuery(currentState => ({ ...currentState, maxPrice, cursor: undefined }));
  };

  const setSalesTypeFilter = (salesTypeFilter: SalesTypeFilter | undefined) => {
    setCatalogQuery(currentState => ({ ...currentState, salesTypeFilter, cursor: undefined }));
  };

  const setIncludeNotForSale = (includeNotForSale: boolean | undefined) => {
    setCatalogQuery(prev => ({ ...prev, includeNotForSale, cursor: undefined }));
  };

  const setSelectedTopics = (topics: Topic[]) => {
    setCatalogQuery(prev => ({ ...prev, topics, cursor: undefined }));
  };

  const setKeyword = (keyword: string | null | undefined) => {
    setCatalogQuery(prev => ({ ...prev, keyword, cursor: undefined }));
    setKeywordForDisplay(keyword || '');
  };

  const setCursor = (cursor: string | undefined) => {
    setCatalogQuery(prev => ({ ...prev, cursor }));
  };

  const initializeCatalogQuery = useCallback(
    (searchOptions: SearchOptionsData, ignoreSearchParams?: boolean): CatalogQuery => {
      // Set query values based on the URL inputs || defaults
      const newCatalogQuery = createCatalogQuery(searchOptions, ignoreSearchParams);

      setCatalogQuery(newCatalogQuery);
      setIsCatalogQueryInitialized(true);

      return newCatalogQuery;
    },
    []
  );

  useEffect(() => {
    const { defaultSortValue } = searchOptionsData;
    const { currencyType, sortType } = catalogQuery;

    if (currencyType && currencyType.excludePriceSorts && sortType && sortType.isPriceRelated) {
      setSortType(defaultSortValue);
    }
  }, [catalogQuery, searchOptionsData]);

  useEffect(() => {
    const { defaultCategoryId, freeFilterId, defaultCurrencyType } = searchOptionsData;
    const { category, currencyType } = catalogQuery;

    if (category) {
      if (
        category.categoryId === defaultCategoryId &&
        currencyType &&
        currencyType.currencyType === freeFilterId
      ) {
        setCurrencyType(defaultCurrencyType);
      }
    }
  }, [catalogQuery, searchOptionsData]);

  return {
    setCategory,
    setSubcategory,
    setCreator,
    setCreatorName,
    setCurrencyType,
    setMinPrice,
    setMaxPrice,
    setIncludeNotForSale,
    setSalesTypeFilter,
    setSortType,
    setSortAggregation,
    setSelectedTopics,
    setKeyword,
    setCursor,

    numberOfAppliedFilters,
    catalogQuery,
    isCatalogQueryInitialized,
    keyword: catalogQuery.keyword,

    initializeCatalogQuery
  };
}

export default useCatalogQuery;
