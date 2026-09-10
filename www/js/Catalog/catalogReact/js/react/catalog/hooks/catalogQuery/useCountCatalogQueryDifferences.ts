import { useMemo } from 'react';
import { CatalogQuery } from './catalogQuery.types';
import { createCatalogQuery } from './catalogQueryHelper';
import { SearchOptionsData } from '../searchOptions/searchOptions.types';
import countCatalogQueryDifferences from './countCatalogQueryDifferences';

function useCountCatalogQueryDifferences(
  catalogQuery: CatalogQuery,
  searchOptionsData: SearchOptionsData
): number {
  return useMemo(() => {
    const defaultCatalogQuery: CatalogQuery = createCatalogQuery(searchOptionsData, true);
    return countCatalogQueryDifferences(catalogQuery, defaultCatalogQuery);
  }, [catalogQuery, searchOptionsData]);
}

export default useCountCatalogQueryDifferences;
