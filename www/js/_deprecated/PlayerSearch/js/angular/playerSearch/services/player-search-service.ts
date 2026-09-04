import { uuidService } from '@rbx/core';
import { CurrentUser, EnvironmentUrls } from 'Roblox';
import { httpService, urlService } from 'core-utilities';
import playerSearchConstants from '../constants/playerSearchConstants';
import { OmniSearchUser, SearchedUser } from '../types/searched-user';

// The returned results from the user search request.
type UserSearchResponse = {
  // A cursor which can be used to fetch the next page of results.
  nextPageCursor: string;

  // Whether infinite scroll or load more button should be used to paginate
  paginationMethod: 'Scroll' | 'Button';

  // The translated search results.
  data: SearchedUser[];
};

// An omni-search group result.
type SearchResultGroup = {
  // The returned users.
  contents: OmniSearchUser[];
};

// The translated results from the omni-search endpoint.
type OmniSearchResponse = {
  // The search results.
  searchResults: SearchResultGroup[];

  // Whether infinite scroll or load more button should be used to paginate
  paginationMethod: 'Scroll' | 'Button';

  // A cursor which can be used to fetch the next page of results.
  nextPageToken: string;
};

// Used to keep track of player searches while they are on the page.
const sessionId = uuidService.generateRandomUuid();

// Searches for users by keyword.
const searchUsers = async (keyword: string, cursor: string): Promise<UserSearchResponse> => {
  if (!keyword || keyword.length < 3) {
    // If the keyword is too short, there's nothing to search.
    return {
      paginationMethod: 'Scroll',
      nextPageCursor: '',
      data: []
    };
  }

  const response = await httpService.get<OmniSearchResponse>(
    {
      retryable: true,
      withCredentials: true,
      // This API returns 25 results by default.
      url: `${EnvironmentUrls.apiGatewayUrl}/search-api/omni-search`
    },
    {
      verticalType: 'user',
      searchQuery: keyword,
      pageToken: cursor,
      globalSessionId: sessionId,
      sessionId
    }
  );

  const users: SearchedUser[] = [];
  response.data.searchResults.forEach((group: SearchResultGroup) => {
    group.contents.forEach((result: OmniSearchUser) => {
      const profileUrl = urlService.getAbsoluteUrl(`/users/${result.contentId}/profile`);
      const user: SearchedUser = {
        // Translate data from original result
        id: result.contentId,
        name: result.username,
        displayName: result.displayName,
        previousUsernames: result.previousUsernames || [],
        hasVerifiedBadge: result.hasVerifiedBadge,

        // Add additional data to the search results, to use later.
        isCurrentUser: Number(CurrentUser.userId) === result.contentId,
        profileUrl: urlService.getUrlWithQueries(profileUrl, {
          // TODO: Change `friendshipSourceType` param name to be more semantically correct and clean params after landing on profile page.
          friendshipSourceType: playerSearchConstants.playerSearchFriendshipOriginSourceType
        })
      };
      users.push(user);
    });
  });

  // Return translated result
  return {
    paginationMethod: response.data.paginationMethod,
    nextPageCursor: response.data.nextPageToken,
    data: users
  };
};

export default { searchUsers };
