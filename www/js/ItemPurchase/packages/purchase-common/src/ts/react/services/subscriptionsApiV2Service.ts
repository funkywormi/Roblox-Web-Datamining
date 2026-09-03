import { EnvironmentUrls } from '@rbx/environment-urls';
import {
  Configuration,
  SubscriptionsV2Api,
  ProductType,
  ListAvailableSubscriptionProductsResponse
} from '@rbx/client-subscriptions-api/v1';

const { apiGatewayUrl, domain } = EnvironmentUrls;

const configuration = new Configuration({
  robloxSiteDomain: domain,
  basePath: `${apiGatewayUrl}/subscriptions`,
  credentials: 'include'
});

export const subscriptionsV2Api = new SubscriptionsV2Api(configuration);

export { ProductType };

/**
 * List available subscription products of the given type for the current user.
 */
export const listAvailableSubscriptionProductsV2 = (
  productType: ProductType,
  includePurchased: boolean
): Promise<ListAvailableSubscriptionProductsResponse> =>
  subscriptionsV2Api.subscriptionsV2ListAvailableSubscriptionProducts({
    productType,
    includePurchased
  });
