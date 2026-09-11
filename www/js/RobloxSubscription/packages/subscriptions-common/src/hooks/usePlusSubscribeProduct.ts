import { ProductType } from "@rbx/client-subscriptions-api/v1";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { subscriptionsV2Api } from "@rbx/payments/services/subscriptions";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import type { SubscriptionButtonProps } from "../components/shared/SubscriptionButton";
import type {
  Money,
  PeriodType,
  RobloxSubscriptionProductFeatureConfig,
  SubscriptionOffer,
  SubscriptionProductInfo,
} from "@rbx/client-subscriptions-api/v1";

/** What the referral sheets need to hand `SubscriptionButton`; the rest is styling they own. */
export type PlusSubscribeButtonProps = Omit<
  SubscriptionButtonProps,
  "variant" | "size" | "className" | "children"
>;

/** Entitled Robux decides the tier order. API returns micros (1e6 units = 1 Robux). */
const getEntitledRobux = (product: SubscriptionProductInfo): number =>
  Math.floor(
    (product.productTypeDetails.robloxSubscriptionProductDetails?.featureConfig
      .currencySubscriptionConfig?.entitledAmountMicros ?? 0) / 1_000_000,
  );

export type UsePlusSubscribeProductResult = {
  /** `undefined` until the lookup lands, or for good if it fails. */
  subscribeButtonProps: PlusSubscribeButtonProps | undefined;
  /** Localized product price used to build the referral CTA label. */
  subscribePrice: Money | undefined;
  /** Billing period the price is quoted in; the CTA label keys its suffix on this. */
  subscribePeriodType: PeriodType | undefined;
  /** Benefits the product actually grants, so the sheet pitches what the upsell modal pitches. */
  subscribeFeatureConfig: RobloxSubscriptionProductFeatureConfig | undefined;
  /** Offers needed to render the same standard or free-trial terms as the upsell modal. */
  subscribeEligibleOffers: SubscriptionOffer[] | undefined;
  isLoading: boolean;
};

/**
 * Checkout wiring for the referral sheets when they open away from `/plus`.
 *
 * `SubscriptionButton` builds its checkout url from a product. `/plus` has one loaded and passes
 * it down; every other surface has to ask. Takes the base tier, since the sheet pitches Plus
 * itself rather than a particular tier.
 */
export const usePlusSubscribeProduct = ({
  enabled = true,
}: { enabled?: boolean } = {}): UsePlusSubscribeProductResult => {
  // No product means no CTA to offer, which callers treat as nothing to show.
  const { data: product, isLoading } = useQuery({
    queryKey: ["plus-referrals", "subscribe-product"],
    enabled,
    // Every referral surface shares this key, so caching keeps them all on the same product.
    staleTime: Infinity,
    queryFn: async () => {
      const { products } =
        await subscriptionsV2Api.subscriptionsV2ListAvailableSubscriptionProducts({
          productType: ProductType.Blackbird,
          includePurchased: true,
          includeBundles: true,
          skipEligibilityCheck: true,
        });
      return products.toSorted((a, b) => getEntitledRobux(a) - getEntitledRobux(b)).at(0) ?? null;
    },
  });

  const subscribeButtonProps = useMemo(() => {
    const deviceMeta = getDeviceMeta();
    // The button routes desktop and in-app purchases differently, so without device meta there is
    // no safe url to send anyone to.
    if (product == null || deviceMeta === null) {
      return undefined;
    }

    return {
      productId: product.productKey.id,
      productType: product.productKey.type,
      deviceMeta,
    };
  }, [product]);

  // react-query v4 reports a disabled query as loading, which would stall callers forever.
  return {
    subscribeButtonProps,
    subscribePrice: product?.localizedPrice,
    subscribePeriodType: product?.periodType,
    subscribeFeatureConfig:
      product?.productTypeDetails.robloxSubscriptionProductDetails?.featureConfig,
    subscribeEligibleOffers: product?.eligibleOffers,
    isLoading: enabled && isLoading,
  };
};

export default usePlusSubscribeProduct;
