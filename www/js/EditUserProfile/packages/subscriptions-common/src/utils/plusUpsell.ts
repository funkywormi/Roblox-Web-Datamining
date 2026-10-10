import { ProductType } from "@rbx/client-subscriptions-api/v2";
import {
  getProductInfoV2,
  resolveReferrerId,
  subscriptionsV2Api,
} from "@rbx/payments/services/subscriptions";

import type {
  SubscriptionOffer,
  SubscriptionProductInfo,
  SubscriptionsV2ListAvailableSubscriptionProductsRequest,
} from "@rbx/client-subscriptions-api/v2";

export const hasFreeTrialOffer = (offers: readonly SubscriptionOffer[] | undefined): boolean =>
  offers?.some(offer => offer.offerType === "FreeTrial") ?? false;

/** Translation key (Feature.RobloxSubscription) for a Plus upsell CTA. */
export const getPlusUpsellCtaKey = (
  offers: readonly SubscriptionOffer[] | undefined,
): "Action.TryItForFree" | "Action.Subscribe" =>
  hasFreeTrialOffer(offers) ? "Action.TryItForFree" : "Action.Subscribe";

/**
 * Plus (Blackbird) product behind the upsell banners and sheets. Resolves `null` when there is
 * nothing to upsell (e.g. the viewer already has Plus).
 *
 * The referrer is forwarded on both calls: the backend suppresses the trial for referred users.
 */
export const fetchPlusUpsellProduct = async (
  referrerId: number | undefined = resolveReferrerId(),
): Promise<SubscriptionProductInfo | null> => {
  const referral: Pick<SubscriptionsV2ListAvailableSubscriptionProductsRequest, "referrerId"> =
    referrerId === undefined ? {} : { referrerId };
  const { productKeys } = await subscriptionsV2Api.subscriptionsV2ListAvailableSubscriptionProducts(
    { productType: ProductType.Blackbird, ...referral },
  );

  const [productKey] = productKeys;
  if (!productKey) {
    return null;
  }

  const { subscriptionProductInfo } = await getProductInfoV2(
    productKey.type,
    productKey.id,
    referrerId ?? null,
  );
  return subscriptionProductInfo;
};
