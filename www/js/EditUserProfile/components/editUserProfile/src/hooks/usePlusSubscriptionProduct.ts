import { useQuery } from "@tanstack/react-query";
import environmentUrls from "@rbx/environment-urls";
import {
  Configuration,
  ProductType,
  SubscriptionsV2Api,
  type SubscriptionProductInfo,
} from "@rbx/client-subscriptions-api/v1";

const configuration = new Configuration({
  robloxSiteDomain: environmentUrls.domain,
  basePath: `${environmentUrls.apiGatewayUrl}/subscriptions`,
  credentials: "include",
});

const subscriptionsV2Api = new SubscriptionsV2Api(configuration);

/**
 * Roblox Plus (Blackbird) product powering the frame upsell modal — the price on the
 * CTA and the productId the subscribe button checks out with. Returns `null` when there
 * is nothing to upsell (e.g. the user already has Plus), which callers treat as "no modal".
 *
 * account-settings fetches the same product via an RTK-Query endpoint; editUserProfile has
 * no RTK store (it's react-query only), so we reimplement the two thin V2 calls here.
 */
async function fetchPlusSubscriptionProduct(): Promise<SubscriptionProductInfo | null> {
  const { productKeys } = await subscriptionsV2Api.subscriptionsV2ListAvailableSubscriptionProducts(
    { productType: ProductType.Blackbird },
  );

  const productKey = productKeys[0];
  if (!productKey) {
    return null;
  }

  const { subscriptionProductInfo } =
    await subscriptionsV2Api.subscriptionsV2GetSubscriptionProductInfo({
      subscriptionProductType: productKey.type,
      subscriptionProductId: productKey.id,
    });

  return subscriptionProductInfo;
}

export function usePlusSubscriptionProduct({ isEnabled }: { isEnabled: boolean }) {
  return useQuery({
    queryKey: ["plusSubscriptionProduct"],
    queryFn: fetchPlusSubscriptionProduct,
    enabled: isEnabled,
    staleTime: Infinity,
  });
}
