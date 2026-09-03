import { useCallback, useEffect, useState } from 'react';
import { TranslateFunction } from 'react-utilities';
import { ThumbnailTypes } from 'roblox-thumbnails';
import isEqual from 'lodash/isEqual';
import catalogConstants from '../../constants/catalogConstants';
import {
  AssetsCollection,
  ItemWithDetails,
  Layout,
  Library,
  ModifiedQuery,
  SearchItemsError,
  TItem,
  TItemBasicInfo,
  Topic
} from '../../constants/types';
import CatalogAPIService, {
  ErrorData,
  ItemDetailsInput,
  SearchItemsResponseDataSourceInfo,
  SearchItemsResponseElasticSearchDebugInfo
} from '../../services/catalogAPIService';
import UtilityService from '../../services/utilityService';
import generateQuery from './generateQuery';
import generateQueryParams from './generateQueryParams';
import useMetricsService from '../../services/metricsService';
import usePagination from './usePagination';
import { CatalogQuery } from '../catalogQuery/catalogQuery.types';
import { SearchOptionsData } from '../searchOptions/searchOptions.types';

export type CatalagSearchParams = {
  catalogQuery: CatalogQuery;
  searchOptions: SearchOptionsData;
  isInfiniteScrollDisabled: boolean | undefined;
  library: Library;
  layout: Layout;
  isPaginationEnabled: boolean | undefined;
  keyword: string | null | undefined;
  setCurrentUrl: (v: string) => void;
  setIsKeywordCensored: (v: boolean) => void;
  setIsSearchItemsLoaded: (v: boolean) => void;
  setLayoutInitialized: (v: boolean) => void;
  setSearchItemsError: (v: SearchItemsError) => void;
  setCursor: (v: string) => void;
  setLoading: (v: boolean) => void;
  clearTopics: () => void;
  setTopics: (v: Topic[]) => void;
  translate: TranslateFunction;
};

const useCatalogSearch = (params: CatalagSearchParams) => {
  const {
    catalogQuery,
    searchOptions,
    isInfiniteScrollDisabled,
    library,
    layout,
    isPaginationEnabled,
    keyword,
    setCurrentUrl,
    setIsKeywordCensored,
    setIsSearchItemsLoaded,
    setLayoutInitialized,
    setSearchItemsError,
    setCursor,
    setLoading,
    clearTopics,
    setTopics,
    translate
  } = params;

  const metricsService = useMetricsService();

  const showElasticDebugInfo = sessionStorage.getItem('AXShowElasticDebugInfo');

  const {
    startPaging,
    setStartPaging,
    nextPageCursor,
    setNextPageCursor,
    resetPagination
  } = usePagination();

  const [searchResultDict, setSearchResultDict] = useState<AssetsCollection | null>(null);
  const [searchResultList, setSearchResultList] = useState<string[] | null>(null);
  const [modifiedQuery, setModifiedQuery] = useState<ModifiedQuery | null>(null);

  const clearSearchResults = () => {
    setSearchResultDict(null);
    setSearchResultList([]);
  };

  const resetPageContentAndLoading = useCallback(
    clearResults => {
      setSearchItemsError(null);

      if (clearResults) {
        clearSearchResults();

        if (!startPaging) {
          resetPagination();
        }
      }
    },
    [setSearchItemsError, resetPagination, startPaging]
  );

  const parseElasticSearchDebugInfoV1 = (
    elasticInfo: string | undefined,
    infoMap: Map<string, SearchItemsResponseDataSourceInfo>,
    fieldToUpdate: keyof SearchItemsResponseDataSourceInfo
  ) => {
    try {
      const items = elasticInfo?.split(',');
      items?.forEach(item => {
        try {
          const elements = item.split(':');
          if (elements.length === 4) {
            const key = elements[1];
            const source = elements[2];
            const score = elements[3];
            const scoreAsNumber = Number.parseFloat(score);
            const truncatedScore = scoreAsNumber.toFixed(2);
            const value = `${source}:${truncatedScore}`;
            if (key && value) {
              const trimmedKey = key.trim();
              const trimmedValue = value.trim();
              const existingInfo: SearchItemsResponseDataSourceInfo = infoMap.get(trimmedKey) || {
                dataSource: undefined,
                engagementScore: undefined,
                relevanceScore: undefined
              };
              existingInfo[fieldToUpdate] = trimmedValue;
              infoMap.set(trimmedKey, existingInfo);
            }
          }
        } catch (e) {
          console.error(`Error parsing elasticsearch debug info: ${item}`, e);
        }
      });
    } catch (e) {
      console.error('Error parsing elasticsearch debug info', e);
    }
  };

  const parseElasticSearchDebugInfoV2 = (
    elasticInfo: string | undefined,
    infoMap: Map<string, SearchItemsResponseDataSourceInfo>,
    fieldToUpdate: keyof SearchItemsResponseDataSourceInfo
  ) => {
    try {
      const items = elasticInfo?.split(';');
      items?.forEach(item => {
        try {
          const elements = item.split(':');
          if (elements.length === 3) {
            const key = elements[1];
            const score = elements[2];
            const scoreAsNumber = Number.parseFloat(score);
            const truncatedScore = scoreAsNumber.toFixed(2);
            if (key && truncatedScore) {
              const trimmedKey = key.trim();
              const trimmedValue = truncatedScore.trim();
              const existingInfo: SearchItemsResponseDataSourceInfo = infoMap.get(trimmedKey) || {
                dataSource: undefined,
                engagementScore: undefined,
                relevanceScore: undefined
              };
              existingInfo[fieldToUpdate] = trimmedValue;
              infoMap.set(trimmedKey, existingInfo);
            }
          }
        } catch (e) {
          console.error(`Error parsing elasticsearch debug info: ${item}`, e);
        }
      });
    } catch (e) {
      console.error('Error parsing elasticsearch debug info', e);
    }
  };

  const buildElasticSearchDebugMap = useCallback(
    (
      elasticsearchDebugInfo?: SearchItemsResponseElasticSearchDebugInfo
    ): Map<string, SearchItemsResponseDataSourceInfo> => {
      const elasticSearchDebugInfoMap: Map<string, SearchItemsResponseDataSourceInfo> = new Map();
      if (!showElasticDebugInfo) {
        return elasticSearchDebugInfoMap;
      }
      const dataSource = elasticsearchDebugInfo?.searchResultDataSource || undefined;
      if (dataSource) {
        parseElasticSearchDebugInfoV1(dataSource, elasticSearchDebugInfoMap, 'dataSource');
      }
      const engagementScore = elasticsearchDebugInfo?.searchResultEngagementScore || undefined;
      if (engagementScore) {
        parseElasticSearchDebugInfoV2(
          engagementScore,
          elasticSearchDebugInfoMap,
          'engagementScore'
        );
      }
      const relevanceScore = elasticsearchDebugInfo?.searchResultRelevanceScore || undefined;
      if (relevanceScore) {
        parseElasticSearchDebugInfoV2(relevanceScore, elasticSearchDebugInfoMap, 'relevanceScore');
      }
      return elasticSearchDebugInfoMap;
    },
    [showElasticDebugInfo]
  );

  const buildSearchResultData = useCallback(
    (
      searchData: TItem[] | null,
      clearResults: boolean,
      elasticsearchDebugInfo?: SearchItemsResponseElasticSearchDebugInfo
    ) => {
      if (clearResults && (!searchData || searchData.length === 0)) {
        setSearchItemsError('no_results');
        setIsSearchItemsLoaded(true);
        setLoading(false);
        return;
      }

      const { itemTypes } = catalogConstants;
      const itemParamsMapKey: Record<number, ItemDetailsInput> = {};

      const newSearchResultsDict = {
        ...searchResultDict
      };

      const newResultsList: string[] = [];

      const elasticSearchDebugInfoMap: Map<
        string,
        SearchItemsResponseDataSourceInfo
      > = buildElasticSearchDebugMap(elasticsearchDebugInfo);

      searchData?.forEach((originalItem: TItem) => {
        const key = UtilityService.getCatalogContentKey(originalItem);
        const item: Omit<ItemDetailsInput, 'thumbnailType'> = {
          ...originalItem,
          key
        };

        if (showElasticDebugInfo && elasticSearchDebugInfoMap.has(item.id.toString())) {
          const debugInfo = elasticSearchDebugInfoMap.get(item.id.toString());
          if (debugInfo) {
            (item as ItemWithDetails).debugInfo = debugInfo;
          }
        }

        newSearchResultsDict[key] = item;

        if (searchResultList === null || searchResultList.indexOf(key) === -1) {
          newResultsList.push(key);
        } else {
          // Not sure why the Angular code was skipping...
          newResultsList.push(key);
        }

        const itemId = item.id;

        itemParamsMapKey[itemId] = {
          ...item,
          thumbnailType:
            item && item.itemType === itemTypes.bundle
              ? ThumbnailTypes.bundleThumbnail
              : ThumbnailTypes.assetThumbnail
        };
      });

      setSearchResultList(prevSearchResultList => {
        if (prevSearchResultList == null) {
          return newResultsList;
        }
        return [...prevSearchResultList, ...newResultsList];
      });

      CatalogAPIService.getCatalogItemDetails(itemParamsMapKey, translate)
        .then(
          function success(details) {
            UtilityService.updateSearchItemDetails(details, newSearchResultsDict);
            setSearchResultDict(prevDict => ({ ...prevDict, ...newSearchResultsDict }));
          },
          function error(response) {
            setSearchItemsError('error');
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const errorResultData = response?.data as ErrorData;
            if (errorResultData) {
              const { endpointNames } = catalogConstants.errorMessages;
              metricsService.sendErrorsToGoogleAnalytics(
                errorResultData,
                endpointNames.getCatalogItemDetails
              );
              metricsService.sendErrorsToLogCount(
                errorResultData,
                endpointNames.getCatalogItemDetails
              );
            }
          }
        )
        .finally(() => {
          setIsSearchItemsLoaded(true);
          setLoading(false);
        });
    },
    [
      buildElasticSearchDebugMap,
      metricsService,
      searchResultDict,
      searchResultList,
      setIsSearchItemsLoaded,
      setLoading,
      setSearchItemsError,
      showElasticDebugInfo,
      translate
    ]
  );

  const buildSearchResultDataNoHydration = useCallback(
    (
      searchData: ItemWithDetails[] | null,
      clearResults: boolean,
      elasticsearchDebugInfo?: SearchItemsResponseElasticSearchDebugInfo
    ) => {
      if (clearResults && (!searchData || searchData.length === 0)) {
        setSearchItemsError('no_results');
        setIsSearchItemsLoaded(true);
        setLoading(false);
        return;
      }
      if (!searchData) {
        setSearchItemsError('no_results');
        setIsSearchItemsLoaded(true);
        setLoading(false);
        return;
      }

      const newSearchResultsDict = {
        ...searchResultDict
      };

      const newResultsList: string[] = [];

      const elasticSearchDebugInfoMap: Map<
        string,
        SearchItemsResponseDataSourceInfo
      > = buildElasticSearchDebugMap(elasticsearchDebugInfo);

      searchData.forEach((originalItem: ItemWithDetails) => {
        const key = UtilityService.getCatalogContentKey(originalItem);
        // Since this is already hydrated data, we use it directly
        const item: ItemWithDetails = {
          ...originalItem,
          key
        };

        if (showElasticDebugInfo && elasticSearchDebugInfoMap.has(item.id.toString())) {
          const debugInfo = elasticSearchDebugInfoMap.get(item.id.toString());
          if (debugInfo) {
            item.debugInfo = debugInfo;
          }
        }

        newSearchResultsDict[key] = item;

        if (searchResultList === null || searchResultList.indexOf(key) === -1) {
          newResultsList.push(key);
        } else {
          // Not sure why the Angular code was skipping...
          newResultsList.push(key);
        }
      });

      setSearchResultList(prevSearchResultList => {
        if (prevSearchResultList == null) {
          return newResultsList;
        }
        return [...prevSearchResultList, ...newResultsList];
      });
      // Since data is already hydrated, directly update the search result dict
      setSearchResultDict(prevDict => ({ ...prevDict, ...newSearchResultsDict }));
      // Complete the loading process
      setIsSearchItemsLoaded(true);
      setLoading(false);
    },
    [
      buildElasticSearchDebugMap,
      searchResultDict,
      searchResultList,
      setIsSearchItemsLoaded,
      setLoading,
      setSearchItemsError,
      showElasticDebugInfo
    ]
  );

  const postGetTopics = useCallback(
    (items: TItem[], newTopics: Topic[]) => {
      const filteredItems: TItemBasicInfo[] = [];
      const filteredTopics: string[] = [];
      let count = 0;
      if (newTopics.length > 0) {
        newTopics.forEach(topic => {
          const formattedTopicName = UtilityService.formatTopic(topic.displayName);

          filteredTopics.push(formattedTopicName);
        });
      } else if (items.length > 0) {
        items.forEach(item => {
          if (count < catalogConstants.topics.numberOfItemsToSend) {
            filteredItems.push({
              targetId: item.id,
              // asset or bundle
              itemType:
                item.itemType === 'Asset'
                  ? catalogConstants.itemTypeIds.asset
                  : catalogConstants.itemTypeIds.bundle
            });
          }
          count += 1;
        });
      }
      setTopics([]);
      CatalogAPIService.postGetTopics(filteredItems, filteredTopics, keyword).then(
        function success(result) {
          setTopics(result.data.topics || []);
        },
        function error() {
          clearTopics();
        }
      );
    },
    [clearTopics, keyword, setTopics]
  );

  const getSearchItemsV2 = useCallback(
    (clearResults: boolean, fadeResultsWhileLoading?: boolean): boolean => {
      const queryParams = generateQueryParams(catalogQuery, searchOptions);

      UtilityService.appendQueryParamsToUrl(queryParams, setCurrentUrl);

      const { query, showExpandedResults } = generateQuery(
        catalogQuery,
        queryParams,
        searchOptions,
        isInfiniteScrollDisabled
      );

      if (isEqual(modifiedQuery, query)) {
        setLoading(false);
        setIsSearchItemsLoaded(true);
        // Query is unchanged so we don't need to fetch new data
        return true;
      }

      if (clearResults) {
        setIsSearchItemsLoaded(false);
      }

      setLoading(true);

      if (clearResults && !fadeResultsWhileLoading) {
        clearSearchResults();
      }

      setModifiedQuery(query);
      CatalogAPIService.getSearchItemsV2({ ...query }, !!library.isFullScreen, showExpandedResults)
        .then(
          function success(response) {
            const { topics: selectedTopics, topicBasedBrowsingEnabledForCategory } = catalogQuery;
            resetPageContentAndLoading(clearResults);
            const searchResult = response.data;
            if (searchResult) {
              const {
                data: searchResultData,
                keyword: searchResultKeyword,
                elasticsearchDebugInfo
              } = searchResult;
              if (selectedTopics.length <= 0) {
                if (UtilityService.isKeywordResultCensored(searchResultKeyword)) {
                  setIsKeywordCensored(true);
                } else {
                  setIsKeywordCensored(false);
                }
              }
              if (topicBasedBrowsingEnabledForCategory && clearResults) {
                if (selectedTopics.length) {
                  postGetTopics([], selectedTopics);
                } else if (searchResultData?.length) {
                  postGetTopics(searchResultData, []);
                }
              }

              setNextPageCursor(searchResult.nextPageCursor);
              buildSearchResultDataNoHydration(
                searchResultData,
                clearResults,
                elasticsearchDebugInfo
              );
            }
          },
          function error(response) {
            setLoading(false);
            resetPageContentAndLoading(clearResults);
            setSearchItemsError('error');
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const errorResultData = response?.data as ErrorData;
            if (errorResultData) {
              const { endpointNames } = catalogConstants.errorMessages;
              metricsService.sendErrorsToGoogleAnalytics(
                errorResultData,
                endpointNames.getSearchItems
              );
              metricsService.sendErrorsToLogCount(errorResultData, endpointNames.getSearchItems);
            }
          }
        )
        .finally(() => {
          setLayoutInitialized(true);

          setStartPaging(false);
        });

      return false;
    },
    [
      catalogQuery,
      searchOptions,
      setCurrentUrl,
      isInfiniteScrollDisabled,
      modifiedQuery,
      setIsSearchItemsLoaded,
      setLoading,
      library.isFullScreen,
      resetPageContentAndLoading,
      setNextPageCursor,
      buildSearchResultData,
      setIsKeywordCensored,
      postGetTopics,
      setSearchItemsError,
      metricsService,
      setLayoutInitialized,
      setStartPaging
    ]
  );

  const getPagedItems = useCallback(
    (clearResults: boolean, fadeResultsWhileLoading?: boolean): boolean => {
      if (clearResults && !fadeResultsWhileLoading) {
        clearSearchResults();
      }

      return getSearchItemsV2(clearResults, fadeResultsWhileLoading);
    },
    [getSearchItemsV2]
  );

  const [canLoadNextPage, setCanLoadNextPage] = useState<boolean>(false);

  useEffect(() => {
    setCanLoadNextPage(
      !layout.loading &&
        !!nextPageCursor &&
        !layout.searchItemsError &&
        layout.isSearchItemsLoaded &&
        !!isPaginationEnabled
    );
  }, [
    layout.loading,
    nextPageCursor,
    layout.searchItemsError,
    layout.isSearchItemsLoaded,
    isPaginationEnabled
  ]);

  const fetchNextPage = useCallback(() => {
    if (!canLoadNextPage) {
      return;
    }

    if (!nextPageCursor) {
      return;
    }

    setCursor(nextPageCursor);
    setNextPageCursor(null);
  }, [canLoadNextPage, nextPageCursor, setCursor, setNextPageCursor]);

  return {
    canLoadNextPage,
    getPagedItems,
    fetchNextPage,
    searchResultDict,
    searchResultList
  };
};

export default useCatalogSearch;
