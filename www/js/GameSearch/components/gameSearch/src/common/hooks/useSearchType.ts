import { UrlSearchParams } from "@rbx/core-lib/url";

import { readEnabledAttribute } from "@rbx/discovery-common/utils";

const TOP_SEARCH_RESULTS_META_NAME = "top-search-results-data";
const ENABLED_DATASET_KEY = "enabled";
const SEARCH_TYPE_QUERY_PARAM = "searchType";
const SearchType = {
  Top: "top",
  Games: "games",
} as const;

const getIsTopSearchResultsEnabled = (): boolean =>
  readEnabledAttribute(TOP_SEARCH_RESULTS_META_NAME, ENABLED_DATASET_KEY);

const getSearchTypeFromQueryParams = (): string | null => {
  const value = UrlSearchParams.parse(window.location.search).get(SEARCH_TYPE_QUERY_PARAM);
  return value === null ? null : value.toLowerCase();
};

type SearchType = (typeof SearchType)[keyof typeof SearchType];

/**
 * Determines the search type to use.
 *
 * Preemptively made into a hook because we will have a future state with tabs
 * that will have to sync with search params. In that state, this hook should
 * also return a setter to update the search type. Right now the only way for
 * the search type to be updated is by changing the url which will trigger a page reload.
 */
export const useSearchType = (): [SearchType] => {
  const rawSearchType = getSearchTypeFromQueryParams();
  const isTopSearchResultsEnabled = getIsTopSearchResultsEnabled();

  let searchType: SearchType;

  if (rawSearchType === SearchType.Top && isTopSearchResultsEnabled) {
    searchType = SearchType.Top;
  } else {
    searchType = SearchType.Games;
  }

  return [searchType];
};
