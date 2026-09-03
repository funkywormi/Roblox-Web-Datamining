import { EnvironmentUrls } from 'Roblox';
import playerSearchModule from '../playerSearchModule';

const playerSearchConstants = {
  layout: {
    userInfo: {
      game: 'inGame',
      studio: 'inStudio',
      group: 'primaryGroup'
    },
    friendship: {},
    inMobile: false,
    isUserGuest: false,
    useInfiniteScrolling: true,
    resultsLoading: false,
    unsafeInputDetected: false,
    isKeywordTooShort: false
  },
  pageData: {
    keyword: null,
    initialized: false,
    inApp: true,
    inMobileOrTabletBrowser: false,
    keywordMinLength: 3,
    nextPageCursor: ''
  },
  friendshipStatus: {
    NoFriendship: 'NotFriends',
    PendingOnOtherUser: 'RequestSent',
    PendingOnCurrentUser: 'RequestReceived',
    Friends: 'Friends'
  },
  templates: {
    playerSearchBase: 'player-search-base'
  },
  urls: {
    searchUrl: '/search/users/results',
    chatMetadataUrl: `${EnvironmentUrls.apiGatewayUrl}/platform-chat-api/v1/metadata`,
    requestFriendshipUrl: `${EnvironmentUrls.friendsApi}/v1/users/{targetId}/request-friendship`,
    acceptFriendRequestUrl: `${EnvironmentUrls.friendsApi}/v1/users/{targetId}/accept-friend-request`
  },
  pageDirection: {
    prev: 'prev',
    next: 'next'
  },
  playerSearchEventCtx: 'playerSearch',
  eventNames: {
    playerTileClick: 'playerTileClick',
    playerFriendAdd: 'playerFriendAdd',
    playerTileImpression: 'playerTileImpression',
    playerFriendAccept: 'playerFriendAccept'
  },
  playerSearchFriendshipOriginSourceType: 'PlayerSearch',
  playerSearchResultsExperimentLayer: 'Social.UserSearchWeb'
};

playerSearchModule.constant('playerSearchConstants', playerSearchConstants);
export default playerSearchConstants;
