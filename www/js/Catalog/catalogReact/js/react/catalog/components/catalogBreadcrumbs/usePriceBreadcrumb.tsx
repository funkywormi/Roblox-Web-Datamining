import { useState, useEffect } from 'react';
import { CatalogQuery } from '../../hooks/catalogQuery/catalogQuery.types';
import { SearchOptionsData } from '../../hooks/searchOptions/searchOptions.types';

const usePriceBreadcrumb = (searchOptions: SearchOptionsData, catalogQuery: CatalogQuery) => {
  const { currencyType, minPrice, maxPrice } = catalogQuery;
  const { customRobuxFilterId, defaultCategoryId, freeFilterId } = searchOptions;

  const [showFreeBreadcrumb, setShowFreeBreadcrumb] = useState<boolean>(false);

  useEffect(() => {
    let shouldShowFreeBreadcrumb = false;

    if (currencyType && currencyType.currencyType === freeFilterId) {
      shouldShowFreeBreadcrumb = true;
    } else if (currencyType && currencyType.currencyType === customRobuxFilterId) {
      if (!minPrice && maxPrice === 0) {
        shouldShowFreeBreadcrumb = true;
      }
    }

    setShowFreeBreadcrumb(shouldShowFreeBreadcrumb);
  }, [currencyType, defaultCategoryId, freeFilterId, customRobuxFilterId, minPrice, maxPrice]);

  const [showCustomPriceBreadcrumb, setShowCustomPriceBreadcrumb] = useState<boolean>(false);

  useEffect(() => {
    let hasCustomPriceInputs = false;
    if (minPrice) {
      // If min price is a non-zero number, that qualifies as a custom input. Min value of 0 is equivalent to a no op in terms of filtering.
      hasCustomPriceInputs = true;
    } else if (typeof maxPrice === 'number') {
      // If max price is set to a number (even 0), that qualifies as a custom input.
      hasCustomPriceInputs = true;
    }
    if (currencyType && currencyType.currencyType === customRobuxFilterId && hasCustomPriceInputs) {
      setShowCustomPriceBreadcrumb(true);
    } else {
      setShowCustomPriceBreadcrumb(false);
    }
  }, [currencyType, defaultCategoryId, freeFilterId, customRobuxFilterId, minPrice, maxPrice]);

  const [isPriceFilterNoOp, setIsPriceFilterNoOp] = useState<boolean>(false);

  useEffect(() => {
    // If min price is 0 or undefined and no max price is set, that is equivalent to no price filter
    const isNoOp = (!minPrice || minPrice === 0) && !maxPrice && maxPrice !== 0;
    setIsPriceFilterNoOp(isNoOp);
  }, [maxPrice, minPrice]);

  return {
    showFreeBreadcrumb,
    showCustomPriceBreadcrumb,
    isPriceFilterNoOp
  };
};

export default usePriceBreadcrumb;
