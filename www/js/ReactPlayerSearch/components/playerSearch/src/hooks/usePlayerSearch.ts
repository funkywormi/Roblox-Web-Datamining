import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UserProfileField, useUserProfiles } from "@rbx/user-profiles";
import { friendshipStatuses, type FriendshipStatus } from "../constants/friendshipStatus";
import { initialSearchState, playerSearchConstants } from "../constants/playerSearchConstants";
import { getSearchResults } from "../services/playerSearchService";
import { getCurrentUser, getDeviceMeta } from "../services/robloxGlobals";
import type { SearchResultUser, SearchResultsState } from "../types/searchedUser";
import { useFriendshipRealtime } from "./useFriendshipRealtime";
import { useUserPresence } from "./useUserPresence";

type LoadSearchOptions = {
  keyword: string;
  cursor?: string;
  append?: boolean;
  startIndex?: number;
};

// `useUserProfiles` memoizes its query on the fields array's identity.
const profileNameFields = [UserProfileField.Names.CombinedName, UserProfileField.Names.Username];

const emptyUserIds: number[] = [];

const areUserIdsEqual = (left: number[], right: number[]): boolean => {
  return left.length === right.length && left.every((userId, index) => userId === right[index]);
};

const getInitialState = (keyword: string): SearchResultsState => {
  const isKeywordTooShort = keyword.trim().length < playerSearchConstants.pageData.keywordMinLength;

  return {
    ...initialSearchState,
    keyword,
    resultsLoading: !isKeywordTooShort,
    isKeywordTooShort,
  };
};

export const usePlayerSearch = (keyword: string) => {
  const [searchState, setSearchState] = useState<SearchResultsState>(() =>
    getInitialState(keyword),
  );
  const [inputValue, setInputValue] = useState(keyword);
  const stableResultsUserIdsRef = useRef<number[]>([]);

  const currentUser = getCurrentUser();
  const currentUserId = Number(currentUser.userId);
  const isUserGuest = !currentUser.isAuthenticated;
  const deviceMeta = getDeviceMeta();

  const applyResultUpdate = useCallback(
    (
      userId: number,
      update: Partial<SearchResultUser> | ((user: SearchResultUser) => SearchResultUser),
    ) => {
      setSearchState(previousState => ({
        ...previousState,
        results: previousState.results.map(user => {
          if (user.id !== userId) {
            return user;
          }

          if (typeof update === "function") {
            return update(user);
          }

          return {
            ...user,
            ...update,
          };
        }),
      }));
    },
    [],
  );

  const loadSearch = useCallback(
    async ({
      keyword: nextKeyword,
      cursor = "",
      append = false,
      startIndex = 0,
    }: LoadSearchOptions) => {
      const normalizedKeyword = nextKeyword.trim();
      const isKeywordTooShort =
        normalizedKeyword.length < playerSearchConstants.pageData.keywordMinLength;

      setSearchState(previousState => ({
        ...previousState,
        keyword: normalizedKeyword,
        initialized: true,
        resultsLoading: !isKeywordTooShort,
        isKeywordTooShort,
        unsafeInputDetected: false,
        ...(append
          ? {}
          : {
              results: [],
              nextPageCursor: "",
            }),
      }));

      if (isKeywordTooShort) {
        return;
      }

      try {
        const nextPage = await getSearchResults(normalizedKeyword, cursor, startIndex);

        setSearchState(previousState => {
          // The keyword is committed synchronously before the request, so a mismatch here means a
          // newer search has started and this response is stale.
          if (previousState.keyword !== normalizedKeyword) {
            return previousState;
          }

          return {
            ...previousState,
            keyword: normalizedKeyword,
            initialized: true,
            paginationMethod: nextPage.paginationMethod,
            nextPageCursor: nextPage.nextPageCursor,
            resultsLoading: false,
            unsafeInputDetected: false,
            isKeywordTooShort: false,
            results: append ? [...previousState.results, ...nextPage.results] : nextPage.results,
          };
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        setSearchState(previousState => {
          if (previousState.keyword !== normalizedKeyword) {
            return previousState;
          }

          return {
            ...previousState,
            initialized: true,
            keyword: normalizedKeyword,
            resultsLoading: false,
            nextPageCursor: "",
            ...(append ? {} : { results: [] }),
            unsafeInputDetected: errorMessage.includes("unsafeInput"),
          };
        });
      }
    },
    [],
  );

  useEffect(() => {
    // Adopting an equal-after-trim keyword would drop whitespace the user typed.
    setInputValue(previousValue => (previousValue.trim() === keyword ? previousValue : keyword));
    loadSearch({ keyword }).catch(() => undefined);
  }, [keyword, loadSearch]);

  const resultsUserIds = useMemo(
    () => searchState.results.map(user => user.id),
    [searchState.results],
  );
  const stableResultsUserIds = useMemo(() => {
    if (areUserIdsEqual(stableResultsUserIdsRef.current, resultsUserIds)) {
      return stableResultsUserIdsRef.current;
    }

    stableResultsUserIdsRef.current = resultsUserIds;
    return resultsUserIds;
  }, [resultsUserIds]);

  const {
    loading: areProfilesLoading,
    error: profilesError,
    data: profilesData,
  } = useUserProfiles(stableResultsUserIds, profileNameFields);

  useEffect(() => {
    if (stableResultsUserIds.length === 0) {
      return;
    }

    // Clear the shimmer on error too: the search endpoint's names are the fallback, and without this
    // `areNamesLoading` has no terminating condition.
    if (areProfilesLoading && profilesError == null && profilesData == null) {
      return;
    }

    setSearchState(previousState => ({
      ...previousState,
      results: previousState.results.map(user => {
        const names = profilesData?.[user.id]?.names;

        return {
          ...user,
          primaryName: names?.combinedName ?? user.primaryName,
          username: names?.username ?? user.username,
          areNamesLoading: false,
        };
      }),
    }));
  }, [stableResultsUserIds, areProfilesLoading, profilesError, profilesData]);

  const updateFriendshipStatus = useCallback(
    (resultUserId: number, status: FriendshipStatus) => {
      applyResultUpdate(resultUserId, {
        friendshipStatus: status,
      });
    },
    [applyResultUpdate],
  );

  const handleFriendshipRealtime = useCallback(
    (targetId: number, initiatorId: number, nextState: FriendshipStatus) => {
      if (targetId === currentUserId) {
        updateFriendshipStatus(initiatorId, nextState);
      }
    },
    [currentUserId, updateFriendshipStatus],
  );

  useFriendshipRealtime(handleFriendshipRealtime);

  useUserPresence(isUserGuest ? emptyUserIds : stableResultsUserIds, applyResultUpdate);

  return {
    ...searchState,
    inputValue,
    setInputValue,
    currentUserId,
    inMobile: Boolean(deviceMeta.isPhone),
    inMobileOrTabletBrowser:
      (deviceMeta.isPhone === true || deviceMeta.isTablet === true) && !deviceMeta.isInApp,
    inApp: Boolean(deviceMeta.isInApp),
    isUserGuest,
    submitSearch: (nextKeyword: string) => nextKeyword.trim(),
    loadSearch,
    loadMore: async () => {
      if (!searchState.nextPageCursor || searchState.resultsLoading) {
        return;
      }

      await loadSearch({
        keyword: searchState.keyword,
        cursor: searchState.nextPageCursor,
        append: true,
        startIndex: searchState.results.length,
      });
    },
    applyResultUpdate,
    updateFriendshipStatus,
    markFriendRequestSent: (userId: number) => {
      updateFriendshipStatus(userId, friendshipStatuses.requestSent);
    },
    markFriendRequestAccepted: (userId: number) => {
      updateFriendshipStatus(userId, friendshipStatuses.friends);
    },
  };
};
