import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { hashQueryKey, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import groupMembershipService from '../../shared/services/groupMembershipService';
import sharedQueryKeys from '../../shared/services/queryKeys';
import { searchForumContent } from '../services/forumsService';
import { getForumSearchKey } from '../services/queryKeys';
import groupForumsConstants from '../constants/groupForumsConstants';
import { ForumCategory } from '../types';
import {
  ContentType,
  ForumSearchResponse,
  ForumSearchResultView,
  ForumsMode,
  ForumsUrlState
} from '../types/search';
import { mintSearchId } from '../../shared/utils/entrypointMetrics';
import {
  logCmntyForumsSearchConductedEvent,
  logCmntyForumsSearchResultsReturnedEvent
} from '../../shared/utils/logging';
import {
  ForumsSearchMode,
  ForumsSearchResultType,
  ForumsSearchTrigger,
  SearchSurface
} from '../../shared/constants/eventConstants';
import {
  MIN_QUERY_LENGTH,
  getFromTime,
  isAllCategories,
  parseMemberQuery
} from '../utils/forumsSearchUrl';

const MEMBER_TOKEN = /@\S+/g;
const CATEGORY_ALL_SCOPE = 'all';

// The SCC's minter returns '' until it loads, and an event with no join key is worse than a local one.
const newSearchId = (): string =>
  mintSearchId() || `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;

// No username reaches telemetry, whether or not the token was a leading author scope.
const stripMemberTokens = (text: string): string =>
  text.replace(MEMBER_TOKEN, ' ').replace(/\s+/g, ' ').trim();

export type UseForumsSearchOptions = {
  groupId: number;
  urlState: ForumsUrlState;
  mode: ForumsMode;
  // The route's category, which is the scope in no-text FilteredBrowse.
  currentCategoryId?: string;
  canViewMembers: boolean;
  // Every category a result could belong to, archived ones included.
  categories: ForumCategory[];
  // When false the hook is fully inert: no request fires regardless of URL state.
  enabled: boolean;
  searchTrigger: ForumsSearchTrigger;
  navEntryKey: string;
};

export type UseForumsSearchResult = {
  results: ForumSearchResultView[];
  isLoading: boolean;
  // A failed search is not an empty one: the caller must not show "no results" for it.
  isError: boolean;
  retrySearch: () => void;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
};

/**
 * The networking half of forums search: turns committed URL state into content-search results.
 * Owns no UI or URL state, so the query key and the request body are derived from the same
 * committed values and cannot disagree.
 */
function useForumsSearch({
  groupId,
  urlState,
  mode,
  currentCategoryId,
  canViewMembers,
  categories,
  enabled,
  searchTrigger,
  navEntryKey
}: UseForumsSearchOptions): UseForumsSearchResult {
  const { query, timeRange } = urlState;
  const contentType = urlState.contentType ?? ContentType.Any;

  // Only a finished `@username ` token scopes by author; an unfinished one is still being typed,
  // so it drives live suggestions (useMemberSearch) instead. effectiveQuery is the text with any
  // such token stripped off.
  const { authorUsername, effectiveQuery } = useMemo(() => {
    const memberQuery = canViewMembers ? parseMemberQuery(query) : null;
    if (!query) return { authorUsername: '', effectiveQuery: '' };
    if (!memberQuery?.isComplete) return { authorUsername: '', effectiveQuery: query };
    if (memberQuery.username.length < MIN_QUERY_LENGTH) {
      return { authorUsername: '', effectiveQuery: memberQuery.contentQuery || query };
    }
    return { authorUsername: memberQuery.username, effectiveQuery: memberQuery.contentQuery };
  }, [canViewMembers, query]);

  // Resolve `@username` to a user id. Keyed on the same tuple as the live suggestions query, so
  // the lookup already triggered while typing is reused from cache. Being a real query is also
  // what makes `enabled` hold: no request fires for a `?search=@bob foo` URL while the feature
  // is off.
  // isInitialLoading, not isFetching: a background refetch here must not flip the search off and
  // on, which would refetch every page of it and flash the skeleton.
  const { data: authorMatches, isInitialLoading: isResolvingAuthor } = useQuery({
    queryKey: sharedQueryKeys.getMemberSearchKey(groupId, authorUsername),
    queryFn: () => groupMembershipService.searchUsersInGroup(groupId, authorUsername),
    enabled: enabled && authorUsername.length > 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });

  const resolvedAuthorIds = useMemo(() => {
    if (!authorUsername || !authorMatches) return undefined;
    const match =
      authorMatches.data.find(
        entry => entry.user.username.toLowerCase() === authorUsername.toLowerCase()
      ) ?? authorMatches.data[0];
    return match ? [match.user.userId] : undefined;
  }, [authorUsername, authorMatches]);

  // Resolved here rather than in the queryFn so it lands in the query key: otherwise two fetches
  // on one key could use different absolute windows.
  const fromTime = useMemo(() => getFromTime(timeRange), [timeRange]);

  // In text Search the scope is the explicit URL scope ('all' meaning unscoped). In no-text
  // FilteredBrowse searchCategory is absent, so the route category is the scope.
  const effectiveCategoryId = useMemo(() => {
    if (mode !== ForumsMode.Search) return currentCategoryId;
    return isAllCategories(urlState.categoryId) ? undefined : urlState.categoryId;
  }, [mode, currentCategoryId, urlState.categoryId]);

  // Outside Browse there is always either text or an active filter, so the search should run —
  // except an @user search must wait for the author to resolve to at least one member.
  const isAuthorSearch = authorUsername.length > 0;
  const hasResolvedAuthor = (resolvedAuthorIds?.length ?? 0) > 0;
  const searchEnabled =
    enabled &&
    mode !== ForumsMode.Browse &&
    !isResolvingAuthor &&
    (!isAuthorSearch || hasResolvedAuthor);

  let searchMode = ForumsSearchMode.Text;
  if (mode === ForumsMode.FilteredBrowse) searchMode = ForumsSearchMode.FiltersOnly;
  else if (isAuthorSearch) searchMode = ForumsSearchMode.Member;

  const searchQueryKey = getForumSearchKey(
    groupId,
    query,
    contentType,
    timeRange,
    fromTime,
    effectiveCategoryId,
    resolvedAuthorIds?.join(',')
  );

  // The id is a function of the history entry and the query key. The entry, because two searches
  // can carry identical params — re-submitting a query, or returning to a filter after Browse.
  // The key, because a late-resolving input re-executes the search under the entry it was
  // committed on. Paging and refetching move neither, so they stay one search. The counter is what
  // an explicit retry bumps, since that re-executes the same key as a new search.
  const [retryCount, setRetryCount] = useState(0);
  const searchIdRef = useRef({ navEntryKey: '', key: '', retryCount: -1, id: '' });
  const searchIdKey = hashQueryKey(searchQueryKey);
  if (
    searchIdRef.current.navEntryKey !== navEntryKey ||
    searchIdRef.current.key !== searchIdKey ||
    searchIdRef.current.retryCount !== retryCount
  ) {
    searchIdRef.current = { navEntryKey, key: searchIdKey, retryCount, id: newSearchId() };
  }
  const { id: searchId } = searchIdRef.current;

  const {
    data: searchData,
    // isInitialLoading (not isLoading) so a disabled query — e.g. an @user search that resolves
    // to no members — reports false instead of react-query v4's status==='loading' for disabled
    // queries, which would otherwise pin the skeleton on forever and hide the empty state.
    isInitialLoading: isInitialLoadingSearch,
    isError: isSearchError,
    refetch: refetchSearch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useInfiniteQuery<ForumSearchResponse>({
    queryKey: searchQueryKey,
    queryFn: ({ pageParam }) =>
      searchForumContent(groupId, {
        query: effectiveQuery || undefined,
        contentType: contentType !== ContentType.Any ? contentType : undefined,
        fromTime,
        toTime: undefined,
        categoryIds: effectiveCategoryId ? [effectiveCategoryId] : undefined,
        authorIds: resolvedAuthorIds,
        cursor: pageParam as string | undefined,
        limit: groupForumsConstants.pageCounts.postsPerPage
      }),
    getNextPageParam: lastPage => lastPage.nextCursor || undefined,
    enabled: searchEnabled,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });

  const retrySearch = useCallback(() => {
    setRetryCount(count => count + 1);
    return refetchSearch();
  }, [refetchSearch]);

  // Every row coordinate is a position in the assembled pages, so it cannot drift from what the
  // user sees however many times react-query refetches. Category is resolved here too, so a
  // late-loading category list still fills in.
  const results = useMemo<ForumSearchResultView[]>(() => {
    const categoriesById = categories.reduce(
      (acc, category) => acc.set(category.id, category),
      new Map<string, ForumCategory>()
    );
    const rows: ForumSearchResultView[] = [];
    (searchData?.pages ?? []).forEach((page, pageIndex) => {
      page.results
        .filter(result => !!result.post)
        .forEach((result, positionOnPage) => {
          const category = categoriesById.get(result.post.categoryId);
          rows.push({
            ...result,
            searchId,
            resultType:
              result.contentType === 'Comment' && result.comment
                ? ForumsSearchResultType.Comment
                : ForumsSearchResultType.Post,
            pageIndex,
            positionOnPage,
            positionInList: rows.length,
            categoryName: category?.name ?? '',
            categoryShortId: category?.shortId ?? ''
          });
        });
    });
    return rows;
  }, [searchData, categories, searchId]);

  // One conducted event per search id, then one returned event per batch that search has served.
  // Both guarded by the ref rather than by the effect's deps, so a re-render cannot double-log.
  const loggedRef = useRef({ searchId: '', pageCount: 0 });
  useEffect(() => {
    if (!searchEnabled) return;

    if (loggedRef.current.searchId !== searchId) {
      loggedRef.current = { searchId, pageCount: 0 };
      logCmntyForumsSearchConductedEvent({
        searchId,
        groupId,
        surface: SearchSurface.ForumsSearch,
        searchMode,
        searchKeyword: stripMemberTokens(effectiveQuery),
        isMemberSearch: isAuthorSearch,
        searchTrigger,
        contentType,
        timeRange,
        // Full category id, not shortId: analytics joins on it.
        categoryScope: effectiveCategoryId ?? CATEGORY_ALL_SCOPE
      });
    }

    const pages = searchData?.pages ?? [];
    for (let pageIndex = loggedRef.current.pageCount; pageIndex < pages.length; pageIndex += 1) {
      const page = pages[pageIndex];
      logCmntyForumsSearchResultsReturnedEvent({
        searchId,
        groupId,
        surface: SearchSurface.ForumsSearch,
        totalResults: page.totalResults,
        pageIndex,
        hasMore: page.hasMore,
        results: results
          .filter(row => row.pageIndex === pageIndex)
          .map(row => ({
            resultType: row.resultType,
            postId: row.post.id,
            ...(row.comment && { commentId: row.comment.id }),
            positionInList: row.positionInList,
            positionOnPage: row.positionOnPage
          }))
      });
    }
    loggedRef.current.pageCount = pages.length;
  }, [
    searchEnabled,
    searchId,
    searchData,
    results,
    groupId,
    searchMode,
    effectiveQuery,
    isAuthorSearch,
    searchTrigger,
    contentType,
    timeRange,
    effectiveCategoryId
  ]);

  return {
    results,
    isLoading: isInitialLoadingSearch || isResolvingAuthor,
    isError: isSearchError,
    retrySearch,
    hasNextPage: hasNextPage ?? false,
    fetchNextPage,
    isFetchingNextPage
  };
}

export default useForumsSearch;
