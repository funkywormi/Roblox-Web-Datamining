import React, { useCallback, useEffect, useState } from 'react';
import { WithTranslationsProps, withTranslations } from 'react-utilities';
import { Category, Creator, CurrencyType, Subcategory } from '../../constants/types';
import { CatalogQuery } from '../../hooks/catalogQuery/catalogQuery.types';
import { SearchOptionsData } from '../../hooks/searchOptions/searchOptions.types';
import useCreatorBreadcrumb from './useCreatorBreadcrumb';
import usePriceBreadcrumb from './usePriceBreadcrumb';
import catalogConstants from '../../constants/catalogConstants';
import translationConfig from '../../translation.config';
import useIsRTL from '../../hooks/useIsRTL';

export type CatalogBreadcrumbsProps = {
  searchOptions: SearchOptionsData;
  catalogQuery: CatalogQuery;
  isKeywordCensored: boolean;
  getCategoryOption: (category?: Category) => Category | undefined;
  setSubcategory: (subcategory: Subcategory | null) => void;
  setCreator: (creator?: Creator) => void;
  setCurrencyType: (currencyType: CurrencyType | null | undefined) => void;
  clearKeyword: () => void;
};

export function CatalogBreadcrumbs({
  searchOptions,
  catalogQuery,
  isKeywordCensored,
  getCategoryOption,
  setSubcategory,
  setCreator,
  setCurrencyType,
  clearKeyword,
  translate
}: CatalogBreadcrumbsProps & WithTranslationsProps): JSX.Element {
  const { creators, defaultCreatorId, currencyTypes } = searchOptions;

  const { category, subcategory, minPrice, maxPrice, keyword } = catalogQuery;

  const { showCreatorBreadcrumb, isCreatorAGroup, creatorBreadcrumb } = useCreatorBreadcrumb(
    searchOptions,
    catalogQuery
  );

  const { showFreeBreadcrumb, showCustomPriceBreadcrumb } = usePriceBreadcrumb(
    searchOptions,
    catalogQuery
  );

  const showKeywordBreadcrumb = isKeywordCensored || (keyword && keyword.length > 0);

  const [isNonDefaultSubcategorySelected, setIsNonDefaultSubcategorySelected] = useState<boolean>(
    false
  );

  const isRTL = useIsRTL();
  const iconClass = isRTL ? 'icon-left-16x16' : 'icon-right-16x16';

  useEffect(() => {
    const cat = getCategoryOption(category);
    if (!cat || !cat.subcategories || !subcategory) {
      setIsNonDefaultSubcategorySelected(false);
    } else {
      const defaultSubcategory = cat.subcategories[0];
      setIsNonDefaultSubcategorySelected(
        defaultSubcategory.subcategoryId !== subcategory.subcategoryId
      );
    }
  }, [getCategoryOption, category, subcategory]);

  const clearPrice = useCallback(
    (keepKeyword = false) => {
      setCurrencyType(currencyTypes ? currencyTypes[0] : null);

      if (!keepKeyword) {
        clearKeyword();
      }
    },
    [clearKeyword, currencyTypes, setCurrencyType]
  );

  const clearCreator = useCallback(
    (stopChaining = false, keepKeyword = false) => {
      const defaultCreator = creators?.find(creator => creator.userId === defaultCreatorId);
      setCreator(defaultCreator);
      if (stopChaining) {
        clearKeyword();
      } else {
        clearPrice(keepKeyword);
      }
    },
    [creators, defaultCreatorId, clearKeyword, clearPrice, setCreator]
  );

  const clearKeywordAndCreator = useCallback(
    (stopChaining = false, keepKeyword = false) => {
      if (stopChaining) {
        clearKeyword();
      } else {
        clearCreator(false, keepKeyword);
      }
    },
    [clearKeyword, clearCreator]
  );

  const clearSubcategory = useCallback(() => {
    const cat = getCategoryOption(category);
    if (!cat || !cat.subcategories) {
      setSubcategory(null);
    } else {
      const defaultSubcategory = cat.subcategories[0];
      setSubcategory(defaultSubcategory);
    }

    clearKeywordAndCreator();
  }, [category, getCategoryOption, clearKeywordAndCreator, setSubcategory]);

  return (
    <div id='catalog-react-breadcrumbs' className='breadcrumbs'>
      <ul className='breadcrumb-container'>
        <li>
          <button type='button' className='text-link breadcrumb-link' onClick={clearSubcategory}>
            {category?.name}
          </button>
        </li>
        {isNonDefaultSubcategorySelected && (
          <React.Fragment>
            <li>
              <span className={iconClass} />
            </li>
            <li>
              <button
                type='button'
                className='text-link breadcrumb-link'
                onClick={clearKeywordAndCreator}>
                {subcategory?.name}
              </button>
            </li>
          </React.Fragment>
        )}
        {(showFreeBreadcrumb || showCustomPriceBreadcrumb || showCreatorBreadcrumb) && (
          <li>
            <span className={iconClass} />
          </li>
        )}
        {showCreatorBreadcrumb && (
          <li className='breadcrumb-filter'>
            <button type='button' onClick={clearPrice}>
              <span className='breadcrumb-filter-name'>
                {isCreatorAGroup && (
                  <span className='breadcrumb-group-label'>
                    {translate('Label.BreadCrumb.Group')}
                  </span>
                )}
                {creatorBreadcrumb}
              </span>
            </button>
          </li>
        )}
        {(showFreeBreadcrumb || showCustomPriceBreadcrumb) && (
          <li className='breadcrumb-filter'>
            <button type='button' onClick={clearKeyword}>
              {showFreeBreadcrumb && (
                <span className='breadcrumb-filter-name'>{translate('Label.BreadCrumb.Free')}</span>
              )}
              {showCustomPriceBreadcrumb && (
                <span className='breadcrumb-filter-name'>
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
            </button>
          </li>
        )}
        {showKeywordBreadcrumb && (
          <React.Fragment>
            <li>
              <span className={iconClass} />
            </li>
            <li>
              <span className='text-link breadcrumb-link'>
                {isKeywordCensored ? catalogConstants.keywordSearch.censoredKey : keyword}
              </span>
            </li>
          </React.Fragment>
        )}
      </ul>
    </div>
  );
}

export default withTranslations(CatalogBreadcrumbs, translationConfig);
