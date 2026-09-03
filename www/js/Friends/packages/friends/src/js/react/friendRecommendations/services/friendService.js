import { httpService } from 'core-utilities';
import { EnvironmentUrls, CurrentUser } from 'Roblox';
import eventStreamService from './eventStreamService';

const { friendsApi } = EnvironmentUrls;

function getFriendRecommendations(userId) {
  const urlConfig = {
    retryable: true,
    withCredentials: true,
    url: `${friendsApi}/v1/users/${userId}/friends/recommendations`
  };
  return httpService.get(urlConfig).then(response =>
    response.data.data.map(x => ({
      userName: x.name,
      displayName: x.displayName,
      userId: x.id,
      pendingRequest: x.friendRequest != null,
      mutualFriendsList: x.mutualFriendsList
    }))
  );
}

function getFriendCount(userId) {
  const urlConfig = {
    retryable: true,
    withCredentials: true,
    url: `${friendsApi}/v1/users/${userId}/friends/count`
  };
  return httpService.get(urlConfig);
}

function sendFriendRequest(targetUserId) {
  const urlConfig = {
    retryable: false,
    withCredentials: true,
    url: `${friendsApi}/v1/users/${targetUserId}/request-friendship`
  };
  const data = {
    friendshipOriginSourceType: 'recommendations'
  };
  const request = httpService.post(urlConfig, data);
  request.then(
    () => eventStreamService.emitFriendRequestSentEvent(CurrentUser.userId, targetUserId),
    () => {} // error should be handled by caller.
  );
  return request;
}

function acceptFriendRequest(targetUserId) {
  const urlConfig = {
    retryable: false,
    withCredentials: true,
    url: `${friendsApi}/v1/users/${targetUserId}/accept-friend-request`
  };
  const request = httpService.post(urlConfig);
  request.then(
    () => eventStreamService.emitAcceptedFriendRequestEvent(CurrentUser.userId, targetUserId),
    () => {} // error should be handled by caller.
  );
  return request;
}

function sendOrAcceptFriendRequest(targetUserId, pendingRequest) {
  return pendingRequest ? acceptFriendRequest(targetUserId) : sendFriendRequest(targetUserId);
}

export default { getFriendRecommendations, sendOrAcceptFriendRequest, getFriendCount };
