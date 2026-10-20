import { useCallback, useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";

/**
 * Initializes filters using the initial URL params and
 * keeps the URL params in sync with the current filters
 */
const useFilterUrlParams = (): {
  filters: Map<string, string>;
  setFilters: (filters: Map<string, string>) => void;
  getInitialUrlParamFilters: () => Map<string, string>;
} => {
  const history = useHistory();
  const location = useLocation();

  const initialUrlParams = useRef<URLSearchParams>(new URLSearchParams(location.search));

  const getInitialUrlParamFilters = useCallback(() => {
    const urlParamFilters = new Map<string, string>();

    initialUrlParams.current.forEach((value, key) => {
      urlParamFilters.set(key, value);
    });

    return urlParamFilters;
  }, []);

  const [filters, setFilters] = useState<Map<string, string>>(getInitialUrlParamFilters);

  // Update the URL params with the currently selected filters for link sharing.
  // Skip when the query already matches so mount does not replaceState an
  // unchanged URL.
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    filters.forEach((value, key) => {
      newSearchParams.append(key, value);
    });

    const nextSearch = newSearchParams.toString();
    const currentSearch = location.search.startsWith("?")
      ? location.search.slice(1)
      : location.search;
    if (nextSearch === currentSearch) {
      return;
    }

    history.replace({ search: nextSearch });
  }, [filters, history, location.search]);

  return { filters, setFilters, getInitialUrlParamFilters };
};

export default useFilterUrlParams;
