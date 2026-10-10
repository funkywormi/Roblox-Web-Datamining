import { resolveReferrerId } from "@rbx/payments/services/subscriptions";
import { useQuery } from "@tanstack/react-query";

import { fetchPlusUpsellProduct, hasFreeTrialOffer } from "../utils/plusUpsell";

import type { SubscriptionProductInfo } from "@rbx/client-subscriptions-api/v2";

export type UsePlusUpsellProductResult = {
  /** `null` when there is nothing to upsell; `undefined` until loaded or on error. */
  product: SubscriptionProductInfo | null | undefined;
  isFreeTrial: boolean;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
};

/**
 * Plus product for an upsell banner and the sheet it opens. Shared key, so a banner that
 * prefetches warms the cache for its sheet.
 */
export const usePlusUpsellProduct = ({
  enabled = true,
}: { enabled?: boolean } = {}): UsePlusUpsellProductResult => {
  // In the key so a referral landing never reuses a product that still carries the trial.
  const referrerId = resolveReferrerId();

  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ["plus-upsell", "product", referrerId ?? null],
    queryFn: () => fetchPlusUpsellProduct(referrerId),
    enabled,
    staleTime: Infinity,
    retry: 1,
  });

  return {
    product: data,
    isFreeTrial: hasFreeTrialOffer(data?.eligibleOffers),
    // react-query v4 reports a disabled query as loading.
    isLoading: enabled && isLoading,
    isError,
    isSuccess,
  };
};

export default usePlusUpsellProduct;
