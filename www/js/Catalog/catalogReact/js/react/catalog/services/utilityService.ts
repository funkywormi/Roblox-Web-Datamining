import { EnvironmentUrls, Endpoints, CurrentUser } from 'Roblox';
import { concatTexts } from 'core-utilities';
import { TranslateFunction } from 'react-utilities';
import { ItemCardUtils } from 'react-style-guide';
import { AxiosError } from 'axios';
import catalogConstants from '../constants/catalogConstants';
import {
  TAssetItemDetails,
  TBundleItemDetails,
  TItemCardRestrictions,
  TItemStatus
} from '../../itemDetailsInfo/constants/types';
import {
  AssetsCollection,
  Category,
  CategoryEnumLibrary,
  ItemWithAllDetails,
  ItemWithDetails,
  ModifiedQuery,
  Query,
  TGenericItemDetails,
  TItem,
  Topic
} from '../constants/types';
import {
  QueryParams,
  QueryParamsKey,
  isQueryParamKey,
  normalizeQueryParamKey
} from '../constants/queryParams.types';
import { SearchOptionsData } from '../hooks/searchOptions/searchOptions.types';
import { taxonomyContains } from '../utils/taxonomyUtils';

class UtilityService {
  static buildItemDetailsUrl(item: ItemWithDetails): string {
    const { itemType, id } = item;
    const { itemTypes } = catalogConstants;

    switch (itemType) {
      case itemTypes.bundle:
        return Endpoints.getAbsoluteUrl
          ? Endpoints.getAbsoluteUrl(`/bundles/${id}/`)
          : `${EnvironmentUrls.websiteUrl}/bundles/${id}/`;
      case itemTypes.asset:
      default:
        return Endpoints.getAbsoluteUrl
          ? Endpoints.getAbsoluteUrl(`/catalog/${id}/`)
          : `${EnvironmentUrls.websiteUrl}/catalog/${id}/`;
    }
  }

  static getNameForDisplay(item: ItemWithDetails): string {
    const { userTypes, robloxSystemUserId } = catalogConstants;
    const { creatorName, creatorType, creatorTargetId } = item;
    return userTypes.user === creatorType && robloxSystemUserId !== creatorTargetId
      ? concatTexts.concat(['', creatorName])
      : creatorName;
  }

  static getQueriesValueIntoInt(searchParams: URLSearchParams): QueryParams {
    const queries: QueryParams = {};

    searchParams.forEach((value, key) => {
      // Only process known QueryParams keys (case-insensitive), ignore unknown parameters like "pet"
      if (!isQueryParamKey(key)) {
        return;
      }

      // Normalize the key to the correct casing
      const normalizedKey = normalizeQueryParamKey(key);
      if (!normalizedKey) {
        return;
      }

      const valueAsNumber = parseInt(value, 10);
      if (normalizedKey === 'Category') {
        queries.Category = valueAsNumber;
      } else if (normalizedKey === 'Subcategory') {
        queries.Subcategory = valueAsNumber;
      } else if (normalizedKey === 'SortType') {
        queries.SortType = valueAsNumber;
      } else if (normalizedKey === 'SortAggregation') {
        queries.SortAggregation = valueAsNumber;
      } else if (normalizedKey === 'CurrencyType') {
        queries.CurrencyType = valueAsNumber;
      } else if (normalizedKey === 'Gears') {
        queries.Gears = valueAsNumber;
      } else if (normalizedKey === 'CreatorID') {
        queries.CreatorID = valueAsNumber;
      } else if (normalizedKey === 'pxMin') {
        queries.pxMin = valueAsNumber < 0 ? 0 : valueAsNumber;
      } else if (normalizedKey === 'pxMax') {
        queries.pxMax = valueAsNumber < 0 ? 0 : valueAsNumber;
      } else if (normalizedKey === 'salesTypeFilter') {
        queries.salesTypeFilter = valueAsNumber;
      } else if (normalizedKey === 'IncludeNotForSale') {
        if (value !== 'false') {
          queries.IncludeNotForSale = true;
        }
      } else if (normalizedKey === 'Keyword') {
        queries.Keyword = value;
      } else if (normalizedKey === 'topics') {
        queries.topics = value;
      } else if (normalizedKey === 'CreatorType') {
        queries.CreatorType = value;
      } else if (normalizedKey === 'CreatorName') {
        queries.CreatorName = value;
      } else if (normalizedKey === 'TriggeredByTopicDiscovery') {
        queries.TriggeredByTopicDiscovery = value === 'true';
      } else if (normalizedKey === 'taxonomy') {
        queries.taxonomy = [value];
      }
    });

    return queries;
  }

  static isQueryParamKey(key: string): boolean {
    return isQueryParamKey(key);
  }

  static normalizeQueryParamKey(key: string): QueryParamsKey | null {
    return normalizeQueryParamKey(key);
  }

  static filterUnknownQueryParams(queryParams: QueryParams): QueryParams {
    const filteredParams: QueryParams = {};

    // Only keep valid QueryParams keys, filter out unknown parameters like "pet"
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return; // Skip undefined/null values
      }

      // Only include parameters that are valid QueryParams keys (case-insensitive)
      if (isQueryParamKey(key)) {
        // Normalize the key to the correct casing
        const normalizedKey = normalizeQueryParamKey(key);
        if (normalizedKey) {
          (filteredParams as Record<string, unknown>)[normalizedKey] = value;
        }
      }
      // Unknown parameters like "pet" are automatically filtered out
    });

    return filteredParams;
  }

  static getCatalogContentKey(item: TItem): string {
    const { id, itemType } = item;
    return `${itemType}_${id}`;
  }

  static updateSearchItemDetails(
    updatedDetails: ItemWithDetails[],
    searchResultDict: AssetsCollection
  ): void {
    if (updatedDetails) {
      updatedDetails.forEach(item => {
        const { key } = item;
        const itemWithDetails: ItemWithAllDetails = {
          ...item,
          detailsUrl: UtilityService.buildItemDetailsUrl(item),
          nameForDisplay: UtilityService.getNameForDisplay(item),
          detailsLoaded: true
        };

        Object.assign(searchResultDict[key], itemWithDetails);
      });
    }
  }

  static formatQueries(queryParams: QueryParams, cursor?: string | undefined): Query {
    const formatQueries: Query = {};
    Object.entries(queryParams).forEach(([keyString, value]) => {
      const key = keyString as QueryParamsKey;
      if (key === 'Category') {
        formatQueries.category = value as number;
      } else if (key === 'Subcategory') {
        formatQueries.subcategory = value as number;
      } else if (key === 'Gears') {
        formatQueries.subcategory = value as number;
      } else if (key === 'topics') {
        formatQueries.topics = value as string;
      } else if (key === 'SortType') {
        formatQueries.sortType = value as number;
      } else if (key === 'SortAggregation') {
        formatQueries.sortAggregation = value as number;
      } else if (key === 'Keyword') {
        formatQueries.keyword = value as string;
      } else if (key === 'pxMin') {
        formatQueries.minPrice = value as number;
      } else if (key === 'pxMax') {
        formatQueries.maxPrice = value as number;
      } else if (key === 'TriggeredByTopicDiscovery') {
        formatQueries.TriggeredByTopicDiscovery = value as boolean;
      } else if (key === 'CreatorID') {
        formatQueries.creatorTargetId = value as number | 'custom';
      } else if (key === 'CreatorType') {
        formatQueries.creatorType = value as string;
      } else if (key === 'CreatorName') {
        formatQueries.creatorName = value as string;
      } else if (key === 'IncludeNotForSale') {
        formatQueries.includeNotForSale = value as boolean;
      } else if (key === 'salesTypeFilter') {
        formatQueries.salesTypeFilter = value as number;
      } else if (key === 'AssetTypeIds') {
        formatQueries.assetTypeIds = value as number[];
      } else if (key === 'BundleTypeIds') {
        formatQueries.bundleTypeIds = value as number[];
      } else if (key === 'taxonomy') {
        formatQueries.taxonomy = value as string[];
      } else if (key === 'CategoryFilter') {
        formatQueries.categoryFilter = value as number;
      }
    });
    if (formatQueries.taxonomy !== undefined && formatQueries.taxonomy.length !== 0) {
      delete formatQueries.assetTypeIds;
      delete formatQueries.bundleTypeIds;
      delete formatQueries.category;
      delete formatQueries.subcategory;
    }

    if (cursor) {
      formatQueries.cursor = cursor;
    }

    return formatQueries;
  }

  static checkIfQueryParamShouldBeKeptForUrl(key: string, queryParams?: QueryParams): boolean {
    // Always exclude these internal parameters
    if (key === 'AssetTypeIds' || key === 'BundleTypeIds' || key === 'CategoryFilter') {
      return false;
    }

    // For Category and Subcategory, only exclude them if taxonomy is present
    if (key === 'Category' || key === 'Subcategory') {
      // If we have queryParams context, check if taxonomy is present
      if (queryParams) {
        const hasTaxonomy =
          queryParams.taxonomy &&
          Array.isArray(queryParams.taxonomy) &&
          queryParams.taxonomy.length > 0;
        // Only exclude Category/Subcategory if taxonomy is present
        return !hasTaxonomy;
      }
      // If no context provided, default to excluding (backward compatibility)
      return false;
    }

    return true;
  }

  static appendQueryParamsToUrl(
    queryParams: QueryParams,
    setCurrentUrl: (newUrl: string) => void
  ): void {
    const url = new URL(window.location.href);

    // Filter out unknown parameters (let generateQueryParams handle default filtering)
    const filteredParams = UtilityService.filterUnknownQueryParams(queryParams);

    // Start with a completely clean URLSearchParams to remove ALL existing parameters
    const params = new URLSearchParams();

    // Only add the filtered parameters we want to keep
    Object.entries(filteredParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value === true) {
          // Handle boolean true values - add them without a value
          params.append(key, '');
        } else if (UtilityService.checkIfQueryParamShouldBeKeptForUrl(key, filteredParams)) {
          params.set(key, value.toString());
        }
      }
    });

    // Construct the new URL with only the filtered query parameters
    const queryString = params.toString();
    const newUrl = queryString
      ? `${url.origin}${url.pathname}?${queryString}`
      : `${url.origin}${url.pathname}`;

    const currentUrl = window.location.href;

    if (newUrl !== currentUrl) {
      // Use history.pushState to update the URL without reloading the page
      window.history.pushState({ ...window.history.state, path: newUrl }, '', newUrl);

      setCurrentUrl(newUrl);
    }
  }

  static mapItemRestrictionIcons(item: TGenericItemDetails): TItemCardRestrictions {
    return ItemCardUtils.mapItemRestrictionIcons(item?.itemRestrictions, item?.itemType);
  }

  static mapItemStatusIconsAndLabels(
    item: (TAssetItemDetails | TBundleItemDetails) & TItemCardRestrictions,
    translate: TranslateFunction
  ): TItemStatus[] | undefined {
    const itemStatus = (item as TAssetItemDetails)?.itemStatus;
    if (!itemStatus) {
      return undefined;
    }
    return ItemCardUtils.mapItemStatusIconsAndLabels(itemStatus).map(status =>
      status.isIcon
        ? {
            isIcon: status.isIcon,
            type: status.type,
            element: status.element
          }
        : { class: status.class, label: translate(status.label) }
    );
  }

  static translateToEnumStrings(
    categoryEnumLibrary: CategoryEnumLibrary | undefined,
    queries: Query
  ): ModifiedQuery {
    let translatedEnums: {
      category: string | null;
      subcategory: string | null;
    } = { category: null, subcategory: null };

    const { category, subcategory, gears } = queries;
    if (category && categoryEnumLibrary && categoryEnumLibrary[category]) {
      const { categoryEnum, subcategoryEnums } = categoryEnumLibrary[category];
      translatedEnums = {
        ...translatedEnums,
        category: categoryEnum
      };

      if (subcategoryEnums) {
        let subcategoryString: string | null = null;
        if (gears) {
          subcategoryString = subcategoryEnums[gears];
        } else if (subcategory) {
          subcategoryString = subcategoryEnums[subcategory];
        }

        if (subcategoryString) {
          translatedEnums = {
            ...translatedEnums,
            subcategory: subcategoryString
          };
        }
      }
    }

    return {
      ...queries,
      ...translatedEnums
    };
  }

  static buildUserLink(item: Pick<ItemWithDetails, 'creatorType' | 'creatorTargetId'>): string {
    const { creatorType, creatorTargetId } = item || {};
    const { userTypes } = catalogConstants;
    switch (creatorType) {
      case userTypes.group:
        return Endpoints.getAbsoluteUrl(`/groups/${creatorTargetId}`);
      case userTypes.user:
      default:
        return Endpoints.getAbsoluteUrl(`/users/${creatorTargetId}/profile`);
    }
  }

  static formatTopic = (topicName: string): string => {
    return topicName.toLowerCase();
  };

  static buildTopicKeyword = (topicsToBuild: Topic[], separator: string): string => {
    let keyword = '';
    topicsToBuild.forEach(topic => {
      if (keyword.length > 0) {
        keyword += separator;
      }
      keyword += UtilityService.formatTopic(topic.displayName);
    });

    return keyword;
  };

  static getCategoryMenu = (
    categories: Category[] | undefined,
    categoryId: number | undefined
  ): Category | undefined => {
    if (categoryId === undefined) {
      return undefined;
    }

    return categories?.find(c => c.categoryId === categoryId);
  };

  static isKeywordResultCensored = (keyword: string): boolean => {
    return keyword === catalogConstants.keywordSearch.censoredKey;
  };

  static buildErrorMessages = (errors: AxiosError[], userAgent: string): string => {
    let errorMessage = `userId-${CurrentUser.userId}`;
    if (errors && errors.length > 0) {
      errors.forEach(error => {
        const { code, message } = error;
        errorMessage += `-code-${code || ''}-message-${message}`;
      });
    }
    errorMessage += `-userAgent-${userAgent}`;
    return errorMessage;
  };

  static testCategoryValidityForRedirect(
    queryParams: QueryParams,
    searchOptions: SearchOptionsData
  ): { shouldRedirectToHome: boolean } {
    const { Category: categoryId, taxonomy } = queryParams;
    const { categories, defaultCategoryId } = searchOptions;

    // Step 1: Try taxonomy first (highest priority)
    if (taxonomy && taxonomy.length > 0) {
      let foundTaxonomyMatch = false;
      const taxonomyToSearch = Array.isArray(taxonomy) ? taxonomy[0] : taxonomy;

      for (const category of categories || []) {
        if (taxonomyContains(category.taxonomy, taxonomyToSearch)) {
          foundTaxonomyMatch = true;
          break;
        }

        if (category.subcategories) {
          for (const subcategory of category.subcategories) {
            if (taxonomyContains(subcategory.taxonomy, taxonomyToSearch)) {
              foundTaxonomyMatch = true;
              break;
            }
          }
        }

        if (foundTaxonomyMatch) break;
      }

      // If taxonomy matched, we're good - no redirect needed
      if (foundTaxonomyMatch) {
        return { shouldRedirectToHome: false };
      }
    }

    // Step 2: Fall back to category/subcategory if taxonomy didn't match
    let categoryIdToSearch = categoryId;

    if (!Number.isInteger(categoryIdToSearch)) {
      categoryIdToSearch = defaultCategoryId;
    }

    const updatedCategory = categories?.find(cat => cat.categoryId === categoryIdToSearch);

    // If category is invalid, try default
    if (!updatedCategory && categoryIdToSearch !== defaultCategoryId) {
      const defaultCategory = categories?.find(cat => cat.categoryId === defaultCategoryId);
      if (!defaultCategory) {
        return { shouldRedirectToHome: true };
      }
    } else if (!updatedCategory) {
      return { shouldRedirectToHome: true };
    }

    // Category is valid, no redirect needed
    return { shouldRedirectToHome: false };
  }
}

export default UtilityService;
