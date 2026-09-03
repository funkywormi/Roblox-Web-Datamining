import { useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { ContentType, ForumsMode, ForumsUrlState, TimeRange } from '../types/search';
import { ForumsSearchTrigger } from '../../shared/constants/eventConstants';
import {
  buildSearchString,
  MIN_QUERY_LENGTH,
  deriveMode,
  parseSearchParams
} from '../utils/forumsSearchUrl';

export type ForumsSearchFilters = {
  contentType: ContentType;
  timeRange: TimeRange;
  categoryId: string | undefined;
};

export type UseForumsSearchUrlStateOptions = {
  // The category the route is on. It is the scope for a no-text FilteredBrowse, where no
  // searchCategory is written to the URL.
  currentCategoryId?: string;
};

export type UseForumsSearchUrlStateResult = {
  urlState: ForumsUrlState;
  mode: ForumsMode;
  // Display value only: absence reads as `Any`. The raw optional on urlState is what gets
  // written back, so a plain text search never gains a spurious searchType=Any.
  contentType: ContentType;
  timeRange: TimeRange;
  filterCategoryId: string | undefined;
  // Whether the param is explicitly in the URL (an explicit `Any` included). Since the display
  // contentType collapses absence to `Any`, this raw presence is what drives the filter badge.
  hasContentTypeFilter: boolean;
  submitSearch: (query: string) => void;
  applyFilters: (filters: ForumsSearchFilters) => void;
  resetFilters: () => void;
  clearSearch: () => void;
  searchTrigger: ForumsSearchTrigger;
  // The history entry the current search state was committed on. Empty on the loaded entry,
  // which history does not key.
  navEntryKey: string;
};

/**
 * The URL half of forums search: parses the executed-search state out of the query string and
 * writes it back. The URL is the single source of truth for everything the search request reads.
 *
 * Every writer here is user-initiated (Enter, applying filters, resetting, clearing), so all of
 * them `push` — Back then steps out of a search or undoes a filter. Only the load-time
 * default-category redirect in Categories replaces.
 */
function useForumsSearchUrlState({
  currentCategoryId
}: UseForumsSearchUrlStateOptions): UseForumsSearchUrlStateResult {
  const history = useHistory();
  const location = useLocation();
  const { pathname } = location;

  const urlState = useMemo(() => parseSearchParams(location.search), [location.search]);
  const mode = useMemo(() => deriveMode(urlState), [urlState]);

  const { query, timeRange, categoryId: filterCategoryId } = urlState;
  const contentType = urlState.contentType ?? ContentType.Any;

  const navigate = useCallback(
    (search: string, trigger: ForumsSearchTrigger = ForumsSearchTrigger.Search) => {
      history.push({ pathname, search, state: { searchTrigger: trigger } });
    },
    [history, pathname]
  );

  // Only a PUSH this hook wrote is a search action. Back, forward and first load are POP, the
  // load-time category redirect is REPLACE, and a PUSH from elsewhere — switching category, which
  // keeps any active filter and so does re-run the query — is navigation. The action is checked as
  // well as the state because a POP back onto one of our own entries still carries its trigger.
  const searchTrigger = useMemo<ForumsSearchTrigger>(() => {
    if (history.action !== 'PUSH') return ForumsSearchTrigger.Navigation;
    const entryState = location.state as { searchTrigger?: ForumsSearchTrigger } | undefined;
    return entryState?.searchTrigger ?? ForumsSearchTrigger.Navigation;
  }, [history.action, location]);

  const submitSearch = useCallback(
    (nextQuery: string) => {
      // Scope a text search to the current category unless the URL already carries a scope. With
      // no text we are leaving Search mode, so drop the category param entirely — the route
      // category scopes a no-text FilteredBrowse, and a leftover searchCategory would silently
      // scope a filters-only search.
      const hasText = nextQuery.trim().length >= MIN_QUERY_LENGTH;
      navigate(
        buildSearchString({
          query: nextQuery,
          // The raw optional, never the display value: a text search that never touched the
          // filters must stay `?search=q` with no searchType.
          contentType: urlState.contentType,
          timeRange,
          categoryId: hasText ? filterCategoryId ?? currentCategoryId : undefined
        })
      );
    },
    [navigate, urlState.contentType, timeRange, filterCategoryId, currentCategoryId]
  );

  const applyFilters = useCallback(
    (filters: ForumsSearchFilters) => {
      // Only text Search persists a category. In no-text FilteredBrowse the route category is
      // the scope, so writing categoryId would duplicate the route and count as a filter.
      navigate(
        buildSearchString({
          query,
          contentType: filters.contentType,
          timeRange: filters.timeRange,
          categoryId:
            mode === ForumsMode.Search ? filters.categoryId ?? currentCategoryId : undefined
        })
      );
    },
    [navigate, query, mode, currentCategoryId]
  );

  const resetFilters = useCallback(() => {
    // Clearing every filter returns a no-text URL to Browse; with a text query it leaves
    // `?search=q`.
    navigate(
      buildSearchString({
        query,
        contentType: undefined,
        timeRange: TimeRange.All,
        categoryId: undefined
      }),
      ForumsSearchTrigger.Reset
    );
  }, [navigate, query]);

  const clearSearch = useCallback(() => navigate(''), [navigate]);

  return {
    urlState,
    mode,
    contentType,
    timeRange,
    filterCategoryId,
    hasContentTypeFilter: urlState.contentType !== undefined,
    submitSearch,
    applyFilters,
    resetFilters,
    clearSearch,
    searchTrigger,
    navEntryKey: location.key ?? ''
  };
}

export default useForumsSearchUrlState;
