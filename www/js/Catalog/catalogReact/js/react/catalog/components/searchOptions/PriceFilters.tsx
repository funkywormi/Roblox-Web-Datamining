import React, { useEffect } from 'react';
import { WithTranslationsProps, withTranslations } from 'react-utilities';
import { CurrencyType } from '../../constants/types';
import translationConfig from '../../translation.config';
import {
  convertDisplayPriceToQueryPrice,
  convertInputToDisplayPrice
} from '../../utils/priceUtils';

export type PriceFilterProps = {
  currencyTypes?: CurrencyType[];
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
  isSearchOnBlurEnabled: boolean;
};

function PriceFilter({
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
  isSearchOnBlurEnabled,
  translate
}: PriceFilterProps & WithTranslationsProps): JSX.Element | null {
  useEffect(() => {
    if (minPrice === null || minPrice === undefined) {
      setMinPriceInputValue('');
    } else {
      setMinPriceInputValue(minPrice);
    }
  }, [minPrice, setMinPriceInputValue]);

  useEffect(() => {
    if (maxPrice === null || maxPrice === undefined) {
      setMaxPriceInputValue('');
    } else {
      setMaxPriceInputValue(maxPrice);
    }
  }, [maxPrice, setMaxPriceInputValue]);

  const applyPricesToQuery = () => {
    const newMinPrice = convertDisplayPriceToQueryPrice(minPriceInputValue);
    applyMinPriceToQuery(newMinPrice);

    const newMaxPrice = convertDisplayPriceToQueryPrice(maxPriceInputValue);
    applyMaxPriceToQuery(newMaxPrice);
  };

  return currencyTypes ? (
    <ul>
      {currencyTypes.filter(showCurrencyType).map(currencyType => (
        <li key={currencyType.currencyType} className='radio top-border font-caption-body'>
          <input
            type='radio'
            name='radio-price'
            id={`radio-price-${currencyType.currencyType}`}
            checked={selectedCurrencyType?.currencyType === currencyType.currencyType}
            onChange={() => {
              onCurrencyTypeChanged(currencyType);
            }}
          />
          {currencyType.currencyType !== robuxFilterId &&
          currencyType.currencyType !== customRobuxFilterId ? (
            <label htmlFor={`radio-price-${currencyType.currencyType}`}>{currencyType.name}</label>
          ) : (
            <label
              htmlFor={`radio-price-${currencyType.currencyType}`}
              className='has-input price-min-max-input'>
              <input
                className='form-control input-field input-number price-input font-caption-body'
                type='number'
                pattern='[0-9]*'
                min='0'
                name='minPrice'
                placeholder={translate('Label.Filter.PriceMin')}
                value={minPriceInputValue}
                onChange={e => {
                  const newValue = convertInputToDisplayPrice(e.target.value);
                  setMinPriceInputValue(newValue);
                  if (isSearchOnBlurEnabled) {
                    const newPrice = convertDisplayPriceToQueryPrice(newValue);
                    applyMinPriceToQuery(newPrice);
                  }
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyPricesToQuery();
                  }
                }}
                onFocus={() => {
                  onCurrencyTypeChanged(currencyType);
                }}
              />
              <input
                className='form-control input-field input-number price-input font-caption-body'
                type='number'
                pattern='[0-9]*'
                min='0'
                name='maxPrice'
                placeholder={translate('Label.Filter.PriceMax')}
                value={maxPriceInputValue}
                onChange={e => {
                  const newValue = convertInputToDisplayPrice(e.target.value);
                  setMaxPriceInputValue(newValue);
                  if (isSearchOnBlurEnabled) {
                    const newPrice = convertDisplayPriceToQueryPrice(newValue);
                    applyMaxPriceToQuery(newPrice);
                  }
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyPricesToQuery();
                  }
                }}
                onFocus={() => {
                  if (currencyType !== selectedCurrencyType) {
                    onCurrencyTypeChanged(currencyType);
                  }
                }}
              />
              <button
                type='button'
                className='btn-secondary-xs btn-update-filter'
                disabled={
                  selectedCurrencyType?.currencyType !== robuxFilterId &&
                  selectedCurrencyType?.currencyType !== customRobuxFilterId
                }
                onClick={applyPricesToQuery}>
                {translate('Action.Go')}
              </button>
            </label>
          )}
        </li>
      ))}
    </ul>
  ) : null;
}

export default withTranslations(PriceFilter, translationConfig);
