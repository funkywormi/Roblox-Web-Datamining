import type {
  RobloxSubscriptionProductFeatureConfig,
  SubscriptionOffer,
  SubscriptionProductInfo,
} from "@rbx/client-subscriptions-api/v1";

export function getFeatureConfig(
  product: SubscriptionProductInfo,
): RobloxSubscriptionProductFeatureConfig {
  const details = product.productTypeDetails.robloxSubscriptionProductDetails;

  if (!details?.featureConfig) {
    throw new Error("featureConfig is missing on robloxSubscriptionProductDetails");
  }

  return details.featureConfig;
}

export function getEntitledRobux(product: SubscriptionProductInfo): number {
  const details = product.productTypeDetails.robloxSubscriptionProductDetails;
  const currencyConfig = details?.featureConfig.currencySubscriptionConfig;
  const micros = currencyConfig?.entitledAmountMicros ?? 0;
  // API returns micros (1e6 units = 1 Robux). Floor defensively in case of rounding.
  return Math.floor(micros / 1_000_000);
}

export function sortProductsByAllowanceAscending(
  products: SubscriptionProductInfo[],
): SubscriptionProductInfo[] {
  return products.toSorted((a, b) => getEntitledRobux(a) - getEntitledRobux(b));
}

export function findFreeTrialOffer(
  product: SubscriptionProductInfo,
): SubscriptionOffer | undefined {
  return product.eligibleOffers.find(o => o.offerType === "FreeTrial");
}

export function isFreeTrialEligible(product?: SubscriptionProductInfo): boolean {
  if (!product) {
    return false;
  }
  return findFreeTrialOffer(product) !== undefined;
}
