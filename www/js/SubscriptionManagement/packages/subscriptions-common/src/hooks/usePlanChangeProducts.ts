import { ProductType } from "@rbx/client-subscriptions-api/v2";
import { subscriptionsV2Api } from "@rbx/payments/services/subscriptions";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { planChangeQueryKeys } from "./planChangeQueryKeys";
import { getEntitledRobux } from "../utils/getEntitledRobux";

import type { SubscriptionProductInfo } from "@rbx/client-subscriptions-api/v2";

const EMPTY_PRODUCTS: SubscriptionProductInfo[] = [];
const PRODUCT_REFRESH_BASE_DELAY_MS = 1_000;
const MAX_PRODUCT_REFRESH_ATTEMPTS = 6;

type ProductsRefresh = {
  startingUpdateCount: number;
};

const updateCount = (query: {
  state: { dataUpdateCount: number; errorUpdateCount: number };
}): number => query.state.dataUpdateCount + query.state.errorUpdateCount;

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
  const queryClient = useQueryClient();
  // A failed lookup leaves `data` undefined, which reads as "can't change plans".
  const { data, isLoading } = useQuery({
    queryKey: planChangeQueryKeys.products(),
    enabled,
    // useCancelPlanChange sets this only when the page has no list to restore. The
    // server keeps returning nothing until the provider webhook marks the change
    // cancelled, so keep asking until packages come back, then stop.
    refetchIntervalInBackground: true,
    refetchInterval: (products, query) => {
      const refresh = queryClient.getQueryData<ProductsRefresh>(
        planChangeQueryKeys.productsRefresh(),
      );
      if (!refresh) {
        return false;
      }
      const attempts = updateCount(query) - refresh.startingUpdateCount;
      if ((products?.length ?? 0) > 0 || attempts >= MAX_PRODUCT_REFRESH_ATTEMPTS) {
        queryClient.setQueryData(planChangeQueryKeys.productsRefresh(), null);
        return false;
      }
      return PRODUCT_REFRESH_BASE_DELAY_MS * 2 ** Math.max(attempts - 1, 0);
    },
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
