import { getPrice } from "@rbx/payments/services/subscriptions";
import { getBillingPeriodMonths } from "@rbx/subscriptions-common";

import type {
  RobloxSubscriptionProductFeatureConfig,
  SubscriptionOffer,
  SubscriptionProductInfo,
} from "@rbx/client-subscriptions-api/v2";
import type { BillingPeriodOption } from "@rbx/subscriptions-common";

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

export function getProductMonths(product: SubscriptionProductInfo): number | undefined {
  return getBillingPeriodMonths(product.periodType, product.periodCount);
}

export function sortProductsByAllowanceAscending(
  products: SubscriptionProductInfo[],
): SubscriptionProductInfo[] {
  return products.toSorted(
    (a, b) =>
      getEntitledRobux(a) - getEntitledRobux(b) ||
      (getProductMonths(a) ?? Number.MAX_SAFE_INTEGER) -
        (getProductMonths(b) ?? Number.MAX_SAFE_INTEGER),
  );
}

export type PlusProductGroups = {
  plusTerms: SubscriptionProductInfo[];
  bundles: SubscriptionProductInfo[];
  unsupported: SubscriptionProductInfo[];
};

export function groupPlusProducts(products: SubscriptionProductInfo[]): PlusProductGroups {
  const plusTerms = products.filter(
    product => getEntitledRobux(product) === 0 && getProductMonths(product) !== undefined,
  );
  const bundles = products.filter(
    product => getEntitledRobux(product) > 0 && getProductMonths(product) === 1,
  );
  const unsupported = products.filter(
    product => !plusTerms.includes(product) && !bundles.includes(product),
  );
  return { plusTerms, bundles, unsupported };
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

export function toBillingPeriodOption(product: SubscriptionProductInfo): BillingPeriodOption {
  const { localizedPrice, localizedStrikethroughPrice } = product;
  const trialEndDate = findFreeTrialOffer(product)?.freeTrialOffer?.estimatedTrialEndDate;
  return {
    productId: product.productKey.id,
    productType: product.productKey.type,
    months: getProductMonths(product) ?? 1,
    price: { amount: getPrice(localizedPrice), currencyCode: localizedPrice.currencyCode },
    strikethroughPrice: localizedStrikethroughPrice
      ? {
          amount: getPrice(localizedStrikethroughPrice),
          currencyCode: localizedStrikethroughPrice.currencyCode,
        }
      : undefined,
    freeTrialEndDate: trialEndDate ? new Date(trialEndDate) : undefined,
  };
}
