import FriendStatus from '../enums/FriendStatus';
import { TAction, ActionType } from '../store/action';
import { TState } from '../store/contextProvider';

const profileHeaderReducer = (state: TState, action: TAction): TState => {
  switch (action.type) {
    case ActionType.SET_PROFILE_DATA:
      return { ...state, ...action.data };
    case ActionType.UPDATE_FRIEND_COUNT:
      return { ...state, friendCount: state.friendCount + action.amount };
    case ActionType.SET_FRIEND_STATUS:
      return { ...state, friendStatus: action.status };
    case ActionType.SET_NAMES:
      return { ...state, names: action.names };
    case ActionType.SET_ERROR_MESSAGE:
      return { ...state, showUserBlockModal: false, errorMessage: action.message };
    case ActionType.UPDATE_FOLLOWERS_COUNT:
      return { ...state, followersCount: state.followersCount + action.amount };
    case ActionType.UPDATE_FOLLOWING:
      return { ...state, isFollowing: action.following };
    case ActionType.SHOW_BLOCK_USER_MODAL:
      return { ...state, showUserBlockModal: action.show };
    case ActionType.SHOW_ALIAS_EDIT_MODAL:
      return { ...state, showAliasEditModal: action.show };
    case ActionType.SHOW_ABUSE_REPORT_DIALOG:
      return { ...state, showAbuseReportDialog: action.show };
    case ActionType.UPDATE_USER_BLOCK:
      return {
        ...state,
        isBlocked: action.block,
        friendStatus: FriendStatus.NotFriends,
        showUserBlockModal: false
      };
    default:
      throw new Error();
  }
};

export { profileHeaderReducer as default };
