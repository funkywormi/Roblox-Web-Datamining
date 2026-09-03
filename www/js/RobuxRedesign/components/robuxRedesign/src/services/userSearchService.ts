import { EnvironmentUrls } from "@rbx/environment-urls";
import { APICall, HTTPVerb, withApiEvents } from "../utils/apiEventsCounter";

export type OmniSearchUser = {
  contentId: number;
  username: string;
  displayName: string;
  previousUsernames: string[];
  hasVerifiedBadge: boolean;
};

type SearchResultGroup = {
  contents: OmniSearchUser[];
};

type GetUsersResponse = {
  searchResults: SearchResultGroup[];
  nextPageToken: string;
};

export const USER_SEARCH_DEBOUNCE_TIME_MS = 500;
export const USER_SEARCH_MAX_RESULTS = 3;
export const USER_SEARCH_TREATMENT_MAX_RESULTS = 25;
export const USER_SEARCH_MIN_CHARACTERS = 3;
export const USER_SEARCH_MAX_CHARACTERS = 30;

export const getUsers = async (
  userName: string,
  sessionId: string,
): Promise<GetUsersResponse | undefined> =>
  withApiEvents<GetUsersResponse>(
    HTTPVerb.GET,
    APICall.USER_SEARCH,
    {
      url: `${EnvironmentUrls.apiGatewayUrl}/search-api/omni-search`,
      withCredentials: true,
    },
    {
      verticalType: "user",
      searchQuery: userName,
      sessionId,
      globalSessionId: sessionId,
    },
  );
