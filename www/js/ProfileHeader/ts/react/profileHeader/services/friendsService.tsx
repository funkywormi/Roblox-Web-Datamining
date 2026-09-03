import { httpService, urlService } from 'core-utilities';
import apiConstants from '../constants/apiEndpoint';
import {
  TFollowUserResponse,
  TFollowingExistsResponse,
  TGetCountResponse,
  TGetFriendStatusResponse,
  TSendFriendRequestResponse,
  TGetTrustedConnectionStatusResponse
} from '../types/profileHeaderTypes';

const getProfileFriendsCount = async (profileId: number): Promise<TGetCountResponse> => {
  const { data }: { data: TGetCountResponse } = await httpService.get(
    apiConstants.getProfileFriendsCount(profileId)
  );
  return data;
};

const getProfileFollowersCount = async (profileId: number): Promise<TGetCountResponse> => {
  const { data }: { data: TGetCountResponse } = await httpService.get(
    apiConstants.getProfileFollowersCount(profileId)
  );
  return data;
};

const getProfileFollowingsCount = async (profileId: number): Promise<TGetCountResponse> => {
  const { data }: { data: TGetCountResponse } = await httpService.get(
    apiConstants.getProfileFollowingsCount(profileId)
  );
  return data;
};

const getTrustedConnectionStatus = async (
  userId: number
): Promise<TGetTrustedConnectionStatusResponse> => {
  const { data }: { data: TGetTrustedConnectionStatusResponse } = await httpService.get(
    apiConstants.getTrustedConnectionStatus(userId)
  );
  return data;
};

const getFriendStatus = async (
  userId: number,
  profileId: number
): Promise<TGetFriendStatusResponse> => {
  const { data }: { data: { data: TGetFriendStatusResponse[] } } = await httpService.get(
    apiConstants.getFriendStatus(userId),
    {
      userIds: [profileId]
    }
  );
  return data.data[0];
};

const sendFriendRequest = async (profileId: number): Promise<TSendFriendRequestResponse> => {
  const friendshipOriginSourceType =
    urlService.getQueryParam('friendshipSourceType') || 'UserProfile';

  const { data }: { data: TSendFriendRequestResponse } = await httpService.post(
    apiConstants.sendFriendRequest(profileId),
    {
      friendshipOriginSourceType
    }
  );
  return data;
};

const acceptFriendRequest = async (profileId: number): Promise<{}> => {
  const { data }: { data: {} } = await httpService.post(
    apiConstants.acceptFriendRequest(profileId)
  );
  return data;
};

const removeFriend = async (profileId: number): Promise<{}> => {
  const { data }: { data: {} } = await httpService.post(apiConstants.removeFriend(profileId));
  return data;
};

const followingExists = async (profileId: number): Promise<TFollowingExistsResponse> => {
  const { data }: { data: { followings: TFollowingExistsResponse[] } } = await httpService.post(
    apiConstants.followingExists(),
    {
      targetUserIds: [profileId]
    }
  );
  return data.followings[0];
};

const followUser = async (profileId: number): Promise<TFollowUserResponse> => {
  const { data }: { data: TFollowUserResponse } = await httpService.post(
    apiConstants.followUser(profileId)
  );
  return data;
};

const unFollowUser = async (profileId: number): Promise<{}> => {
  const { data }: { data: {} } = await httpService.post(apiConstants.unFollowUser(profileId));
  return data;
};

export default {
  unFollowUser,
  followUser,
  followingExists,
  removeFriend,
  acceptFriendRequest,
  sendFriendRequest,
  getTrustedConnectionStatus,
  getFriendStatus,
  getProfileFollowingsCount,
  getProfileFollowersCount,
  getProfileFriendsCount
};
