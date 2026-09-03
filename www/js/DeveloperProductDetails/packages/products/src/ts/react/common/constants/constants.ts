import { EnvironmentUrls } from "@rbx/core-scripts/legacy/Roblox";
import { UrlConfig } from "@rbx/core-scripts/http";

const { apiGatewayUrl, websiteUrl } = EnvironmentUrls;

const url = {
  getDeveloperProductDetails: (productId: string): UrlConfig => ({
    url: `${apiGatewayUrl}/developer-products/v1/developer-products/${productId}/details`,
    withCredentials: true
  }),
  getGameTransactions: {
    url: `${apiGatewayUrl}/developer-products/v1/game-transactions`,
    withCredentials: true
  },
  reportAbuseRevamp: (targetId: string, submitterId: string, abuseVector: string): string => {
    const params = new URLSearchParams({
      targetId,
      submitterId,
      abuseVector
    });
    return `/report-abuse/?${params.toString()}`;
  },
  reportAbuse: (targetId: string, redirectUrlEncoded: string): UrlConfig => ({
    url: `https://www.${EnvironmentUrls.domain}/abusereport/developerproduct?id=${targetId}&RedirectUrl=${redirectUrlEncoded}`
  }),
  gameEDP: (rootPlaceId: string): UrlConfig => ({
    url: `https://www.${EnvironmentUrls.domain}/games/${rootPlaceId}`
  }),
  userProfile: (userId: string): string => `${websiteUrl}/users/${userId}/profile`,
  groupProfile: (groupId: string): string => `${websiteUrl}/communities/${groupId}`,
  configureGamePass: (gamePassId: string, universeId: string): string =>
    `https://create.${EnvironmentUrls.domain}/dashboard/creations/experiences/${universeId}/passes/${gamePassId}/configure`,
  reportGamePass: (gamePassId: string, redirectUrl: string): string =>
    `${websiteUrl}/abusereport/gamePass?id=${gamePassId}&redirectUrl=${encodeURIComponent(
      redirectUrl
    )}`
};

export default {
  url
};
