import { EnvironmentUrls } from 'Roblox';

const { accountSettingsApi, apiGatewayUrl } = EnvironmentUrls;

export default {
  blockUser(profileId) {
    return {
      url: `${accountSettingsApi}/v1/users/${profileId}/block`,
      withCredentials: true
    };
  },

  unblockUser(profileId) {
    return {
      url: `${accountSettingsApi}/v1/users/${profileId}/unblock`,
      withCredentials: true
    };
  },

  blockUserV2(profileId) {
    return {
      url: `${apiGatewayUrl}/user-blocking-api/v1/users/${profileId}/block-user`,
      withCredentials: true
    };
  },

  unblockUserV2(profileId) {
    return {
      url: `${apiGatewayUrl}/user-blocking-api/v1/users/${profileId}/unblock-user`,
      withCredentials: true
    };
  },

  getBlockedUsers() {
    return {
      url: `${accountSettingsApi}/v1/users/get-detailed-blocked-users`,
      withCredentials: true
    };
  },

  isBlockedUser(profileId) {
    return {
      url: `${apiGatewayUrl}/user-blocking-api/v1/users/${profileId}/is-blocked`,
      withCredentials: true
    };
  },

  batchCheckReciprocalBlock() {
    return {
      url: `${apiGatewayUrl}/user-blocking-api/v1/users/batch-check-reciprocal-block`,
      withCredentials: true
    };
  }
};
