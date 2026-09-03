import friendsConstants from './friendsConstants';

const { FRIENDTABS } = friendsConstants;

const FRIENDS_NOTIFICATIONS = {
  friendshipDestroyed: 'FriendshipDestroyed',
  friendshipCreated: 'FriendshipCreated',
  friendshipDeclined: 'FriendshipDeclined',
  friendshipRequested: 'FriendshipRequested'
};

export default {
  FRIENDS_NOTIFICATIONS,
  PRESENCE_NOTIFICATIONS: {
    presenceChanged: 'PresenceChanged'
  },
  FRIENDS_EVENT_TYPE: 'FriendshipNotifications',
  PRESENCE_EVENT_TYPE: 'PresenceBulkNotifications',
  TAB_EVENTS_MAP: {
    [FRIENDTABS.FRIENDS]: [
      FRIENDS_NOTIFICATIONS.friendshipDestroyed,
      FRIENDS_NOTIFICATIONS.friendshipCreated
    ],
    [FRIENDTABS.FRIENDREQUESTS]: [
      FRIENDS_NOTIFICATIONS.friendshipRequested,
      FRIENDS_NOTIFICATIONS.friendshipDeclined,
      FRIENDS_NOTIFICATIONS.friendshipCreated
    ]
  }
};
