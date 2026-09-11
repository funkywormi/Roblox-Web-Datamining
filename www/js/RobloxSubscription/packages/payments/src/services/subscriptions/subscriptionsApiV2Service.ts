import { EnvironmentUrls } from "Roblox";
import {
  Configuration,
  SubscriptionsV2Api,
  ProductType,
  GetSubscriptionProductInfoResponse,
  GetProductPaymentMetadataResponse,
  ListAvailableSubscriptionProductsResponse,
  PreparePurchaseV2Response,
  PaymentProvider,
  ProviderPurchaseOptions,
} from "@rbx/client-subscriptions-api/v1";

const { apiGatewayUrl, domain } = EnvironmentUrls;

const configuration = new Configuration({
  robloxSiteDomain: domain,
  basePath: `${apiGatewayUrl}/subscriptions`,
  credentials: "include",
});

export const subscriptionsV2Api = new SubscriptionsV2Api(configuration);

/**
 * Get product info for a subscription product (V2)
 */
export const getProductInfoV2 = (
  subscriptionProductType: ProductType,
  subscriptionProductId: string,
): Promise<GetSubscriptionProductInfoResponse> =>
  subscriptionsV2Api.subscriptionsV2GetSubscriptionProductInfo({
    subscriptionProductType,
    subscriptionProductId,
  });

/**
 * List available subscription products for a product type, optionally filtered by
 * payment provider.
 */
export const listAvailableSubscriptionProductsV2 = (
  subscriptionProductType: ProductType,
  paymentProvider: PaymentProvider,
  includeBundles = false,
): Promise<ListAvailableSubscriptionProductsResponse> =>
  subscriptionsV2Api.subscriptionsV2ListAvailableSubscriptionProducts({
    productType: subscriptionProductType,
    includeBundles,
    paymentProvider,
  } as Parameters<SubscriptionsV2Api["subscriptionsV2ListAvailableSubscriptionProducts"]>[0]);

/**
 * Get payment metadata for a subscription product
 */
export const getProductPaymentMetadata = (
  subscriptionProductType: ProductType,
  subscriptionProductId: string,
): Promise<GetProductPaymentMetadataResponse> =>
  subscriptionsV2Api.subscriptionsV2GetProductPaymentMetadata({
    subscriptionProductType,
    subscriptionProductId,
  });

/**
 * Prepare a subscription purchase (V2)
 */
export const preparePurchaseV2 = (
  subscriptionProductType: ProductType,
  subscriptionProductId: string,
  paymentProvider: PaymentProvider,
  paymentProviderPurchaseOptions?: ProviderPurchaseOptions,
  paymentSessionId?: string,
): Promise<PreparePurchaseV2Response> =>
  subscriptionsV2Api.subscriptionsV2PreparePurchaseV2({
    subscriptionProductType,
    subscriptionProductId,
    preparePurchaseV2Request: {
      paymentProvider,
      paymentProviderPurchaseOptions,
      paymentSessionId,
    },
  });
