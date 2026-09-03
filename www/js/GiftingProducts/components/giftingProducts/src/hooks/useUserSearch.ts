/* eslint-disable @typescript-eslint/no-floating-promises */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebounce } from "@rbx/core-scripts/react";
import { uuidService } from "@rbx/core-scripts/legacy/core-utilities";
import { getUsers, OmniSearchUser } from "../services/userSearchService";
import {
  USER_SEARCH_DEBOUNCE_TIME_MS,
  USER_SEARCH_MAX_RESULTS,
  USER_SEARCH_MIN_CHARACTERS,
} from "../constants/Constants";

export type UseUserSearchResult = {
  searchText: string;
  setSearchText: (text: string) => void;
  users: OmniSearchUser[];
  isSearching: boolean;
  clearSearch: () => void;
};

export default function useUserSearch(): UseUserSearchResult {
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
    setSearchText("");
    setUsers([]);
  }, [setSearchText, setUsers]);

  const searchUser = useCallback(
    async (userName: string) => {
      const normalizedUserName = userName.trim();
      if (normalizedUserName.length < USER_SEARCH_MIN_CHARACTERS) {
        setUsers([]);
        return;
      }

      const id = uuidService.generateRandomUuid();
      requestId.current = id;

      try {
        setIsSearching(true);

        const {
          data: { searchResults },
        } = await getUsers(normalizedUserName, sessionId);

        if (requestId.current !== id) {
          return;
        }

        // `contents` is typed as always-present, but guard against a malformed
        // result group at runtime.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- runtime null-safety despite the non-nullable type
        setUsers(searchResults[0]?.contents?.slice(0, USER_SEARCH_MAX_RESULTS) ?? []);
      } finally {
        if (requestId.current === id) {
          setIsSearching(false);
        }
      }
    },
    [sessionId],
  );

  useEffect(() => {
    searchUser(debouncedSearchText);
  }, [debouncedSearchText, searchUser]);

  return {
    searchText,
    setSearchText,
    users,
    isSearching,
    clearSearch,
  };
}
