import { EnvironmentUrls } from "@rbx/environment-urls";
import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import type { AxiosResponse } from "@rbx/core-scripts/http";

const getUserSearchConfig = () => ({
  withCredentials: true,
  url: `${EnvironmentUrls.apiGatewayUrl}/search-api/omni-search`,
});

// The user data from an omni search result.
export type OmniSearchUser = {
  // The ID of the user.
  contentId: number;

  // The username.
  username: string;

  // The user display name.
  displayName: string;

  // The previous usernames for the user.
  previousUsernames: string[];

  // true, if the user has the verified creator badge.
  hasVerifiedBadge: boolean;
};

type SearchResultGroup = {
  // The returned users.
  contents: OmniSearchUser[];
};

type GetUsersResponse = {
  // The search results.
  searchResults: SearchResultGroup[];

  // A cursor which can be used to fetch the next page of results.
  nextPageToken: string;
};

export const getUsers = async (
  userName: string,
  sessionId: string,
): Promise<AxiosResponse<GetUsersResponse>> => {
  const urlConfig = getUserSearchConfig();
  const params = {
    verticalType: "user",
    searchQuery: userName,
    sessionId,
    globalSessionId: sessionId,
  };

  return httpService.get(urlConfig, params);
};
