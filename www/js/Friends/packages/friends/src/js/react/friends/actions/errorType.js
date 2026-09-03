import * as EventType from './eventType';
import friendsConstants from '../constants/friendsConstants';

const {
  MAX_FRIENDS_STATUS,
  FRIENDS_ERROR_TYPE,
  MAX_FRIENDS_CODE,
  FLOODED_STATUS
} = friendsConstants;

export const SetErrorType = errorType => ({
  type: EventType.SET_ERROR_TYPE,
  errorType
});

export const HandleError = error => {
  return dispatch => {
    if (error) {
      const {
        data: {
          errors: [defaultError]
        },
        status
      } = error;
      switch (status) {
        case MAX_FRIENDS_STATUS:
          if (defaultError.code === MAX_FRIENDS_CODE.currentUser) {
            dispatch(SetErrorType(FRIENDS_ERROR_TYPE.currentUser));
          }
          if (defaultError.code === MAX_FRIENDS_CODE.receiverUser) {
            dispatch(SetErrorType(FRIENDS_ERROR_TYPE.receiverUser));
          }
          break;
        case FLOODED_STATUS:
          dispatch(SetErrorType(FRIENDS_ERROR_TYPE.flooded));
          break;
        default:
          dispatch(SetErrorType(FRIENDS_ERROR_TYPE.general));
          break;
      }
    }
  };
};
