import {
  sendFriendRequestUrl,
  acceptFriendRequestUrl,
  declineFriendRequestUrl,
  unfriendUrl
} from '../constants/networkingConstants';

export interface SendFriendRequestResponse {
  success: boolean;
  isCaptchaRequired: boolean;
}

const sendFriendRequest = async (userId: number): Promise<SendFriendRequestResponse> => {
  const { httpService, urlService } = (window as any).CoreUtilities;
  const friendshipOriginSourceType = urlService?.getQueryParam('friendshipSourceType') || 'UserCommunities';

  const urlConfig = {
    url: sendFriendRequestUrl(userId),
    withCredentials: true
  };

  const response = await httpService.post(urlConfig, { friendshipOriginSourceType });
  return response.data;
};

const acceptFriendRequest = async (userId: number): Promise<void> => {
  const { httpService } = (window as any).CoreUtilities;
  const urlConfig = {
    url: acceptFriendRequestUrl(userId),
    withCredentials: true
  };

  await httpService.post(urlConfig);
};

const declineFriendRequest = async (userId: number): Promise<void> => {
  const { httpService } = (window as any).CoreUtilities;
  const urlConfig = {
    url: declineFriendRequestUrl(userId),
    withCredentials: true
  };

  await httpService.post(urlConfig);
};

const unfriend = async (userId: number): Promise<void> => {
  const { httpService } = (window as any).CoreUtilities;
  const urlConfig = {
    url: unfriendUrl(userId),
    withCredentials: true
  };

  await httpService.post(urlConfig);
};

export { sendFriendRequest, acceptFriendRequest, declineFriendRequest, unfriend };
