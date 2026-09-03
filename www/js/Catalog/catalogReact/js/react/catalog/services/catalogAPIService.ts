import { CurrentUser, Endpoints, EnvironmentUrls } from 'Roblox';
import { AxiosPromise, httpService } from 'core-utilities';
import { ThumbnailTypes } from 'roblox-thumbnails';
import { TranslateFunction } from 'react-utilities';
import { AxiosError } from 'axios';
import catalogConstants from '../constants/catalogConstants';
import UtilityService from './utilityService';
import {
  ItemWithDetails,
  Category,
  Creator,
  CurrencyType,
  SalesTypeFilter,
  SortMenus,
  TItem,
  Topic,
  TGenericItemDetails,
  ModifiedQuery,
  TItemBasicInfo
} from '../constants/types';
import {
  TAssetItemDetails,
  TBundleItemDetails,
  TItemCardRestrictions
} from '../../itemDetailsInfo/constants/types';

export type MetadataResponse = {
  isPremiumPriceOnItemTilesEnabled?: boolean;
  isPremiumIconOnItemTilesEnabled?: boolean;
  autocompleteAvatarSearchNumToDisplay?: number;
  isCatalogAdsRowOnRecommendedPageEnabled: boolean;
  isRemoveAllSubcategoryEnabled?: boolean;
};

export type CatalogItemDetails = TBundleItemDetails | TAssetItemDetails;

export type CatalogItemDetailsResponse = {
  data: CatalogItemDetails[];
};

export type SearchItemsResponseElasticSearchDebugInfo = {
  elasticsearchQuery: string | null;
  indexName: string;
  isForceTerminationEnabledByRequest: boolean | null;
  isFromCache: boolean;
  isTerminatedEarly: boolean | null;
  searchResultDataSource: string | null;
  searchResultEngagementScore: string | null;
  searchResultRelevanceScore: string | null;
};

export type SearchItemsResponseDataSourceInfo = {
  dataSource?: string;
  engagementScore?: string;
  relevanceScore?: string;
};

export type SearchItemsResponse = {
  keyword: string;
  nextPageCursor: string | null;
  previousPageCursor: string | null;
  data: ItemWithDetails[] | null;
  elasticsearchDebugInfo?: SearchItemsResponseElasticSearchDebugInfo;
};

export type ItemDetailsInput = TItem & {
  key: string;
  thumbnailType: ThumbnailTypes;
};

export type NavigationMenuItemsResponse = {
  defaultGearSubcategory: number;
  defaultCategory: number;
  defaultCreator: number;
  defaultCurrency: number;
  defaultSortType: number;
  defaultSortAggregation: number;
  defaultCategoryIdForRecommendedSearch: number;
  categoriesWithCreator: number[];
  robloxUserId: number;
  robloxUserName: string;
  gearSubcategory: number;
  allCategories: number;
  freeFilter: number;
  customRobuxFilter: number;
  robuxFilter: number;
  categories: Category[];
  priceFilters: CurrencyType[];
  sortMenu: SortMenus;
  creatorFilters: Creator[];
  salesTypeFilters: SalesTypeFilter[];
};

export type AvatarRequestSuggestionResponse = {
  Args: {
    Algo: null;
    Limit: number;
    Prefix: string;
  };
  Data: {
    Query: string;
    Score: number;
    Meta: null;
  }[];
};

export type PostGetTopicsResponse = {
  error: null;
  topics: Topic[];
};

export type UserCurrencyResult = {
  robux: number;
};

export type ErrorData = {
  errors: AxiosError[]; // An array of ApiError objects
};

class CatalogAPIService {
  static getMetadataFromApi(): AxiosPromise<MetadataResponse> {
    return httpService.get<MetadataResponse>(catalogConstants.endpoints.getMetadata);
  }

  static getSearchOptions() {
    const urlConfig = catalogConstants.endpoints.getSearchOptionsUrl;
    return httpService.get(urlConfig);
  }

  static getNavigationMenuItems(): AxiosPromise<NavigationMenuItemsResponse> {
    return httpService.get<NavigationMenuItemsResponse>(
      catalogConstants.endpoints.getNavigationMenuItems
    );
  }

  static getSearchItemsV2(
    params: ModifiedQuery,
    isFullScreenEnabled: boolean,
    showExpandedResults = false
  ): AxiosPromise<SearchItemsResponse> {
    const {
      numberOfSearchItems,
      numberOfSearchItemsForFullScreen,
      numberOfSearchItemsExpanded
    } = catalogConstants;
    let limit = isFullScreenEnabled ? numberOfSearchItemsForFullScreen : numberOfSearchItems;
    if (showExpandedResults) {
      limit = numberOfSearchItemsExpanded;
    }
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Handle arrays by adding multiple parameters with the same key
        value.forEach(item => urlParams.append(key, String(item)));
      } else if (value !== undefined && value !== null) {
        urlParams.set(key, String(value));
      }
    });
    urlParams.set('limit', limit.toString());

    return httpService.get<SearchItemsResponse>(
      catalogConstants.endpoints.getSearchItemsV2,
      urlParams
    );
  }

  static getCatalogItemDetails(
    itemsMapKey: Record<number, ItemDetailsInput>,
    translate: TranslateFunction
  ): Promise<ItemWithDetails[]> {
    const { endpoints, priceStatus } = catalogConstants;
    const items = Object.values(itemsMapKey);
    const requestData = { items };
    return httpService
      .post<CatalogItemDetailsResponse>(endpoints.getCatalogItemDetails, requestData)
      .then(response => {
        const result = response.data;

        const returnResult =
          result && result.data
            ? result.data.map(item => {
                const { id } = item;
                const newItem: TGenericItemDetails = {
                  ...item,
                  key: itemsMapKey[id].key,
                  ...(item.priceStatus === priceStatus.free && { isFree: true })
                };

                const itemWithRestrictions: TGenericItemDetails & TItemCardRestrictions = {
                  ...newItem,
                  ...UtilityService.mapItemRestrictionIcons(newItem)
                };
                const itemStatus = UtilityService.mapItemStatusIconsAndLabels(
                  itemWithRestrictions,
                  translate
                );

                const itemWithProperties: ItemWithDetails = {
                  ...itemWithRestrictions,
                  itemStatusIconsAndLabels: itemStatus,
                  creatorLink: UtilityService.buildUserLink(itemWithRestrictions)
                };

                return itemWithProperties;
              })
            : [];

        return returnResult;
      });
  }

  static getAvatarRequestSuggestion(
    search: string,
    languageCode: string | undefined,
    limit: number,
    previousQuery: string,
    useFallback = false
  ): AxiosPromise<AvatarRequestSuggestionResponse> {
    const lang = languageCode || catalogConstants.englishLanguageCode;
    const params = { prefix: search, limit, lang, q: previousQuery };
    if (useFallback) {
      return httpService.get<AvatarRequestSuggestionResponse>(
        catalogConstants.endpoints.avatarRequestSuggestion,
        params
      );
    }
    return httpService.get<AvatarRequestSuggestionResponse>(
      catalogConstants.endpoints.avatarRequestCdnSuggestion,
      params
    );
  }

  static postGetTopics(
    items: TItemBasicInfo[],
    selectTopics: string[],
    inputQuery?: string | null
  ): AxiosPromise<PostGetTopicsResponse> {
    const validInputQuery = !!inputQuery;
    const urlParams = {
      maxResult: catalogConstants.topics.maxTopicsToRequest,
      items: validInputQuery ? [] : items,
      selectTopics,
      inputQuery: validInputQuery ? inputQuery : undefined
    };
    return httpService.post<PostGetTopicsResponse>(
      catalogConstants.endpoints.postGetTopics,
      urlParams
    );
  }

  static getUserCurrency(): AxiosPromise<UserCurrencyResult> {
    const { getUserCurrency } = catalogConstants.endpoints;
    const absoluteUrl: string = Endpoints.generateAbsoluteUrl(
      getUserCurrency.url,
      { userId: CurrentUser.userId },
      true
    );
    const url = `${EnvironmentUrls.economyApi}${absoluteUrl}`;
    getUserCurrency.url = url;
    return httpService.get<UserCurrencyResult>(getUserCurrency);
  }

  static postMarketplaceItemDetails(collectibleItemId: number) {
    const urlParams = { itemIds: [collectibleItemId] };
    return httpService.post(catalogConstants.endpoints.postMarketplaceItemDetails, urlParams);
  }

  static getResellerData(assetId: number) {
    const urlConfig = {
      url: catalogConstants.getResellerDataUrl(assetId),
      retryable: true,
      withCredentials: true
    };
    return httpService.get(urlConfig);
  }
}

export default CatalogAPIService;
