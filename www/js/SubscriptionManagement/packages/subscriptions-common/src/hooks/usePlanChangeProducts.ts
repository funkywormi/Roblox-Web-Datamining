import { ProductType } from "@rbx/client-subscriptions-api/v2";
import { subscriptionsV2Api } from "@rbx/payments/services/subscriptions";
import { useQuery } from "@tanstack/react-query";

import { planChangeQueryKeys } from "./planChangeQueryKeys";
import { getEntitledRobux } from "../utils/getEntitledRobux";

import type { SubscriptionProductInfo } from "@rbx/client-subscriptions-api/v2";

const EMPTY_PRODUCTS: SubscriptionProductInfo[] = [];

export type UsePlanChangeProductsResult = {
  /** In tier order. Empty when the user can't change plans. */
  planChangeProducts: SubscriptionProductInfo[];
  isLoading: boolean;
};

/**
 * The Plus tiers the signed-in subscriber can change their plan to, excluding the one they hold.
 *
 * The server decides who can change plans, so an empty list means there is nothing to offer.
 */
export const usePlanChangeProducts = ({
  enabled = true,
}: { enabled?: boolean } = {}): UsePlanChangeProductsResult => {
  // A failed lookup leaves `data` undefined, which reads as "can't change plans".
  const { data, isLoading } = useQuery({
    queryKey: planChangeQueryKeys.products(),
    enabled,
    queryFn: async () => {
      const { products } =
        await subscriptionsV2Api.subscriptionsV2ListAvailableSubscriptionProducts({
          productType: ProductType.Blackbird,
          // The server ignores includePlanChanges when includePurchased is set.
          includePurchased: false,
          includeBundles: true,
          includePlanChanges: true,
        });
      return products.toSorted((a, b) => getEntitledRobux(a) - getEntitledRobux(b));
    },
  });

  return {
    planChangeProducts: data ?? EMPTY_PRODUCTS,
    // react-query v4 reports a disabled query as loading, which would stall callers forever.
    isLoading: enabled && isLoading,
  };
};
