import { ContentType, ForumsMode, ForumsUrlState, TimeRange } from '../types/search';

// Minimum length before a text query counts as a search.
export const MIN_QUERY_LENGTH = 2;

// Sentinel used by the filter sheet / URL to mean "all categories" (no category scoping).
export const CATEGORY_ALL = 'all';

/**
 * Whether a category scope covers every category: either the explicit `all` sentinel or no scope
 * at all. The two are equivalent everywhere except the filters sheet, which needs a concrete radio
 * value, so that is the only place that should reach for CATEGORY_ALL directly.
 */
export const isAllCategories = (categoryId: string | undefined): boolean =>
  !categoryId || categoryId === CATEGORY_ALL;

// Query-param names, shared by the parseSearchParams / buildSearchString pair below.
export const PARAM_QUERY = 'search';
export const PARAM_SEARCH_TYPE = 'searchType';
export const PARAM_TIME_RANGE = 'timeRange';
export const PARAM_CATEGORY_FILTER = 'searchCategory';

// Leading marker that turns a search query into an author-scoped one: `@username rest`.
export const MEMBER_PREFIX = '@';

export type MemberQueryParts = {
  // The username portion, without the leading '@'.
  username: string;
  // Whatever follows the username; empty until a space is typed.
  contentQuery: string;
  // A space terminates the username, marking a finished @user token. Live suggestions show only
  // while this is false; author resolution runs only once it is true.
  isComplete: boolean;
};

/**
 * Split a search query into its `@username` and content halves, or null when it is not
 * author-scoped. Shared by the search box (which drives suggestions off the in-progress
 * username) and the search request (which resolves the finished one to an author).
 */
export function parseMemberQuery(query: string): MemberQueryParts | null {
  if (!query.startsWith(MEMBER_PREFIX)) return null;
  const afterMarker = query.slice(MEMBER_PREFIX.length);
  const spaceIndex = afterMarker.indexOf(' ');
  if (spaceIndex > 0) {
    return {
      username: afterMarker.slice(0, spaceIndex),
      contentQuery: afterMarker.slice(spaceIndex + 1),
      isComplete: true
    };
  }
  return { username: afterMarker, contentQuery: '', isComplete: false };
}

export function deriveMode(state: ForumsUrlState): ForumsMode {
  const hasText = state.query.trim().length >= MIN_QUERY_LENGTH;
  const hasFilters =
    state.contentType !== undefined ||
    state.timeRange !== TimeRange.All ||
    !isAllCategories(state.categoryId);
  if (hasText) return ForumsMode.Search;
  if (hasFilters) return ForumsMode.FilteredBrowse;
  return ForumsMode.Browse;
}

// Read-side: URL query string -> executed-search state.
export function parseSearchParams(search: string): ForumsUrlState {
  const params = new URLSearchParams(search);
  return {
    query: params.get(PARAM_QUERY) ?? '',
    contentType: (params.get(PARAM_SEARCH_TYPE) as ContentType) || undefined,
    timeRange: (params.get(PARAM_TIME_RANGE) as TimeRange) || TimeRange.All,
    categoryId: params.get(PARAM_CATEGORY_FILTER) ?? undefined
  };
}

// Write-side twin of parseSearchParams (leading '?' when non-empty, '' otherwise). Defaults are
// omitted so a plain browse serializes to no query string.
export function buildSearchString(state: ForumsUrlState): string {
  const params = new URLSearchParams();
  if (state.query) params.set(PARAM_QUERY, state.query);
  // Write the content-type whenever present — an explicit `Any` IS a persistable filter.
  if (state.contentType) params.set(PARAM_SEARCH_TYPE, state.contentType);
  if (state.timeRange !== TimeRange.All) params.set(PARAM_TIME_RANGE, state.timeRange);
  if (state.categoryId) params.set(PARAM_CATEGORY_FILTER, state.categoryId);
  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

/**
 * Lower bound of the recency filter's window as an ISO timestamp, or `undefined` for "all time".
 *
 * Callers must memoize this on `timeRange` and feed it into the search query key — see
 * useForumsSearch. `now` is injectable so the boundaries are testable without mocking the clock.
 */
export function getFromTime(timeRange: TimeRange, now: Date = new Date()): string | undefined {
  if (timeRange === TimeRange.All) return undefined;
  const from = new Date(now.getTime());
  switch (timeRange) {
    case TimeRange.Day:
      from.setDate(from.getDate() - 1);
      break;
    case TimeRange.Week:
      from.setDate(from.getDate() - 7);
      break;
    case TimeRange.Month:
      from.setMonth(from.getMonth() - 1);
      break;
    default:
      return undefined;
  }
  return from.toISOString();
}
