import { QueryParams } from '../../constants/queryParams.types';
import {
  Category,
  Creator,
  CurrencyType,
  Query,
  Topic,
  SortAggregation,
  SortMenus,
  SortOption,
  Subcategory
} from '../../constants/types';
import catalogConstants from '../../constants/catalogConstants';
import UtilityService from '../../services/utilityService';
import { SearchOptionsData } from '../searchOptions/searchOptions.types';
import { CatalogQuery } from './catalogQuery.types';
import { taxonomyContains } from '../../utils/taxonomyUtils';

export type CategoryInput = {
  categoryId: number | undefined;
  subcategoryId?: number;
  gearsId?: number;
  taxonomy?: string[] | undefined;
};

export type CreatorInput = {
  creatorId: number | undefined;
  creatorName?: string;
  creatorType?: string;
};

const parseTopicsFromString = (topicsString: string, separator: string) => {
  if (!topicsString || topicsString.length === 0) {
    return [];
  }
  const splitTopics = topicsString.split(separator);
  const parsedSelectedTopics: Topic[] = [];

  splitTopics.forEach(topic => {
    parsedSelectedTopics.push({
      displayName: topic,
      originalTopicName: ''
    });
  });
  return parsedSelectedTopics;
};

export const applyCategory = (
  input: CategoryInput,
  searchOptions: SearchOptionsData
): Pick<CatalogQuery, 'category' | 'subcategory' | 'topicBasedBrowsingEnabledForCategory'> & {
  shouldRedirectToHome?: boolean;
} => {
  const { categoryId, subcategoryId, gearsId, taxonomy } = input;
  const { categories, defaultCategoryId, gearCategoryId } = searchOptions;

  let updatedCategory: Category | undefined;
  let updatedSubcategory: Subcategory | undefined | null;
  let shouldRedirectToHome = false;

  // Step 1: Try taxonomy first (highest priority)
  if (taxonomy && taxonomy.length > 0) {
    let foundTaxonomyMatch = false;

    for (const category of categories || []) {
      if (taxonomyContains(category.taxonomy, taxonomy[0])) {
        updatedCategory = category;
        updatedSubcategory = undefined;
        foundTaxonomyMatch = true;
        break;
      }

      if (category.subcategories) {
        for (const subcategory of category.subcategories) {
          if (taxonomyContains(subcategory.taxonomy, taxonomy[0])) {
            updatedCategory = category;
            updatedSubcategory = subcategory;
            foundTaxonomyMatch = true;
            break;
          }
        }
      }

      if (foundTaxonomyMatch) break;
    }

    // If taxonomy matched, we're done - ignore category/subcategory parameters
    if (foundTaxonomyMatch) {
      const topicBasedBrowsingEnabledForCategory: boolean =
        updatedCategory === undefined
          ? false
          : catalogConstants.topics.categoriesToShowTopics.includes(updatedCategory?.categoryId);

      return {
        category: updatedCategory,
        subcategory: updatedSubcategory,
        topicBasedBrowsingEnabledForCategory
      };
    }
  }

  // Step 2: Fall back to category/subcategory if taxonomy didn't match
  let categoryIdToSearch = categoryId;

  if (!Number.isInteger(categoryIdToSearch)) {
    categoryIdToSearch = defaultCategoryId;
  }

  updatedCategory = categories?.find(cat => cat.categoryId === categoryIdToSearch);

  // If category is invalid, try default
  if (!updatedCategory && categoryIdToSearch !== defaultCategoryId) {
    categoryIdToSearch = defaultCategoryId;
    updatedCategory = categories?.find(cat => cat.categoryId === categoryIdToSearch);
  }

  // If we still don't have a valid category, redirect to home
  if (!updatedCategory) {
    shouldRedirectToHome = true;
    // Use default category as fallback to prevent crashes
    updatedCategory = categories?.find(cat => cat.categoryId === defaultCategoryId);
  }

  // Try to find subcategory if category is valid
  if (updatedCategory && !shouldRedirectToHome) {
    if (categoryIdToSearch === gearCategoryId) {
      updatedSubcategory = updatedCategory.subcategories?.find(
        subcat =>
          subcat.subcategoryId === (gearsId || updatedCategory?.subcategories?.[0].subcategoryId)
      );
    } else if (subcategoryId) {
      updatedSubcategory = updatedCategory.subcategories?.find(
        subcat => subcat.subcategoryId === subcategoryId
      );

      // If subcategory is invalid, just ignore it (don't redirect)
      if (!updatedSubcategory) {
        updatedSubcategory = undefined;
      }
    }
  }

  const topicBasedBrowsingEnabledForCategory: boolean =
    updatedCategory === undefined
      ? false
      : catalogConstants.topics.categoriesToShowTopics.includes(updatedCategory?.categoryId);

  return {
    category: updatedCategory,
    subcategory: updatedSubcategory,
    topicBasedBrowsingEnabledForCategory,
    shouldRedirectToHome
  };
};

const applySortMenus = (
  sortTypeId: number | null | undefined,
  sortAggregationId: number | null | undefined,
  sortMenus: SortMenus | undefined
): Pick<CatalogQuery, 'sortType' | 'sortAggregation'> => {
  let updatedSortType: SortOption | undefined;
  let updatedSortAggregation: number | SortAggregation | undefined;

  if (!sortMenus) {
    return {
      sortType: undefined,
      sortAggregation: undefined
    };
  }

  const { sortOptions, sortAggregations } = sortMenus;

  if (sortOptions) {
    updatedSortType =
      sortTypeId == null ? sortOptions[0] : sortOptions.find(sort => sort.sortType === sortTypeId);
  } else {
    updatedSortType = undefined;
  }

  if (sortAggregations) {
    updatedSortAggregation =
      sortAggregationId == null
        ? sortAggregations[0]
        : sortAggregations.find(sort => sort.sortAggregation === sortAggregationId);
  } else {
    updatedSortAggregation = undefined;
  }

  return {
    sortType: updatedSortType,
    sortAggregation: updatedSortAggregation
  };
};

const applyCreatorValues = (
  input: CreatorInput,
  searchOptions: SearchOptionsData
): Pick<CatalogQuery, 'creator' | 'creatorName'> => {
  const { creators, defaultCreatorId, robloxUserId, customText } = searchOptions;
  const { creatorName: selectedCreatorName, creatorId, creatorType } = input;

  const creatorFilters = creators;
  if (!creatorFilters) {
    return {};
  }

  let newCreator: Creator | undefined | null = null;
  let newCreatorName: string | null = null;
  let newCreatorId: number | undefined = creatorId;
  if (selectedCreatorName) {
    newCreator = creatorFilters.find(c => c.userId === customText);
    newCreatorName = selectedCreatorName;
  } else {
    if (!newCreatorId) {
      newCreatorId = defaultCreatorId;
    }

    if (newCreatorId && (!robloxUserId || newCreatorId > robloxUserId)) {
      newCreator = creatorFilters.find(c => c.userId === customText);
      // This should always be true
      if (newCreator) {
        newCreator = { ...newCreator, userId: newCreatorId }; // Clone with updated userId
      }
    } else {
      newCreator = creatorFilters?.find(c => c.userId === newCreatorId);
    }
  }

  if (newCreator && creatorType) {
    newCreator = { ...newCreator, type: creatorType }; // Clone with updated type
  }

  return { creator: newCreator, creatorName: newCreatorName };
};

const applyCurrencyValue = (
  currencyTypeParam: number | undefined,
  minPriceParam: number | undefined | null,
  maxPriceParam: number | undefined | null,
  searchOptions: SearchOptionsData
): Pick<CatalogQuery, 'currencyType' | 'minPrice' | 'maxPrice'> => {
  const { currencyTypes, defaultCurrencyType, customRobuxFilterId } = searchOptions;

  if (!currencyTypes) {
    return {
      currencyType: undefined,
      minPrice: minPriceParam,
      maxPrice: maxPriceParam
    };
  }

  const currency: CurrencyType | undefined =
    currencyTypes.find(c => c.currencyType === currencyTypeParam) || defaultCurrencyType;

  let updatedMinPriceParam: number | undefined | null = minPriceParam;
  let updatedMaxPriceParam: number | undefined | null = maxPriceParam;

  if (currency?.currencyType === customRobuxFilterId) {
    if (updatedMinPriceParam === undefined) {
      updatedMinPriceParam = null;
    }

    if (updatedMaxPriceParam === undefined) {
      updatedMaxPriceParam = null;
    }
  }

  return {
    currencyType: currency,
    minPrice: updatedMinPriceParam,
    maxPrice: updatedMaxPriceParam
  };
};

const applySalesTypeFilter = (
  selectedSalesTypeFilter: number | undefined,
  searchOptions: SearchOptionsData
): Pick<CatalogQuery, 'salesTypeFilter'> => {
  const initialSalesTypeFilterValue = selectedSalesTypeFilter || 1;

  const updatedSalesTypeFilter = searchOptions.salesTypeFilters?.find(salesFilter => {
    return salesFilter.filter === initialSalesTypeFilterValue;
  });

  return {
    salesTypeFilter: updatedSalesTypeFilter
  };
};

const applyIncludeNotForSaleFilter = (
  includeNotForSaleFilter: true | undefined
): Pick<CatalogQuery, 'includeNotForSale'> => {
  if (includeNotForSaleFilter) {
    return {
      includeNotForSale: true
    };
  }
  return {};
};

// sets the query settings from the URL and the search options results
export const createCatalogQuery = (
  searchOptions: SearchOptionsData,
  ignoreSearchParams?: boolean
): CatalogQuery => {
  // Format URL params into query
  const searchParams = new URLSearchParams(ignoreSearchParams ? '' : window.location.search);
  const rawQueryParams = UtilityService.getQueriesValueIntoInt(searchParams);

  // Filter out unknown parameters to keep URL clean
  const queryParams = UtilityService.filterUnknownQueryParams(rawQueryParams);

  const query = UtilityService.formatQueries(queryParams);

  const parsedTopics = parseTopicsFromString(query.topics || '', ',');

  const categoryResult = applyCategory(
    {
      categoryId: queryParams.Category,
      subcategoryId: queryParams.Subcategory,
      gearsId: queryParams.Gears,
      taxonomy: queryParams.taxonomy
    },
    searchOptions
  );

  const newCatalogQuery: CatalogQuery = {
    category: categoryResult.category,
    subcategory: categoryResult.subcategory,
    topicBasedBrowsingEnabledForCategory: categoryResult.topicBasedBrowsingEnabledForCategory,
    ...applySortMenus(queryParams.SortType, queryParams.SortAggregation, searchOptions.sortMenus),
    ...applyCreatorValues(
      {
        creatorId: queryParams.CreatorID as number,
        creatorName: queryParams.CreatorName,
        creatorType: queryParams.CreatorType
      },
      searchOptions
    ),
    ...applyCurrencyValue(
      queryParams.CurrencyType,
      queryParams.pxMin,
      queryParams.pxMax,
      searchOptions
    ),
    ...applySalesTypeFilter(queryParams.salesTypeFilter, searchOptions),
    topics: parsedTopics,
    keyword: queryParams.Keyword,
    ...applyIncludeNotForSaleFilter(queryParams.IncludeNotForSale)
  };

  return newCatalogQuery;
};

export const updateCatalogQuery = (
  queryParams: QueryParams,
  query: Query,
  searchOptions: SearchOptionsData
): CatalogQuery => {
  const parsedTopics = parseTopicsFromString(query.topics || '', ',');

  const newCatalogQuery: CatalogQuery = {
    ...applyCategory(
      {
        categoryId: queryParams.Category,
        subcategoryId: queryParams.Subcategory,
        gearsId: queryParams.Gears
      },
      searchOptions
    ),
    ...applySortMenus(queryParams.SortType, queryParams.SortAggregation, searchOptions.sortMenus),
    ...applyCreatorValues(
      {
        creatorId: queryParams.CreatorID as number,
        creatorName: queryParams.CreatorName,
        creatorType: queryParams.CreatorType
      },
      searchOptions
    ),
    ...applyCurrencyValue(
      queryParams.CurrencyType,
      queryParams.pxMin,
      queryParams.pxMax,
      searchOptions
    ),
    ...applySalesTypeFilter(queryParams.salesTypeFilter, searchOptions),
    topics: parsedTopics,
    keyword: queryParams.Keyword,
    ...applyIncludeNotForSaleFilter(queryParams.IncludeNotForSale)
  };

  return newCatalogQuery;
};
