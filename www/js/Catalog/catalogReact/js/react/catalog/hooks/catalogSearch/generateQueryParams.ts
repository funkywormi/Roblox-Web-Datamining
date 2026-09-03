import catalogConstants from '../../constants/catalogConstants';
import { Topic } from '../../constants/types';
import UtilityService from '../../services/utilityService';
import { CatalogQuery } from '../catalogQuery/catalogQuery.types';
import { SearchOptionsData } from '../searchOptions/searchOptions.types';
import { QueryParams } from '../../constants/queryParams.types';
import { taxonomyToArray } from '../../utils/taxonomyUtils';

const setSalesTypeParams = (originalParams: QueryParams, catalogQuery: CatalogQuery) => {
  const params = {
    ...originalParams
  };
  const { salesTypeFilter } = catalogQuery;

  params.salesTypeFilter = salesTypeFilter?.filter;
  return params;
};

const setPriceParams = (
  originalParams: QueryParams,
  catalogQuery: CatalogQuery,
  searchOptions: SearchOptionsData
) => {
  const params = { ...originalParams };
  const { currencyType, minPrice: queryMinPrice, maxPrice: queryMaxPrice } = catalogQuery;
  const { customRobuxFilterId, freeFilterId, defaultCurrencyId } = searchOptions;

  if (currencyType != null && currencyType.currencyType !== defaultCurrencyId) {
    params.CurrencyType = currencyType.currencyType;

    // If currencyType is Custom Robux, set min and max values
    if (currencyType.currencyType === customRobuxFilterId) {
      let minPrice = queryMinPrice && queryMinPrice.toString().length > 9 ? null : queryMinPrice;
      let maxPrice = queryMaxPrice && queryMaxPrice.toString().length > 9 ? null : queryMaxPrice;

      const isMinPriceSet = !!minPrice || minPrice === 0;
      const isMaxPriceSet = !!maxPrice || maxPrice === 0;

      // If the supplied min is greater than the supplied max, reverse them
      if (isMaxPriceSet && isMinPriceSet && (minPrice || 0) > (maxPrice || 0)) {
        [minPrice, maxPrice] = [maxPrice, minPrice]; // Swap min and max
      }

      params.pxMin = minPrice === null ? null : minPrice;
      params.pxMax = maxPrice;
    }

    if (currencyType.currencyType === freeFilterId) {
      params.pxMin = 0;
      params.pxMax = 0;
    }
  }

  return params;
};

const setCreatorParam = (
  originalParams: QueryParams,
  catalogQuery: CatalogQuery,
  searchOptions: SearchOptionsData
) => {
  const params = { ...originalParams };

  const { creator, creatorName } = catalogQuery;
  const { defaultCreatorId, robloxUserId, customText } = searchOptions;

  if (creator && creator.userId !== defaultCreatorId) {
    if (creator.userId === robloxUserId) {
      params.CreatorID = creator.userId;
    } else if (creator.userId === customText) {
      if (creatorName) {
        params.CreatorName = creatorName;
      }
    } else if (creator.userId) {
      params.CreatorID = creator.userId;
    }
  }

  if (creator && creator.type) {
    params.CreatorType = creator.type;
  }

  return params;
};

const setCategoryParams = (
  originalParams: QueryParams,
  catalogQuery: CatalogQuery,
  searchOptions: SearchOptionsData
) => {
  const params = { ...originalParams };
  const { category, subcategory } = catalogQuery;
  const { gearCategoryId } = searchOptions;

  if (category) {
    // Always set Category - let the URL filtering decide whether to include it
    params.Category = category.categoryId;

    if (subcategory != null) {
      if (category.categoryId === gearCategoryId) {
        const defaultSubcategoryId = parseInt(catalogConstants.defaults.subcategory, 10);
        // TODO: could remove this after rollout
        // if gear subcategory is the default, don't set it
        if (subcategory.subcategoryId !== defaultSubcategoryId) {
          params.Gears = subcategory.subcategoryId;
          params.Subcategory = subcategory.subcategoryId;
        }
      } else {
        params.Subcategory = subcategory.subcategoryId;
      }
      params.AssetTypeIds = subcategory.assetTypeIds || [];
      params.BundleTypeIds = subcategory.bundleTypeIds || [];
      // Include taxonomy if available - let URL filtering decide whether to include it
      const subcategoryTaxonomy = taxonomyToArray(subcategory.taxonomy);
      if (subcategoryTaxonomy.length > 0) {
        params.taxonomy = subcategoryTaxonomy;
      }
    } else {
      params.AssetTypeIds = category.assetTypeIds || [];
      params.BundleTypeIds = category.bundleTypeIds || [];
      // Include taxonomy if available - let URL filtering decide whether to include it
      const categoryTaxonomy = taxonomyToArray(category.taxonomy);
      if (categoryTaxonomy.length > 0) {
        params.taxonomy = categoryTaxonomy;
      }
    }
  }
  return params;
};

const setTopicParams = (selectedTopics: Topic[]) => {
  if (selectedTopics?.length) {
    return {
      TriggeredByTopicDiscovery: true,
      topics: UtilityService.buildTopicKeyword(selectedTopics, ',')
    };
  }
  return {};
};

const setCategoryFilterParams = (originalParams: QueryParams) => {
  const params = { ...originalParams };
  if (params.Category === 1 && params.Subcategory === undefined) {
    let validParamsForCategoryFilter = true;
    Object.entries(params).forEach(([key, value]) => {
      if (key === 'Keyword' && value !== undefined) {
        validParamsForCategoryFilter = false;
      }
      if (key === 'salesTypeFilter' && value !== 1) {
        validParamsForCategoryFilter = false;
      }
      // 'tZsUsd2BqGViQrJ9Vs3Wah' is the default taxonomy id across all versions
      // This will be changed to a backend driven implementation soon.
      if (key === 'taxonomy') {
        const isDefaultTaxonomy =
          value === 'tZsUsd2BqGViQrJ9Vs3Wah' ||
          (Array.isArray(value) && value.length === 1 && value[0] === 'tZsUsd2BqGViQrJ9Vs3Wah') ||
          (Array.isArray(value) && value.length === 0); // Empty array means no taxonomy (valid for category filter)

        if (!isDefaultTaxonomy && value !== undefined && value !== null) {
          validParamsForCategoryFilter = false;
        }
      }
      if (
        key !== 'Keyword' &&
        key !== 'salesTypeFilter' &&
        key !== 'AssetTypeIds' &&
        key !== 'BundleTypeIds' &&
        key !== 'Category' &&
        key !== 'taxonomy'
      ) {
        validParamsForCategoryFilter = false;
      }
    });

    if (validParamsForCategoryFilter) {
      params.CategoryFilter = 6;
    }
  }
  return params;
};

const generateQueryParams = (
  catalogQuery: CatalogQuery,
  searchOptions: SearchOptionsData
): QueryParams => {
  let queryParams: QueryParams = {
    Keyword: catalogQuery.keyword || undefined,
    ...setTopicParams(catalogQuery.topics)
  };
  queryParams = setCategoryParams(queryParams, catalogQuery, searchOptions);
  queryParams = setCreatorParam(queryParams, catalogQuery, searchOptions);

  queryParams = setPriceParams(queryParams, catalogQuery, searchOptions);
  queryParams = setSalesTypeParams(queryParams, catalogQuery);

  const { sortType, sortAggregation, includeNotForSale } = catalogQuery;
  const { defaultSortTypeId, defaultSortAggregationId } = searchOptions;

  if (sortType != null && sortType.sortType !== defaultSortTypeId) {
    queryParams.SortType = sortType.sortType;
  }

  if (
    sortType != null &&
    sortType.hasSubMenu &&
    sortAggregation != null &&
    sortAggregation.sortAggregation !== defaultSortAggregationId
  ) {
    queryParams.SortAggregation = sortAggregation.sortAggregation;
  }

  if (includeNotForSale) {
    queryParams.IncludeNotForSale = includeNotForSale;
  }

  queryParams = setCategoryFilterParams(queryParams);

  return queryParams;
};

export default generateQueryParams;
