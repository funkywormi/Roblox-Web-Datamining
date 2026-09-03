import React, { useCallback, useMemo } from 'react';
import { WithTranslationsProps, withTranslations } from 'react-utilities';
import { AXAnalyticsService } from 'Roblox';
import CatalogFilter, { TFilterOption } from './filterDropdown/CatalogFilter';
import { CurrencyType } from '../../constants/types';
import translationConfig from '../../translation.config';
import { CatalogQuery } from '../../hooks/catalogQuery/catalogQuery.types';
import { SearchOptionsData } from '../../hooks/searchOptions/searchOptions.types';
import usePriceBreadcrumb from '../catalogBreadcrumbs/usePriceBreadcrumb';
import {
  convertDisplayPriceToQueryPrice,
  convertInputToDisplayPrice
} from '../../utils/priceUtils';

export type PriceDropdownProps = {
  currencyTypes: CurrencyType[];
  selectedCurrencyType?: CurrencyType | null;
  maxPrice?: number | null;
  minPrice?: number | null;
  maxPriceInputValue: number | '';
  minPriceInputValue: number | '';
  setMaxPriceInputValue: (newValue: number | '') => void;
  setMinPriceInputValue: (newValue: number | '') => void;
  showCurrencyType: (currencyType: CurrencyType) => boolean;
  robuxFilterId: number | undefined;
  customRobuxFilterId: number | undefined;
  applyMinPriceToQuery: (newMinPrice?: number | null) => void;
  applyMaxPriceToQuery: (newMaxPrice?: number | null) => void;
  onCurrencyTypeChanged: (currencyType: CurrencyType) => void;
  searchOptions: SearchOptionsData;
  catalogQuery: CatalogQuery;
  defaultCurrencyType?: CurrencyType;
};

const MIN_PRICE_INPUT_KEY = 'minPrice';
const MAX_PRICE_INPUT_KEY = 'maxPrice';

function PriceDropdown({
  currencyTypes,
  selectedCurrencyType,
  maxPrice,
  minPrice,
  maxPriceInputValue,
  minPriceInputValue,
  setMaxPriceInputValue,
  setMinPriceInputValue,
  showCurrencyType,
  robuxFilterId,
  customRobuxFilterId,
  applyMinPriceToQuery,
  applyMaxPriceToQuery,
  onCurrencyTypeChanged,
  searchOptions,
  catalogQuery,
  defaultCurrencyType,
  translate,
  intl
}: PriceDropdownProps & WithTranslationsProps): JSX.Element | null {
  const filters: TFilterOption<number>[] = useMemo(() => {
    return currencyTypes.map(currencyType => {
      const filterOption: TFilterOption<number> = {
        optionId: currencyType.currencyType,
        optionDisplayName: currencyType.name,
        optionValue: currencyType.currencyType
      };
      if (filterOption.optionId === customRobuxFilterId) {
        filterOption.textFields = [
          {
            key: MIN_PRICE_INPUT_KEY,
            label: translate('Label.Filter.PriceMin'),
            initialValue: minPriceInputValue.toString()
          },
          {
            key: MAX_PRICE_INPUT_KEY,
            label: translate('Label.Filter.PriceMax'),
            initialValue: maxPriceInputValue.toString()
          }
        ];
        filterOption.optionDisplayName = '';
      }
      return filterOption;
    });
  }, [currencyTypes, customRobuxFilterId, translate, minPriceInputValue, maxPriceInputValue]);

  const { showFreeBreadcrumb, showCustomPriceBreadcrumb, isPriceFilterNoOp } = usePriceBreadcrumb(
    searchOptions,
    catalogQuery
  );

  const isCurrencyFilterSelected =
    !isPriceFilterNoOp && (showFreeBreadcrumb || showCustomPriceBreadcrumb);

  const renderPillContents = useCallback(() => {
    return (
      <React.Fragment>
        {showFreeBreadcrumb && (
          <span className='filter-display-text'>{translate('Label.BreadCrumb.Free')}</span>
        )}
        {!showFreeBreadcrumb && showCustomPriceBreadcrumb && (
          <span className='filter-display-text'>
            {minPrice && !maxPrice ? (
              <React.Fragment>
                <span className='icon-robux-gray-16x16' />
                {translate('Label.BreadCrumb.PriceAbove', { price: minPrice.toString() })}
              </React.Fragment>
            ) : null}
            {maxPrice && minPrice ? (
              <React.Fragment>
                <span className='icon-robux-gray-16x16' />
                {/* eslint-disable-next-line react/jsx-no-literals */}
                {minPrice} - <span className='icon-robux-gray-16x16' />
                {maxPrice}
              </React.Fragment>
            ) : null}
            {maxPrice && !minPrice ? (
              <React.Fragment>
                <span className='icon-robux-gray-16x16' />
                {translate('Label.BreadCrumb.PriceBelow', {
                  price: maxPrice.toString()
                })}
              </React.Fragment>
            ) : null}
          </span>
        )}
      </React.Fragment>
    );
  }, [maxPrice, minPrice, showCustomPriceBreadcrumb, showFreeBreadcrumb, translate]);

  if (!selectedCurrencyType) {
    return null;
  }

  if (!defaultCurrencyType) {
    const itemName = `PriceDropdown_NoDefault`;
    const log = JSON.stringify({
      message: 'Unable to render PriceDropdown because defaultCurrencyType was not found!'
    });
    // Report the error
    // We need to specify container name as counters name so we can build the graphs on grafana
    AXAnalyticsService.reportAXError({ itemName, counterName: 'PriceDropdownError', log });

    return null;
  }

  return (
    <CatalogFilter<CurrencyType['currencyType']>
      filter={{
        filterDropdownName: translate('Label.Filter.Price'),
        filterDisplayName: defaultCurrencyType.name,
        renderPillContents: isCurrencyFilterSelected ? renderPillContents : undefined,
        filterOptions: filters,
        selectedOptionId:
          isCurrencyFilterSelected && selectedCurrencyType
            ? selectedCurrencyType.currencyType
            : defaultCurrencyType.currencyType,
        defaultOptionId: defaultCurrencyType.currencyType
      }}
      updateFilterValue={(newOptionValue, textValues) => {
        const newMinPriceValue = textValues?.[MIN_PRICE_INPUT_KEY] as string;
        let newMinDisplayPrice = convertInputToDisplayPrice(newMinPriceValue);

        const newMaxPriceValue = textValues?.[MAX_PRICE_INPUT_KEY] as string;
        let newMaxDisplayPrice = convertInputToDisplayPrice(newMaxPriceValue);

        const isMinPriceSet = !!newMinDisplayPrice || newMinDisplayPrice === 0;
        const isMaxPriceSet = !!newMaxDisplayPrice || newMaxDisplayPrice === 0;

        // If the supplied min is greater than the supplied max, reverse them
        if (
          isMaxPriceSet &&
          isMinPriceSet &&
          (newMinDisplayPrice || 0) > (newMaxDisplayPrice || 0)
        ) {
          [newMinDisplayPrice, newMaxDisplayPrice] = [newMaxDisplayPrice, newMinDisplayPrice]; // Swap min and max
        }

        setMinPriceInputValue(newMinDisplayPrice);
        const newMinQueryPrice = convertDisplayPriceToQueryPrice(newMinDisplayPrice);
        applyMinPriceToQuery(newMinQueryPrice);

        setMaxPriceInputValue(newMaxDisplayPrice);
        const newMaxQueryPrice = convertDisplayPriceToQueryPrice(newMaxDisplayPrice);
        applyMaxPriceToQuery(newMaxQueryPrice);

        const newSelectedCurrencyTypeId = newOptionValue?.optionId;
        const currencyType = currencyTypes.find(c => c.currencyType === newSelectedCurrencyTypeId);
        if (currencyType) {
          onCurrencyTypeChanged(currencyType);
        }
      }}
      translate={translate}
      intl={intl}
    />
  );
}

export default withTranslations(PriceDropdown, translationConfig);
