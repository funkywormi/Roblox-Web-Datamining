import React, { useCallback } from 'react';
import { WithTranslationsProps, withTranslations } from 'react-utilities';
import {
  Category,
  Subcategory,
  SalesTypeFilter,
  Creator,
  CurrencyType,
  SortOption,
  SortAggregation
} from '../../constants/types';
import { SearchOptionsData } from '../../hooks/searchOptions/searchOptions.types';
import { CatalogQuery } from '../../hooks/catalogQuery/catalogQuery.types';
import { DisplayedQuery } from '../../hooks/useDisplayedQuery';
import { translationConfig } from '../../translation.config';
import CategoryDropdown from './CategoryDropdown';
import SalesTypeDropdown from './SalesTypeDropdown';
import CreatorDropdown from './CreatorDropdown';
import PriceDropdown from './PriceDropdown';
import SortsDropdown from './SortsDropdown';
import UnavailableItemsDropdown from './UnavailableItemsDropdown';

export type SearchOptionsTopBarProps = {
  searchOptions: SearchOptionsData;
  catalogQuery: CatalogQuery;
  displayedQuery: DisplayedQuery;
  setCreatorNameForDisplay: (newValue: string) => void;
  setMinPriceForDisplay: (newValue: number | '') => void;
  setMaxPriceForDisplay: (newValue: number | '') => void;
  updateCategory: (
    event: React.MouseEvent | null,
    isSubcategory: boolean,
    isSelected: boolean,
    category: Category,
    subcategory?: Subcategory
  ) => void;
  isCurrentCategorySearchable: boolean;
  onSalesTypeFilterChanged: (salesTypeFilter: SalesTypeFilter['filter']) => void;
  onSortTypeChanged: (sortType: SortOption['sortType']) => void;
  onSortAggregationChanged: (sortAggregation: SortAggregation['sortAggregation']) => void;
  onUnavailableFilterChanged: (value: boolean) => void;
  onCreatorChanged: (creator: Creator) => void;
  applyCreatorNameToQuery: (newCreatorName?: string | null) => void;
  applyMinPriceToQuery: (newMinPrice?: number | null) => void;
  applyMaxPriceToQuery: (newMaxPrice?: number | null) => void;
  onCurrencyTypeChanged: (currencyType: CurrencyType) => void;
};

function SearchOptionsTopBar({
  searchOptions,
  catalogQuery,
  displayedQuery,
  setCreatorNameForDisplay,
  setMinPriceForDisplay,
  setMaxPriceForDisplay,
  updateCategory,
  onSalesTypeFilterChanged,
  onSortTypeChanged,
  onSortAggregationChanged,
  onUnavailableFilterChanged,
  onCreatorChanged,
  applyCreatorNameToQuery,
  applyMinPriceToQuery,
  applyMaxPriceToQuery,
  onCurrencyTypeChanged
}: SearchOptionsTopBarProps & WithTranslationsProps): JSX.Element | null {
  const {
    categories,
    defaultCategoryId,
    freeFilterId,
    hasSearchOptionsError,
    salesTypeFilters,
    creators,
    customText,
    robuxFilterId,
    customRobuxFilterId,
    sortMenus,
    currencyTypes
  } = searchOptions;

  const {
    sortType,
    sortAggregation,
    includeNotForSale,
    salesTypeFilter,
    creator,
    creatorName,
    currencyType,
    maxPrice,
    minPrice,
    category,
    subcategory
  } = catalogQuery;

  const showCurrencyType = useCallback(
    (currencyTypeToShow: CurrencyType) => {
      if (!category || !currencyTypeToShow) {
        return false;
      }

      // hide free filter when the category is set to default
      return !(
        category.categoryId === defaultCategoryId &&
        currencyTypeToShow.currencyType === freeFilterId
      );
    },
    [category, defaultCategoryId, freeFilterId]
  );

  if (hasSearchOptionsError) {
    return null;
  }

  return (
    <div className='catalog-search-options-top-bar'>
      <CategoryDropdown
        currentCategory={category}
        currentSubcategory={subcategory}
        categories={categories}
        updateCategory={updateCategory}
        defaultCategory={searchOptions.defaultCategory}
      />
      {creators && (
        <CreatorDropdown
          creators={creators}
          creatorNameInputValue={displayedQuery.creatorName}
          setCreatorNameInputValue={setCreatorNameForDisplay}
          selectedCreator={creator}
          selectedCreatorName={creatorName}
          onCreatorChanged={onCreatorChanged}
          applyCreatorNameToQuery={applyCreatorNameToQuery}
          customText={customText}
          defaultCreator={searchOptions.defaultCreatorFilter}
        />
      )}
      {currencyTypes && (
        <PriceDropdown
          currencyTypes={currencyTypes}
          selectedCurrencyType={currencyType}
          maxPrice={maxPrice}
          maxPriceInputValue={displayedQuery.maxPrice}
          setMaxPriceInputValue={setMaxPriceForDisplay}
          minPrice={minPrice}
          minPriceInputValue={displayedQuery.minPrice}
          setMinPriceInputValue={setMinPriceForDisplay}
          showCurrencyType={showCurrencyType}
          robuxFilterId={robuxFilterId}
          customRobuxFilterId={customRobuxFilterId}
          applyMinPriceToQuery={applyMinPriceToQuery}
          applyMaxPriceToQuery={applyMaxPriceToQuery}
          onCurrencyTypeChanged={onCurrencyTypeChanged}
          searchOptions={searchOptions}
          catalogQuery={catalogQuery}
          defaultCurrencyType={searchOptions.defaultCurrencyType}
        />
      )}
      {!!sortMenus?.sortOptions?.length && (
        <SortsDropdown
          sortMenus={sortMenus}
          selectedSortType={sortType}
          selectedSortAggregation={sortAggregation}
          onSortTypeChanged={onSortTypeChanged}
          onSortAggregationChanged={onSortAggregationChanged}
          defaultSortValue={searchOptions.defaultSortValue}
          defaultSortAggregationValue={searchOptions.defaultSortAggregationValue}
        />
      )}
      {!!salesTypeFilters?.length && (
        <SalesTypeDropdown
          salesTypeFilters={salesTypeFilters}
          salesTypeFilter={salesTypeFilter}
          onSalesTypeFilterChanged={onSalesTypeFilterChanged}
          defaultSalesType={searchOptions.defaultSalesType}
        />
      )}
      <UnavailableItemsDropdown
        includeNotForSale={!!includeNotForSale}
        onUnavailableFilterChanged={onUnavailableFilterChanged}
      />
    </div>
  );
}

export default withTranslations(SearchOptionsTopBar, translationConfig);
