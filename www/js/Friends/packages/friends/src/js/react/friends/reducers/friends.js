/* eslint-disable default-param-last */
import * as EventType from '../actions/eventType';

const DEFAULT_FRIENDS = [];

const friends = (state = DEFAULT_FRIENDS, action) => {
  switch (action.type) {
    case EventType.SET_FRIENDS:
      return action.friends;
    case EventType.LOAD_MORE_FRIENDS:
      return [...state, ...action.friends];
    default:
      return state;
  }
};

export default friends;
