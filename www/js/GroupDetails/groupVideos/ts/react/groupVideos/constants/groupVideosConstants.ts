import { EnvironmentUrls } from 'Roblox';

export default {
  urls: {
    getAssetUrl(assetId: string): string {
      return `${EnvironmentUrls.apiGatewayUrl}/assets/user-auth/v1/assets/${assetId}`;
    }
  }
};
