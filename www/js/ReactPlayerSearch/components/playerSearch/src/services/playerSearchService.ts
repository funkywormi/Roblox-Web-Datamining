import { httpService, urlService, uuidService } from "@rbx/core-scripts/legacy/core-utilities";
import { friendshipStatuses } from "../constants/friendshipStatus";
import { playerSearchConstants } from "../constants/playerSearchConstants";
import type { ExtendedUserPresence } from "../types/extendedUserPresence";
import type {
  OmniSearchUser,
  SearchPaginationMethod,
  SearchResultUser,
  SearchUsersResponse,
  SearchedUser,
} from "../types/searchedUser";
import type { UserFollowing } from "../types/userFollowing";
import type { MultiGetPrimaryGroupItem } from "./groupsService";
import { getCurrentUser } from "./robloxGlobals";
import { multiGetUserPrimaryGroups } from "./groupsService";
import { multiGetUserPresences } from "./presenceService";
import {
  multiGetFriendshipStatuses,
  multiGetUserFollowings,
  type UserFriendship,
} from "./userRelationshipsService";

type SearchResultGroup = {
  contents: OmniSearchUser[];
};

type OmniSearchResponse = {
  searchResults: SearchResultGroup[];
  paginationMethod: SearchPaginationMethod;
  nextPageToken: string;
};

type ChatMetadataResponse = {
  isChatUserMessagesEnabled?: boolean;
};

export type CombinedSearchResults = {
  nextPageCursor: string;
  paginationMethod: SearchPaginationMethod;
  results: SearchResultUser[];
};

const sessionId = uuidService.generateRandomUuid();

const getMatchingPreviousName = (user: SearchResultUser, keyword: string): string | null => {
  const lowerKeyword = keyword.trim().toLowerCase();

  if (!lowerKeyword || user.previousUsernames.length === 0) {
    return null;
  }

  return (
    user.previousUsernames
      .map(previousName => previousName.trim())
      .find(previousName => {
        const lowerPreviousName = previousName.toLowerCase();

        return (
          lowerPreviousName.startsWith(lowerKeyword) &&
          lowerPreviousName !== user.name.toLowerCase()
        );
      }) ?? null
  );
};

export const searchUsers = async (
  keyword: string,
  cursor: string,
): Promise<SearchUsersResponse> => {
  const normalizedKeyword = keyword.trim();

  if (normalizedKeyword.length < playerSearchConstants.pageData.keywordMinLength) {
    return {
      paginationMethod: "Scroll",
      nextPageCursor: "",
      data: [],
    };
  }

  const response = await httpService.get<OmniSearchResponse>(
    {
      retryable: true,
      withCredentials: true,
      url: playerSearchConstants.urls.omniSearchUrl,
    },
    {
      verticalType: "user",
      searchQuery: normalizedKeyword,
      pageToken: cursor,
      globalSessionId: sessionId,
      sessionId,
    },
  );

  const currentUser = getCurrentUser();
  const users: SearchedUser[] = [];

  response.data.searchResults.forEach(group => {
    group.contents.forEach(result => {
      const profileUrl = urlService.getAbsoluteUrl(`/users/${result.contentId}/profile`);

      users.push({
        id: result.contentId,
        name: result.username,
        displayName: result.displayName,
        previousUsernames: result.previousUsernames ?? [],
        hasVerifiedBadge: result.hasVerifiedBadge,
        isCurrentUser: Number(currentUser.userId) === result.contentId,
        profileUrl: urlService.getUrlWithQueries(profileUrl, {
          friendshipSourceType: playerSearchConstants.playerSearchFriendshipOriginSourceType,
        }),
      });
    });
  });

  return {
    paginationMethod: response.data.paginationMethod,
    nextPageCursor: response.data.nextPageToken,
    data: users,
  };
};

export const combineResults = async (
  users: SearchedUser[],
  keyword: string,
  startIndex = 0,
): Promise<SearchResultUser[]> => {
  const currentUser = getCurrentUser();
  const userIds = users.map(user => user.id);

  let followings: UserFollowing[] = [];
  let friendships: UserFriendship[] = [];
  let presences: ExtendedUserPresence[] = [];
  let primaryGroups: MultiGetPrimaryGroupItem[] = [];

  if (currentUser.isAuthenticated && userIds.length > 0) {
    [followings, friendships, presences, primaryGroups] = await Promise.all([
      multiGetUserFollowings(userIds),
      multiGetFriendshipStatuses(userIds),
      multiGetUserPresences(userIds),
      multiGetUserPrimaryGroups(userIds),
    ]);
  }

  const followingMap = new Map(followings.map(following => [following.userId, following]));
  const friendshipMap = new Map(friendships.map(friendship => [friendship.id, friendship.status]));
  const presenceMap = new Map(presences.map(presence => [presence.userId, presence]));
  const primaryGroupMap = new Map(primaryGroups.map(group => [group.userId, group.primaryGroup]));

  return users.map((user, index) => {
    const following = followingMap.get(user.id);
    const presence = presenceMap.get(user.id);

    const combinedUser: SearchResultUser = {
      ...user,
      primaryGroup: primaryGroupMap.get(user.id),
      friendshipStatus:
        friendshipMap.get(user.id) ??
        (user.isCurrentUser ? friendshipStatuses.friends : friendshipStatuses.notFriends),
      isFollowing: following?.isFollowing ?? false,
      isFollowed: following?.isFollowed ?? false,
      // Parity with Angular's processUserProfiles, which drops the search endpoint's names so the
      // card shimmers until the authoritative ones arrive from the user-profiles service.
      areNamesLoading: true,
      matchingPreviousName: null,
      gameId: presence?.gameId,
      placeId: presence?.placeId,
      universeId: presence?.universeId,
      rootPlaceId: presence?.rootPlaceId,
      userPresenceType: presence?.userPresenceType ?? 0,
      gameIsPlayable: presence?.gameIsPlayable ?? false,
      lastLocation: presence?.lastLocation ?? "",
      absPos: startIndex + index,
    };

    combinedUser.matchingPreviousName = getMatchingPreviousName(combinedUser, keyword);

    return combinedUser;
  });
};

export const getSearchResults = async (
  keyword: string,
  cursor: string,
  startIndex = 0,
): Promise<CombinedSearchResults> => {
  const searchResponse = await searchUsers(keyword, cursor);
  const results = await combineResults(searchResponse.data, keyword, startIndex);

  return {
    nextPageCursor: searchResponse.nextPageCursor,
    paginationMethod: searchResponse.paginationMethod,
    results,
  };
};

export const isChatEntrypointEnabled = async (): Promise<boolean> => {
  if (!getCurrentUser().isAuthenticated) {
    return false;
  }

  try {
    const response = await httpService.get<ChatMetadataResponse>({
      url: playerSearchConstants.urls.chatMetadataUrl,
      withCredentials: true,
    });

    return response.data.isChatUserMessagesEnabled === true;
  } catch (error) {
    console.error("playerSearch: chat metadata failed, hiding the Chat action", error);

    return false;
  }
};
