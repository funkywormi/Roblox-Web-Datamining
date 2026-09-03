import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'react-utilities';
import groupMembershipService from '../services/groupMembershipService';
import queryKeys from '../services/queryKeys';
import { User } from '../types';

// A fetch fires only after the user pauses typing, not on every keystroke.
export const MEMBER_SEARCH_DEBOUNCE_MS = 200;
// Below this, no request runs at all (a bare "@" should prompt, not search).
export const MEMBER_SEARCH_MIN_QUERY_LENGTH = 1;

/**
 * Mutually exclusive states of a member lookup, in precedence order:
 * - `belowMinLength` — prefix too short, nothing requested yet; prompt the user to type.
 * - `loading` — a request is in flight, or the prefix has changed and one is imminent.
 * - `error` — the request for the *current* prefix failed.
 * - `ready` — `members` is what the current prefix matched (possibly nothing).
 */
export type MemberSearchStatus = 'belowMinLength' | 'loading' | 'error' | 'ready';

export type UseMemberSearchOptions = {
  // When false the hook is fully inert: no request fires regardless of the prefix.
  enabled?: boolean;
  debounceMs?: number;
  minQueryLength?: number;
};

export type UseMemberSearchResult = {
  members: User[];
  status: MemberSearchStatus;
};

/**
 * Search the members of a community by username prefix, debounced.
 *
 * Takes the *live* prefix and debounces internally, so callers pass raw input straight through.
 * Keying the query on the debounced prefix is what handles staleness: a slow response only ever
 * writes to its own cache entry. `loading` additionally covers the settle window, so a result
 * the user has already typed past is never shown as settled.
 */
function useMemberSearch(
  groupId: number,
  prefix: string,
  {
    enabled = true,
    debounceMs = MEMBER_SEARCH_DEBOUNCE_MS,
    minQueryLength = MEMBER_SEARCH_MIN_QUERY_LENGTH
  }: UseMemberSearchOptions = {}
): UseMemberSearchResult {
  const debouncedPrefix = useDebounce(prefix, debounceMs);
  // The debounced prefix trails the live one, so a newer fetch is imminent and any settled
  // result belongs to input the user has already moved past.
  const isSettling = debouncedPrefix !== prefix;
  const isBelowMinLength = prefix.length < minQueryLength;

  const { data, isFetching, isError } = useQuery({
    queryKey: queryKeys.getMemberSearchKey(groupId, debouncedPrefix),
    queryFn: () => groupMembershipService.searchUsersInGroup(groupId, debouncedPrefix),
    enabled: enabled && debouncedPrefix.length >= minQueryLength,
    // An autosuggest shouldn't sit through exponential backoff before surfacing a failure.
    retry: false
  });

  const members = useMemo(() => (data?.data ?? []).map(entry => entry.user), [data]);

  const status: MemberSearchStatus = useMemo(() => {
    if (!enabled || isBelowMinLength) return 'belowMinLength';
    if (isSettling || isFetching) return 'loading';
    if (isError) return 'error';
    return 'ready';
  }, [enabled, isBelowMinLength, isSettling, isFetching, isError]);

  return { members, status };
}

export default useMemberSearch;
