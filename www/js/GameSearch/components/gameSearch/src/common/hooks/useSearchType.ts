import { useCallback, useEffect, useState } from "react";
import { window as browserWindow } from "@rbx/core-lib/browser";
import { subscribeToUrlChange } from "@rbx/www-common/navigation";
import { UrlSearchParams } from "@rbx/core-lib/url";

import { readEnabledAttribute } from "@rbx/discovery-common/utils";
import { getSearchSessionHistoryState } from "../utils/searchSessionHistory";

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
  const value = UrlSearchParams.parse(browserWindow?.location.search ?? "").get(
    SEARCH_TYPE_QUERY_PARAM,
  );
  return value === null ? null : value.toLowerCase();
};

export type SearchType = (typeof SearchType)[keyof typeof SearchType];

export const useSearchType = () => {
  const [rawSearchType, setRawSearchType] = useState(getSearchTypeFromQueryParams);

  useEffect(() => {
    const syncSearch = () => {
      setRawSearchType(getSearchTypeFromQueryParams());
    };

    syncSearch();

    return subscribeToUrlChange(syncSearch);
  }, []);

  const isTopSearchResultsEnabled = getIsTopSearchResultsEnabled();

  let searchType: SearchType;

  if (rawSearchType === SearchType.Top && isTopSearchResultsEnabled) {
    searchType = SearchType.Top;
  } else {
    searchType = SearchType.Games;
  }

  const setSearchType = useCallback((nextType: SearchType) => {
    if (browserWindow === undefined) {
      return;
    }

    const url = new URL(browserWindow.location.href);

    if (nextType === SearchType.Top) {
      url.searchParams.set(SEARCH_TYPE_QUERY_PARAM, SearchType.Top);
    } else {
      url.searchParams.delete(SEARCH_TYPE_QUERY_PARAM);
    }

    browserWindow.history.pushState(getSearchSessionHistoryState(), "", url.href);
  }, []);

  return [searchType, setSearchType] as const;
};
