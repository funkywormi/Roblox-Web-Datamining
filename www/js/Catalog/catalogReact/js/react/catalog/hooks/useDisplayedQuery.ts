import { useState } from 'react';

export type DisplayedQuery = {
  keyword: string;
  isKeywordCensored: boolean;
  minPrice: number | '';
  maxPrice: number | '';
  creatorName: string;
};

const useDisplayedQuery = () => {
  const [keyword, setKeyword] = useState<string>('');
  const [isKeywordCensored, setIsKeywordCensored] = useState<boolean>(false);

  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');

  const [creatorName, setCreatorName] = useState<string>('');

  const displayedQuery: DisplayedQuery = {
    keyword,
    isKeywordCensored,
    minPrice,
    maxPrice,
    creatorName
  };

  return {
    keywordForDisplay: keyword,
    setKeywordForDisplay: setKeyword,

    isKeywordCensored,
    setIsKeywordCensored,

    minPriceForDisplay: minPrice,
    setMinPriceForDisplay: setMinPrice,

    maxPriceForDisplay: maxPrice,
    setMaxPriceForDisplay: setMaxPrice,

    creatorNameForDisplay: creatorName,
    setCreatorNameForDisplay: setCreatorName,

    displayedQuery
  };
};

export default useDisplayedQuery;
