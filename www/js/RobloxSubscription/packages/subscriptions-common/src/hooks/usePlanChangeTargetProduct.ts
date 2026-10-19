import { getProductInfoV2 } from "@rbx/payments/services/subscriptions";
import { useQuery } from "@tanstack/react-query";

import { planChangeQueryKeys } from "./planChangeQueryKeys";

import type {
  SubscriptionProductInfo,
  SubscriptionProductKey,
} from "@rbx/client-subscriptions-api/v2";

export type UsePlanChangeTargetProductOptions = {
  /** Absent until the pending change has loaded. */
  productKey?: SubscriptionProductKey;
  enabled?: boolean;
};

export type UsePlanChangeTargetProductResult = {
  /** `undefined` until the product loads, or when the lookup fails. */
  targetProduct: SubscriptionProductInfo | undefined;
  isLoading: boolean;
};

/** The Plus product a pending plan change would switch the subscriber to. */
export const usePlanChangeTargetProduct = ({
  productKey,
  enabled = true,
}: UsePlanChangeTargetProductOptions = {}): UsePlanChangeTargetProductResult => {
  const shouldRequest = enabled && productKey !== undefined;

  const { data, isLoading } = useQuery({
    queryKey: planChangeQueryKeys.product(productKey?.id ?? ""),
    enabled: shouldRequest,
    queryFn: async () => {
      if (!productKey) {
        return null;
      }
      // An explicit null keeps a `?referrerId=` on the page from repricing an existing subscriber.
      const { subscriptionProductInfo } = await getProductInfoV2(
        productKey.type,
        productKey.id,
        null,
      );
      return subscriptionProductInfo;
    },
  });

  return {
    targetProduct: data ?? undefined,
    // react-query v4 reports a disabled query as loading, which would stall callers forever.
    isLoading: shouldRequest && isLoading,
  };
};
