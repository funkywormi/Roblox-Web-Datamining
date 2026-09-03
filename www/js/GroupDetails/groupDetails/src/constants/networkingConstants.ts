export type Window = {
  Roblox?: {
    EnvironmentUrls?: {
      apiGatewayUrl?: string;
      friendsApi?: string;
    };
  };
};

const apiGatewayUrl = (window as Window)?.Roblox?.EnvironmentUrls?.apiGatewayUrl ?? 'https://apis.roblox.com';
const friendsApi = (window as Window)?.Roblox?.EnvironmentUrls?.friendsApi ?? 'https://friends.roblox.com';

export const fetchProfilePlatformApiUrl = `${apiGatewayUrl}/profile-platform-api/v1/profiles/get`;
export const fetchBatchProfilePlatformApiUrl = `${apiGatewayUrl}/profile-platform-api/v1/profiles/batch/get`;

// Friends API URLs
export const sendFriendRequestUrl = (userId: number) => `${friendsApi}/v1/users/${userId}/request-friendship`;
export const acceptFriendRequestUrl = (userId: number) => `${friendsApi}/v1/users/${userId}/accept-friend-request`;
export const declineFriendRequestUrl = (userId: number) => `${friendsApi}/v1/users/${userId}/decline-friend-request`;
export const unfriendUrl = (userId: number) => `${friendsApi}/v1/users/${userId}/unfriend`;
