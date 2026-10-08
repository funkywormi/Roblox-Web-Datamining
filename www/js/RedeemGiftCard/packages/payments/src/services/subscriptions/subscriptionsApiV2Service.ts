import { EnvironmentUrls } from "@rbx/environment-urls";
import {
  Configuration,
  SubscriptionsV2Api,
  ProductType,
  GetSubscriptionProductInfoResponse,
  GetProductPaymentMetadataResponse,
  ListAvailableSubscriptionProductsResponse,
  PreparePurchaseV2Request,
  PreparePurchaseV2Response,
  PaymentProvider,
  ProviderPurchaseOptions,
  SubscriptionsV2GetSubscriptionProductInfoRequest,
  SubscriptionsV2ListAvailableSubscriptionProductsRequest,
} from "@rbx/client-subscriptions-api/v2";

const { apiGatewayUrl, domain } = EnvironmentUrls;

const configuration = new Configuration({
  robloxSiteDomain: domain,
  basePath: `${apiGatewayUrl}/subscriptions`,
  credentials: "include",
});

export const subscriptionsV2Api = new SubscriptionsV2Api(configuration);

const resolveReferrerIdFromUrl = (): number | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  const raw = new URLSearchParams(window.location.search).get("referrerId");
  if (!raw) {
    return undefined;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

/**
 * Resolves the referrer for an outbound call. An explicit argument always wins, including an
 * explicit `null` meaning "no referrer"; only an omitted argument falls back to `?referrerId=`.
 *
 * Exported so every referral surface shares one resolution path: subscriptions-service decides
 * free-trial eligibility from this value on the read and the purchase call alike, so a surface
 * that resolved it differently would advertise a trial PreparePurchase then suppresses.
 *
 * A valid Plus share link lands on `/plus?ctx=plus_referral&referralCode=…&referrerId=…`, so the
 * referrer is on the URL for referral entry points that never pass it explicitly.
 */
export const resolveReferrerId = (referrerId?: number | null): number | undefined => {
  const resolved = referrerId !== undefined ? referrerId : resolveReferrerIdFromUrl();
  return resolved ?? undefined;
};

/**
 * Get product info for a subscription product (V2). Reads `?referrerId=` when the arg is omitted.
 *
 * The referrer is forwarded because the response drives whether a free-trial offer is rendered:
 * referral reward and free trial are mutually exclusive, and the backend suppresses the offer for
 * a referred user. Omitting it shows a trial the purchase call then refuses.
 */
export const getProductInfoV2 = (
  subscriptionProductType: ProductType,
  subscriptionProductId: string,
  referrerId?: number | null,
): Promise<GetSubscriptionProductInfoResponse> => {
  const resolved = resolveReferrerId(referrerId);
  // Typed rather than spread inline: the generated request copies fields one by one, so a client
  // version without `referrerId` would drop it at serialization with no error. `Pick` turns that
  // into a compile failure. A call with no referrer stays absent, as before.
  const referral: Pick<SubscriptionsV2GetSubscriptionProductInfoRequest, "referrerId"> =
    resolved === undefined ? {} : { referrerId: resolved };

  return subscriptionsV2Api.subscriptionsV2GetSubscriptionProductInfo({
    subscriptionProductType,
    subscriptionProductId,
    ...referral,
  });
};

/**
 * List available subscription products for a product type, optionally filtered by
 * payment provider. Reads `?referrerId=` when the arg is omitted.
 */
export const listAvailableSubscriptionProductsV2 = (
  subscriptionProductType: ProductType,
  paymentProvider: PaymentProvider,
  includeBundles = false,
  referrerId?: number | null,
): Promise<ListAvailableSubscriptionProductsResponse> => {
  const resolved = resolveReferrerId(referrerId);
  const referral: Pick<SubscriptionsV2ListAvailableSubscriptionProductsRequest, "referrerId"> =
    resolved === undefined ? {} : { referrerId: resolved };

  return subscriptionsV2Api.subscriptionsV2ListAvailableSubscriptionProducts({
    productType: subscriptionProductType,
    includeBundles,
    paymentProvider,
    ...referral,
  });
};

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

/** Prepare purchase (V2). Reads `?referrerId=` when the arg is omitted. */
export const preparePurchaseV2 = (
  subscriptionProductType: ProductType,
  subscriptionProductId: string,
  paymentProvider: PaymentProvider,
  paymentProviderPurchaseOptions?: ProviderPurchaseOptions,
  paymentSessionId?: string,
  referrerId?: number | null,
): Promise<PreparePurchaseV2Response> => {
  const resolved = resolveReferrerId(referrerId);
  const referral: Pick<PreparePurchaseV2Request, "referrerId"> =
    resolved === undefined ? {} : { referrerId: resolved };

  return subscriptionsV2Api.subscriptionsV2PreparePurchaseV2({
    subscriptionProductType,
    subscriptionProductId,
    preparePurchaseV2Request: {
      paymentProvider,
      paymentProviderPurchaseOptions,
      paymentSessionId,
      ...referral,
    },
  });
};
