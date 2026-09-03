/* eslint-disable default-param-last */
import * as EventType from '../actions/eventType';

const DEFAULT_TABLOARDER = {
  isLoading: false
};

const tabLoader = (state = DEFAULT_TABLOARDER, action) => {
  switch (action.type) {
    case EventType.SET_TABLOADER:
      return action.data;
    default:
      return state;
  }
};

export default tabLoader;
