import { useEffect, useState } from 'react';
import { CatalogQuery } from './catalogQuery.types';
import { createCatalogQuery } from './catalogQueryHelper';
import { SearchOptionsData } from '../searchOptions/searchOptions.types';

function countDifferences(query1: CatalogQuery, query2: CatalogQuery): number {
  return (Object.keys(query1) as (keyof CatalogQuery)[])
    .filter(key => key !== 'topicBasedBrowsingEnabledForCategory' && key !== 'keyword')
    .reduce((count, key) => {
      const query1Value = query1[key];
      const query2Value = query2[key];
      if (!query1Value && !query2Value) {
        return count;
      }
      let isDifferent = JSON.stringify(query1[key]) !== JSON.stringify(query2[key]);
      // Only count subcategory difference if the category is the same
      if (key === 'subcategory' && isDifferent && query1.category !== query2.category) {
        isDifferent = false;
      }

      return isDifferent ? count + 1 : count;
    }, 0);
}

function useCountCatalogQueryDifferences(
  catalogQuery: CatalogQuery,
  searchOptionsData: SearchOptionsData
): number {
  const [numberOfAppliedFilters, setNumberOfAppliedFilters] = useState<number>(0);

  useEffect(() => {
    if (!catalogQuery) {
      return;
    }

    const defaultCatalogQuery: CatalogQuery = createCatalogQuery(searchOptionsData, true);
    const differences = countDifferences(catalogQuery, defaultCatalogQuery);

    setNumberOfAppliedFilters(differences);
  }, [catalogQuery, searchOptionsData]);

  return numberOfAppliedFilters;
}

export default useCountCatalogQueryDifferences;
