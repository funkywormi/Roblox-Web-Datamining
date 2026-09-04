import environmentUrls from "@rbx/environment-urls";
import { friendshipStatuses } from "./friendshipStatus";
import type { SearchResultsState } from "../types/searchedUser";

export const playerSearchConstants = {
  urls: {
    omniSearchUrl: `${environmentUrls.apiGatewayUrl}/search-api/omni-search`,
    chatMetadataUrl: `${environmentUrls.apiGatewayUrl}/platform-chat-api/v1/metadata`,
    requestFriendshipUrl: `${environmentUrls.friendsApi}/v1/users/{targetId}/request-friendship`,
    acceptFriendRequestUrl: `${environmentUrls.friendsApi}/v1/users/{targetId}/accept-friend-request`,
    friendshipStatusesUrl: `${environmentUrls.friendsApi}/v1/users`,
    followingExistsUrl: `${environmentUrls.friendsApi}/v1/user/following-exists`,
    primaryGroupUrl: `${environmentUrls.groupsApi}/v1/users`,
    gamePlayabilityUrl: `${environmentUrls.gamesApi}/v1/games/multiget-playability-status`,
  },
  eventNames: {
    playerTileClick: "playerTileClick",
    playerFriendAdd: "playerFriendAdd",
    playerTileImpression: "playerTileImpression",
    playerFriendAccept: "playerFriendAccept",
  },
  pageData: {
    keywordMinLength: 3,
  },
  playerSearchEventContext: "playerSearch",
  playerSearchFriendshipOriginSourceType: "PlayerSearch",
  friendshipStatuses,
};

export const initialSearchState: SearchResultsState = {
  initialized: false,
  keyword: "",
  nextPageCursor: "",
  paginationMethod: "Scroll",
  results: [],
  resultsLoading: false,
  isKeywordTooShort: true,
  unsafeInputDetected: false,
};
