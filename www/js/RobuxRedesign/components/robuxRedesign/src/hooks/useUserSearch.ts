/* eslint-disable no-void */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { uuidService } from "@rbx/core-scripts/legacy/core-utilities";
import { useDebounce } from "@rbx/core-scripts/react";
import {
  getUsers,
  OmniSearchUser,
  USER_SEARCH_DEBOUNCE_TIME_MS,
  USER_SEARCH_MAX_RESULTS,
  USER_SEARCH_MIN_CHARACTERS,
} from "../services/userSearchService";
import { trackCounter } from "../observability";

export type UseUserSearchResult = {
  searchText: string;
  setSearchText: (text: string) => void;
  users: OmniSearchUser[];
  isSearching: boolean;
  clearSearch: () => void;
};

// Keep the default reference stable because it participates in searchUser's
// dependencies; an inline [] would recreate the callback on every render.
const DEFAULT_EXCLUDED_USER_IDS: readonly number[] = [];

type UseUserSearchOptions = {
  maxResults?: number;
  excludedUserIds?: readonly number[];
  invalidateRequestOnClear?: boolean;
};

export function useUserSearch({
  maxResults = USER_SEARCH_MAX_RESULTS,
  excludedUserIds = DEFAULT_EXCLUDED_USER_IDS,
  invalidateRequestOnClear = false,
}: UseUserSearchOptions = {}): UseUserSearchResult {
  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebounce(searchText, USER_SEARCH_DEBOUNCE_TIME_MS);
  const [users, setUsers] = useState<OmniSearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const requestId = useRef("");
  const sessionId = useMemo(() => uuidService.generateRandomUuid(), []);

  useEffect(() => {
    if (searchText !== debouncedSearchText) {
      setIsSearching(true);
    }
  }, [searchText, debouncedSearchText]);

  const clearSearch = useCallback(() => {
    if (invalidateRequestOnClear) {
      requestId.current = "";
    }
    setSearchText("");
    setUsers([]);
  }, [invalidateRequestOnClear]);

  const searchUser = useCallback(
    async (userName: string) => {
      const normalizedUserName = userName.trim();
      if (normalizedUserName.length < USER_SEARCH_MIN_CHARACTERS) {
        if (invalidateRequestOnClear) {
          requestId.current = "";
        }
        setUsers([]);
        setIsSearching(false);
        return;
      }

      const id = uuidService.generateRandomUuid();
      requestId.current = id;

      try {
        setIsSearching(true);
        trackCounter("UserSearchStarted");

        const response = await getUsers(normalizedUserName, sessionId);

        if (requestId.current !== id) {
          return;
        }

        const contents =
          response?.searchResults[0]?.contents
            .filter(user => !excludedUserIds.includes(user.contentId))
            .slice(0, maxResults) ?? [];
        setUsers(contents);
        if (response !== undefined && contents.length === 0) {
          trackCounter("UserSearchNoResults");
        }
      } finally {
        if (requestId.current === id) {
          setIsSearching(false);
        }
      }
    },
    [excludedUserIds, invalidateRequestOnClear, maxResults, sessionId],
  );

  useEffect(() => {
    void searchUser(debouncedSearchText);
  }, [debouncedSearchText, searchUser]);

  return {
    searchText,
    setSearchText,
    users,
    isSearching,
    clearSearch,
  };
}
