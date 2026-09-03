import { EnvironmentUrls } from 'Roblox';

const { apiGatewayUrl } = EnvironmentUrls;

export default {
  urls: {
    blockUser(profileId: number): string {
      return `${apiGatewayUrl}/user-blocking-api/v1/users/${profileId}/block-user`;
    }
  }
};
