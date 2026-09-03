import { AvatarCardItem } from 'react-style-guide';
import { userInfoService } from 'core-roblox-utilities';

export default {
  FRIENDS_EMPTY: 'Label.NoResults',
  CONNECTIONS_FILTER: {
    PLACEHOLDER: 'Label.FilterConnections'
  },
  FRIENDTABS: {
    FRIENDS: 'friends',
    FOLLOWING: 'following',
    FOLLOWERS: 'followers',
    FRIENDREQUESTS: 'friend-requests'
  },
  FRIEND_FILTER_OPTIONS: {
    ALL: 'all',
    TRUSTED: 'trusted'
  },
  FILTER_STATUS_OPTIONS: {
    0: 'Label.Offline',
    1: 'Label.Online',
    2: 'Label.InGame'
  },
  FILTER_STATUS_OPTIONS_DEFAULT: 'Label.All',
  LIST_TYPE: {
    friends: userInfoService.TYPE.FRIENDS,
    following: userInfoService.TYPE.FOLLOWINGS,
    followers: userInfoService.TYPE.FOLLOWERS,
    'friend-requests': userInfoService.TYPE.FRIENDREQUESTS
  },
  START_PAGE: 1,
  MAX_PER_PAGE: 18,
  MAX_LIMIT: 50,
  CACHE_CRITERIA: {
    useCache: true,
    expirationWindowMS: 30000
  },
  FRIEND_REQUEST_COUNT_EVENT: 'Roblox.Friends.CountChanged',
  MAX_FRIENDS_STATUS: 409,
  MAX_FRIENDS_CODE: {
    currentUser: 11,
    receiverUser: 12
  },
  CAPTCHA_CODE: 14,
  FLOODED_STATUS: 429,
  FORBIDDEN_STATUS: 403,
  FRIENDS_ERROR_TYPE: {
    currentUser: 'currentUser',
    receiverUser: 'receiverUser',
    general: 'general',
    flooded: 'flooded'
  },
  FRIENDS_ERROR: {
    currentUser: {
      titleText: 'Label.ErrorTitle',
      bodyText: 'Message.ForMaxFriendsError',
      neutralButtonText: 'Label.Ok',
      footerText: 'Message.ForMaxFriendsFooter'
    },
    receiverUser: {
      titleText: 'Label.ErrorTitle',
      bodyText: 'Message.ForMaxRequestsError',
      neutralButtonText: 'Label.Ok',
      footerText: 'Message.ForMaxRequestsFooter'
    },
    general: {
      titleText: 'Label.ErrorTitle',
      bodyText: 'Message.ForGeneralError',
      neutralButtonText: 'Label.Ok',
      footerText: 'Message.ForGeneralFooter'
    },
    flooded: {
      titleText: 'Label.ErrorTitle',
      bodyText: 'Message.FloodLimitExceededError',
      neutralButtonText: 'Label.Ok'
    }
  },
  SORT_ORDER: {
    asc: 'Asc',
    desc: 'Desc'
  },
  SORT_OPTIONS: {
    ALPHABETICAL: 'Alphabetical',
    API: 'Api',
    STATUS: 'Status'
  },
  EVENTS: {
    ACCEPTED_FRIEND_REQUEST: 'AcceptedFriendRequest',
    FRIEND_REQUESTS_DISPLAYED: 'FriendRequestsDisplayed',
    TOTAL_FRIEND_REQUESTS_RETRIEVED: 'TotalFriendRequestsRetrieved',
    FRIENDS_LANDING_PAGE_LOAD: 'friendsLandingPageLoad'
  },
  FRIENDS_REQUEST_LIST_CONTEXT: 'FriendsRequestListContext',
  PLUS_SIGN: '+',
  MUTUAL_FRIENDS_SHOW_COUNT: 5,
  DEVICE_TYPES: {
    computer: 'computer'
  },
  FRIENDS_RENAMED_TO_CONNECTIONS_CACHE_KEY: 'isFriendsRenamedToConnections',
  UNAVAILABLE_FRIEND_NAME: 'Label.UnavailableFriendName',
  TRUSTED_FRIEND_STATUS: {
    Friends: 'Friends',
    NotFriends: 'NotFriends',
    RequestSent: 'RequestSent',
    RequestReceived: 'RequestReceived',
    Invalid: 'Invalid',
    TrustedFriends: 'TrustedFriends',
    RequestIgnored: 'RequestIgnored'
  },
  FIND_FRIENDS_TYPES: {
    Friends: 'FindFriends',
    TrustedFriends: 'FindTrustedFriends'
  },
  AMP_FEATURE_NAMES: {
    IsUserInTcEligibleCountry: 'IsUserInTcEligibleCountry'
  },
  AMP_NAMESPACES: {
    ConnectionGraphCore: 'connection_graph_core/ConnectionGraphCore'
  }
};
