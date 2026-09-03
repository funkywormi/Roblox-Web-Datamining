import * as EventType from './eventType';

export const SetFriends = friends => ({
  type: EventType.SET_FRIENDS,
  friends
});

export const LoadMoreFriends = friends => ({
  type: EventType.LOAD_MORE_FRIENDS,
  friends
});
