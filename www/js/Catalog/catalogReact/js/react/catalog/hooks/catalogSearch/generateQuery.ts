import { QueryParams } from '../../constants/queryParams.types';
import { ModifiedQuery } from '../../constants/types';
import catalogConstants from '../../constants/catalogConstants';
import UtilityService from '../../services/utilityService';
import { CatalogQuery } from '../catalogQuery/catalogQuery.types';
import { SearchOptionsData } from '../searchOptions/searchOptions.types';

const cleanObject = (obj: ModifiedQuery): ModifiedQuery => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

const generateQuery = (
  catalogQuery: CatalogQuery,
  queryParams: QueryParams,
  searchOptions: SearchOptionsData,
  isInfiniteScrollDisabled: boolean | undefined
): { query: ModifiedQuery; showExpandedResults: boolean } => {
  const query = UtilityService.formatQueries(queryParams, catalogQuery.cursor);

  const modifiedQuery: ModifiedQuery = UtilityService.translateToEnumStrings(
    searchOptions.categoryEnumLibrary,
    query
  );
  const updatedQueries = cleanObject(modifiedQuery);

  let showExpandedResults = false;
  if (
    updatedQueries.category &&
    catalogConstants.expandedCategoryList.includes(updatedQueries.category)
  ) {
    showExpandedResults = true;
  } else if (
    (!updatedQueries.category ||
      !catalogConstants.expandedCategoryList.includes(updatedQueries.category)) &&
    !isInfiniteScrollDisabled
  ) {
    showExpandedResults = true;
  }

  return { query: updatedQueries, showExpandedResults };
};

export default generateQuery;
