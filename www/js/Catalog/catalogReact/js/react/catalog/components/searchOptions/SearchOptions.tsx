import React, { useCallback, useEffect, useState } from 'react';
import { WithTranslationsProps, withTranslations } from 'react-utilities';
import classNames from 'classnames';
import CategoryFilter from './CategoryFilter';
import SalesTypeFilters from './SalesTypeFilters';
import SortsFilters from './SortsFilters';
import UnavailableItemsFilter from './UnavailableItemsFilter';
import CreatorFilters from './CreatorFilters';
import PriceFilters from './PriceFilters';
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
import useIsRTL from '../../hooks/useIsRTL';

export type SearchOptionsProps = {
  searchOptions: SearchOptionsData;
  isPhone: boolean | undefined;
  isMobile: boolean;
  catalogQuery: CatalogQuery;
  displayedQuery: DisplayedQuery;
  setCreatorNameForDisplay: (newValue: string) => void;
  setMinPriceForDisplay: (newValue: number | '') => void;
  setMaxPriceForDisplay: (newValue: number | '') => void;
  updateCategory: (
    event: React.MouseEvent,
    isSubcategory: boolean,
    isSelected: boolean,
    category: Category,
    subcategory?: Subcategory
  ) => void;
  categoryClick: (event: React.MouseEvent, category: Category) => void;
  categoryNameClick: (event: React.MouseEvent, category: Category) => void;
  isCurrentCategorySearchable: boolean;
  menuConstantsCategoryTypesCommunityCreations: number;
  onSalesTypeFilterChanged: (salesTypeFilter: SalesTypeFilter['filter']) => void;
  onSortTypeChanged: (sortType: SortOption['sortType']) => void;
  onSortAggregationChanged: (sortAggregation: SortAggregation['sortAggregation']) => void;
  onUnavailableFilterChanged: (value: boolean) => void;
  onCreatorChanged: (creator: Creator) => void;
  applyCreatorNameToQuery: (newCreatorName?: string | null) => void;
  applyMinPriceToQuery: (newMinPrice?: number | null) => void;
  applyMaxPriceToQuery: (newMaxPrice?: number | null) => void;
  onCurrencyTypeChanged: (currencyType: CurrencyType) => void;
  isSearchOnBlurEnabled: boolean;
  closeSearchOptions: () => void;
  resetFilters: () => void;
};

export function SearchOptions({
  searchOptions,
  isPhone,
  isMobile,
  catalogQuery,
  displayedQuery,
  setCreatorNameForDisplay,
  setMinPriceForDisplay,
  setMaxPriceForDisplay,
  updateCategory,
  categoryClick,
  categoryNameClick,
  isCurrentCategorySearchable,
  menuConstantsCategoryTypesCommunityCreations,
  onSalesTypeFilterChanged,
  onSortTypeChanged,
  onSortAggregationChanged,
  onUnavailableFilterChanged,
  onCreatorChanged,
  applyCreatorNameToQuery,
  applyMinPriceToQuery,
  applyMaxPriceToQuery,
  onCurrencyTypeChanged,
  isSearchOnBlurEnabled,
  translate,
  closeSearchOptions,
  resetFilters
}: SearchOptionsProps & WithTranslationsProps): JSX.Element {
  const canShowFilters = isCurrentCategorySearchable;

  const {
    categories,
    defaultCategoryId,
    freeFilterId,
    hasSearchOptionsError,
    salesTypeFilters,
    creators,
    robloxUserId,
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
    currencyType,
    maxPrice,
    minPrice,
    category,
    subcategory
  } = catalogQuery;

  const [isUGCOnly, setIsUGCOnly] = useState<boolean>(false);

  useEffect(() => {
    setIsUGCOnly(category?.categoryId === menuConstantsCategoryTypesCommunityCreations);
  }, [category?.categoryId, menuConstantsCategoryTypesCommunityCreations]);

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

  const isRTL = useIsRTL();

  return (
    <div id='search-options' className='search-options'>
      <form
        className={classNames('search-options-form', {
          'border-right': !isMobile && !isRTL,
          'border-left': !isMobile && isRTL
        })}
        noValidate
        // The simplebar component doesn't seem to handle RTL layouts correctly, so we need to set the dir attribute back to LTR manually and then re-apply RTL to the child component
        dir={isRTL ? 'rtl' : 'ltr'}>
        {hasSearchOptionsError ? (
          <div className='section-content-off'>{translate('Response.GenericError')}</div>
        ) : (
          <div>
            <div className='border-bottom category-section'>
              <h2 className='font-header-1 search-options-header'>
                {translate('Heading.CatalogCategory')}
              </h2>
              <ul id='category-panel-group' className='panel-group'>
                {categories?.map(categoryOption => (
                  <CategoryFilter
                    key={categoryOption.categoryId}
                    currentCategory={category}
                    currentSubcategory={subcategory}
                    category={categoryOption}
                    updateCategory={updateCategory}
                    categoryClick={categoryClick}
                    categoryNameClick={categoryNameClick}
                  />
                ))}
              </ul>
            </div>

            {canShowFilters && (
              <div
                className={classNames('filters-section-container', {
                  'border-bottom': !isMobile
                })}>
                <h2 className='font-header-1 search-options-header filters-header'>
                  {translate('Label.Filter.Filters')}
                </h2>
                <div className='filters-section'>
                  {salesTypeFilters && salesTypeFilters.length > 0 && (
                    <div>
                      <div className='filter-label font-header-2'>
                        {translate('Label.Filter.SalesType')}
                      </div>
                      <SalesTypeFilters
                        salesTypeFilters={salesTypeFilters}
                        salesTypeFilter={salesTypeFilter}
                        onSalesTypeFilterChanged={onSalesTypeFilterChanged}
                      />
                    </div>
                  )}

                  {creators && (
                    <div>
                      <div className='filter-label font-header-2'>
                        {translate('Label.Filter.Creator')}
                      </div>
                      <CreatorFilters
                        creators={creators}
                        creatorNameInputValue={displayedQuery.creatorName}
                        setCreatorNameInputValue={setCreatorNameForDisplay}
                        selectedCreator={creator}
                        robloxUserId={robloxUserId}
                        isUGCOnly={isUGCOnly}
                        isPhone={!!isPhone}
                        onCreatorChanged={onCreatorChanged}
                        applyCreatorNameToQuery={applyCreatorNameToQuery}
                        customText={customText}
                        isSearchOnBlurEnabled={isSearchOnBlurEnabled}
                      />
                    </div>
                  )}

                  {currencyTypes && (
                    <div>
                      <div className='filter-label font-header-2'>
                        {translate('Label.Filter.Price')}
                      </div>
                      <PriceFilters
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
                        isSearchOnBlurEnabled={isSearchOnBlurEnabled}
                      />
                    </div>
                  )}

                  {!!sortMenus?.sortOptions?.length && (
                    <div>
                      <div className='filter-label font-header-2'>
                        {translate('Label.Filter.Sorts')}
                      </div>
                      <SortsFilters
                        sortMenus={sortMenus}
                        sortType={sortType}
                        sortAggregation={sortAggregation}
                        onSortTypeChanged={onSortTypeChanged}
                        onSortAggregationChanged={onSortAggregationChanged}
                      />
                    </div>
                  )}
                  <div className='font-header-2 filter-label'>
                    {translate('Label.Filter.UnavailableItems')}
                  </div>
                  <UnavailableItemsFilter
                    includeNotForSale={!!includeNotForSale}
                    onUnavailableFilterChanged={onUnavailableFilterChanged}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </form>
      {isMobile && (
        <div className='mobile-search-options-buttons-container'>
          <button
            type='button'
            className='btn-secondary-lg'
            onClick={event => {
              resetFilters();
            }}>
            <span> {translate('Action.Reset')} </span>
          </button>
          <button
            type='button'
            className='btn-primary-lg'
            onClick={event => {
              closeSearchOptions();
            }}>
            <span> {translate('Action.ViewItems')} </span>
          </button>
        </div>
      )}
    </div>
  );
}

export default withTranslations(SearchOptions, translationConfig);
