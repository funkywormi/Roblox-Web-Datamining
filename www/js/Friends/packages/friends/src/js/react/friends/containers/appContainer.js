import { connect } from 'react-redux';
import { userInfoService } from 'core-roblox-utilities';
import { SetFriends, LoadMoreFriends } from '../actions/friends';
import SetMetadata from '../actions/metaData';
import { EnableTabLoader, DisableTabLoader } from '../actions/tabLoader';
import { SetErrorType, HandleError } from '../actions/errorType';
import friendsService from '../services/friendsService';
import friendsConstants from '../constants/friendsConstants';
import { isCaptchaResponse, getDataExchangeFromError } from '../util/captchaUtil';

const { LIST_TYPE, CACHE_CRITERIA, FRIEND_REQUEST_COUNT_EVENT } = friendsConstants;

const mapStateToProps = ({ friends, metadata, tabLoader, errorType }) => {
  return {
    friends,
    metadata,
    tabLoader,
    errorType
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setMetadata: data => {
      dispatch(SetMetadata(data));
    },
    setFriends: (friends = []) => {
      dispatch(SetFriends(friends));
    },
    loadMoreFriends: (friends = []) => {
      dispatch(LoadMoreFriends(friends));
    },
    enableTabLoader: () => {
      dispatch(EnableTabLoader());
    },
    disableTabLoader: () => {
      dispatch(DisableTabLoader());
    },
    clearError: () => {
      dispatch(SetErrorType(null));
    },
    followFriend: (targetUserId, captchaData) => {
      return friendsService.follow(targetUserId, captchaData).catch(error => {
        if (isCaptchaResponse(error) && !captchaData) {
          throw new Error(getDataExchangeFromError(error));
        } else {
          dispatch(HandleError(error));
        }
      });
    },
    unfollowFriend: targetUserId => {
      return friendsService.unfollow(targetUserId).catch(error => dispatch(HandleError(error)));
    },
    acceptFriendRequest: removeCardFunc => {
      // TODO: move acceptFriendRequest to FriendsProvider
      return targetUserId => {
        return friendsService
          .acceptFriendRequest(targetUserId.id)
          .then(() => removeCardFunc(targetUserId.id))
          .then(() => {
            userInfoService.refreshCacheData(LIST_TYPE['friend-requests'], CACHE_CRITERIA);
          })
          .catch(error => dispatch(HandleError(error)));
      };
    },
    declineFriendRequest: removeCardFunc => {
      // TODO: move declineFriendRequest to FriendsProvider
      return targetUserId => {
        return friendsService
          .declineFriendRequest(targetUserId.id)
          .then(() => removeCardFunc(targetUserId.id))
          .then(() => {
            userInfoService
              .refreshCacheData(LIST_TYPE['friend-requests'], CACHE_CRITERIA)
              .then(() => {
                document.dispatchEvent(new CustomEvent(FRIEND_REQUEST_COUNT_EVENT));
              });
          })
          .catch(error => dispatch(HandleError(error)));
      };
    },
    declineAllFriendRequests: () => {
      // TODO: move declineAllFriendRequests to FriendsProvider
      return friendsService
        .declineAllFriendRequests()
        .then(res => {
          userInfoService
            .refreshCacheData(LIST_TYPE['friend-requests'], CACHE_CRITERIA)
            .then(() => {
              document.dispatchEvent(new CustomEvent(FRIEND_REQUEST_COUNT_EVENT));
            });
          return res.data?.backgrounded;
        })
        .catch(error => dispatch(HandleError(error)));
    },
    unfriend: targetUserId => {
      return friendsService.unfriend(targetUserId).catch(error => dispatch(HandleError(error)));
    },
    getGamePlayabilities: friendsService.getGamePlayabilities
  };
};

export default connect(mapStateToProps, mapDispatchToProps);
