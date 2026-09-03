import environmentUrls from "@rbx/environment-urls";
import { UrlConfig } from "@rbx/core-scripts/http";

const { apiGatewayUrl } = environmentUrls;

const url = {
  // TODO: migrate these to use strongly typed clients (rbx/clients-experience-store, rbx/clients-game-transactions)
  getDeveloperProductsForStorePage: (universeId: string): UrlConfig => ({
    url: `${apiGatewayUrl}/experience-store/v1/universes/${universeId}/store`,
    withCredentials: true,
  }),
  listGameTransactions: {
    url: `${apiGatewayUrl}/game-transactions/v1/receipts`,
    withCredentials: true,
  },
  developerProductDetailsPage: (universeId: string, productId: string): UrlConfig => ({
    url: `https://${environmentUrls.domain}/developer-product/${universeId}/product/${productId}`,
  }),
};

export default {
  url,
};
