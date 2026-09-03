/* eslint-disable default-param-last */
import * as EventType from '../actions/eventType';

const DEFAULT_ERROR_TYPE = null;

const errorType = (state = DEFAULT_ERROR_TYPE, action) => {
  switch (action.type) {
    case EventType.SET_ERROR_TYPE:
      return action.errorType;
    default:
      return state;
  }
};

export default errorType;
