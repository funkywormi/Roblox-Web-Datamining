import { Intl } from 'Roblox';
import {
  Category,
  Subcategory,
  CurrencyType,
  SalesTypeFilter,
  CategoryEnumLibrary
} from '../../constants/types';
import { NavigationMenuItemsResponse } from '../../services/catalogAPIService';
import { SearchOptionsData } from './searchOptions.types';
import menuConstants from '../../constants/menuConstants';
import catalogConstants from '../../constants/catalogConstants';

const intl = new Intl();

// compare subcategories of "Gear"
const gearSubcategoryCompare = (leftSubcategory: Subcategory, rightSubcategory: Subcategory) => {
  const gearSubcategoryId = parseInt(catalogConstants.allGearSubcategoryId, 10);
  // check to pin "All Gear" to the top
  if (leftSubcategory.subcategoryId === gearSubcategoryId) {
    return -1;
  }

  if (rightSubcategory.subcategoryId === gearSubcategoryId) {
    return 1;
  }

  return intl.langSensitiveCompare(leftSubcategory.name, rightSubcategory.name);
};

const getSearchOptions = (navMenuItemsResponse: NavigationMenuItemsResponse): SearchOptionsData => {
  const updatedSearchOptions: SearchOptionsData = {
    robloxUserId: navMenuItemsResponse.robloxUserId,
    robloxUserName: navMenuItemsResponse.robloxUserName,
    defaultCurrencyId: navMenuItemsResponse.defaultCurrency,
    freeFilterId: navMenuItemsResponse.freeFilter,
    customRobuxFilterId: navMenuItemsResponse.customRobuxFilter,
    robuxFilterId: navMenuItemsResponse.robuxFilter,
    allCategoriesId: navMenuItemsResponse.allCategories,
    defaultCategoryId: navMenuItemsResponse.defaultCategory,
    defaultCategoryIdForRecommendedSearch:
      navMenuItemsResponse.defaultCategoryIdForRecommendedSearch,
    gearCategoryId: navMenuItemsResponse.gearSubcategory,
    defaultGearSubcategoryId: menuConstants.defaultGearSubcategoryId,
    defaultSortTypeId: navMenuItemsResponse.defaultSortType,
    defaultSortAggregationId: navMenuItemsResponse.defaultSortAggregation,
    defaultCreatorId: navMenuItemsResponse.defaultCreator,
    customText: 'custom',
    isSearchOptionsLoaded: true
  };

  const newCategoriesWithCreatorFilters: number[] = [];
  if (navMenuItemsResponse.categoriesWithCreator) {
    navMenuItemsResponse.categoriesWithCreator.forEach(category => {
      newCategoriesWithCreatorFilters.push(category);
    });
  }

  updatedSearchOptions.categoriesWithCreatorFilters = newCategoriesWithCreatorFilters;

  const navigationMenuData = { ...navMenuItemsResponse };

  const categoryEnums: CategoryEnumLibrary = {};
  navigationMenuData.categories = navMenuItemsResponse.categories.map(category => {
    const updatedCategory: Category = {
      ...category,
      typeId: category.categoryId,
      Data: category.typeId?.toString(), // for transition
      Description: category.name
    };

    categoryEnums[updatedCategory.categoryId] = {
      categoryEnum: updatedCategory.category,
      subcategoryEnums: {}
    };
    if (updatedCategory.subcategories) {
      const subcategoryEnums = {};
      updatedCategory.subcategories = updatedCategory.subcategories.map(subCategory => {
        const updatedSubcategory: Subcategory = {
          ...subCategory,
          typeId: subCategory.subcategoryId,
          Data: subCategory.typeId?.toString(), // for transition
          Description: subCategory.name
        };
        subcategoryEnums[updatedSubcategory.subcategoryId] = updatedSubcategory.subcategory;
        return updatedSubcategory;
      });

      Object.assign(categoryEnums[updatedCategory.categoryId].subcategoryEnums, subcategoryEnums);
    }

    return updatedCategory;
  });

  updatedSearchOptions.defaultCategory = navigationMenuData.categories.find(
    category => category.categoryId === updatedSearchOptions.defaultCategoryId
  );

  updatedSearchOptions.categoryEnumLibrary = categoryEnums;

  const priceEnums = {};
  if (navMenuItemsResponse.priceFilters !== null) {
    navigationMenuData.priceFilters = navMenuItemsResponse.priceFilters.map(price => {
      const updatedPrice: CurrencyType = {
        ...price,
        typeId: price.currencyType, // for transition
        Data: price.typeId?.toString(), // for transition
        Description: price.name
      };
      priceEnums[updatedPrice.currencyType] = {
        typeId: updatedPrice.currencyType,
        name: updatedPrice.name
      };
      return updatedPrice;
    });
  }

  updatedSearchOptions.priceEnumLibrary = priceEnums;

  navigationMenuData.creatorFilters = navMenuItemsResponse.creatorFilters.map(creator => {
    return {
      ...creator,
      Data: creator.userId.toString(), // for transition
      Description: creator.name
    };
  });

  updatedSearchOptions.defaultCreatorFilter = navigationMenuData.creatorFilters.find(
    creatorFilter => creatorFilter.userId === updatedSearchOptions.defaultCreatorId
  );

  navigationMenuData.sortMenu.sortOptions = navMenuItemsResponse.sortMenu.sortOptions.map(
    sortOption => {
      return {
        ...sortOption,
        typeId: sortOption.sortType,
        Data: sortOption.typeId?.toString(),
        Description: sortOption.name
      };
    }
  );
  navigationMenuData.sortMenu.sortAggregations = navMenuItemsResponse.sortMenu.sortAggregations.map(
    sortAggregation => {
      return {
        ...sortAggregation,
        typeId: sortAggregation.sortAggregation,
        Data: sortAggregation.typeId?.toString(),
        Description: sortAggregation.name
      };
    }
  );

  const updatedSalesTypeFilters: SalesTypeFilter[] = [];
  navMenuItemsResponse.salesTypeFilters.forEach(salesType => {
    const salesTypeFilter: SalesTypeFilter = {
      name: salesType.name.toString(),
      filter: salesType.filter
    };
    updatedSalesTypeFilters.push(salesTypeFilter);
  });

  updatedSearchOptions.salesTypeFilters = updatedSalesTypeFilters;

  if (updatedSearchOptions.salesTypeFilters) {
    const [firstSalesTypeFilter] = updatedSearchOptions.salesTypeFilters;
    updatedSearchOptions.defaultSalesType = firstSalesTypeFilter;
  }

  navigationMenuData.categories.forEach(navMenuCategory => {
    // for now, only apply such sorting to subcategories of "Gear"
    if (navMenuCategory.categoryId === updatedSearchOptions.gearCategoryId) {
      navMenuCategory.subcategories?.sort(gearSubcategoryCompare);
    }
  });

  updatedSearchOptions.categories = navigationMenuData.categories;
  updatedSearchOptions.sortMenus = navigationMenuData.sortMenu;

  const { sortOptions, sortAggregations } = navigationMenuData.sortMenu;
  if (sortOptions) {
    const [firstSortOption] = sortOptions;
    updatedSearchOptions.defaultSortValue = firstSortOption;
  }

  if (sortAggregations) {
    const [firstSortAggregation] = sortAggregations;
    updatedSearchOptions.defaultSortAggregationValue = firstSortAggregation;
  }

  if (!navigationMenuData.creatorFilters) {
    updatedSearchOptions.creators = null;
  } else {
    updatedSearchOptions.creators = [
      ...navigationMenuData.creatorFilters,
      {
        name: null,
        isSelected: false,
        userId: updatedSearchOptions.customText
      }
    ];
  }

  updatedSearchOptions.currencyTypes = navigationMenuData.priceFilters;
  if (navigationMenuData.priceFilters.length > 0) {
    const [firstPriceFilter] = navigationMenuData.priceFilters;
    updatedSearchOptions.defaultCurrencyType = firstPriceFilter;
  }

  updatedSearchOptions.filtersInitialized = true;

  return updatedSearchOptions;
};

export default getSearchOptions;
