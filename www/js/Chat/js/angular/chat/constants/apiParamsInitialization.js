import { EnvironmentUrls } from 'Roblox';
import chatModule from '../chatModule';

const apiParamsInitialization = {
  chatApiParams: {
    pageNumberOfUnreadConversations: 1,
    pageSizeOfUnreadConversations: 30,
    minimumNumConversations: 10,
    maximumGetUserConversationsDepth: 10,
    getUserConversationsNextCursor: null,
    pageSizeOfConversations: 20,
    pageSizeOfUnreadMessages: 30,
    pageSizeOfGetMessages: 20,
    startIndexOfFriendList: 0,
    pageSizeOfFriendList: 50,
    loadMoreUnreadConversations: false,
    loadMoreConversations: false
  },

  dialogParams: {
    loadMoreMessages: true,
    sendingMessage: false,
    sendMessageHasError: false,
    startIndexOfFriendList: 0,
    pageSizeOfFriendList: 50,
    pageSizeOfGetMessages: 20,
    smallestPageSizeOfGetMessages: 3,
    getMessagesNextCursor: null,
    maxKeystrokeDataLength: 200,
    keystrokeSampleRate: 1.0
  },

  contactsParams: {
    multiGetContactsMaxSize: 200,
    multiGetContactsCacheTTLinMS: 30000
  },

  gameUrls: {
    multiGetPlaceDetails: '/v1/games/multiget-place-details',
    getGamesByUniverseIds: EnvironmentUrls ? `${EnvironmentUrls.gamesApi}/v1/games` : '/v1/games',
    multiGetPlayabilityStatus: EnvironmentUrls
      ? `${EnvironmentUrls.gamesApi}/v1/games/multiget-playability-status`
      : '/v1/games/multiget-playability-status'
  },

  chatUrls: {
    setConversationUniverse: '/v2/set-conversation-universe',
    resetConversationUniverse: '/v2/reset-conversation-universe'
  },

  apiSets: {
    multiGetContacts: {
      url: EnvironmentUrls
        ? `${EnvironmentUrls.contactsApi}/v1/user/get-tags`
        : '/v1/user/get-tags',
      retryable: true,
      withCredentials: true
    },
    multiGetPresence: {
      url: EnvironmentUrls
        ? `${EnvironmentUrls.presenceApi}/v1/presence/users`
        : '/v1/presence/users',
      retryable: true,
      withCredentials: true
    },
    getMetaData: {
      url: EnvironmentUrls
        ? `${Roblox.EnvironmentUrls.apiGatewayUrl}/platform-chat-api/v1/metadata`
        : '/v1/metadata',
      retryable: false,
      withCredentials: true
    }
  }
};

chatModule.constant('apiParamsInitialization', apiParamsInitialization);

export default apiParamsInitialization;
