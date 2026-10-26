import { subscriptionsV2Api } from "@rbx/payments/services/subscriptions";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { planChangeQueryKeys } from "./planChangeQueryKeys";

import type { SubscriptionProductInfo } from "@rbx/client-subscriptions-api/v2";
import type { UseMutationResult } from "@tanstack/react-query";

export type CancelPlanChangeVariables = {
  subscriptionId: string;
  planChangeId: number;
};

/** Cancels a pending plan change so the subscription renews on its current plan. */
export const useCancelPlanChange = (): UseMutationResult<
  void,
  unknown,
  CancelPlanChangeVariables
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subscriptionId, planChangeId }: CancelPlanChangeVariables) =>
      subscriptionsV2Api.subscriptionsV2CancelSubscriptionPlanChange({
        subscriptionId,
        cancelSubscriptionPlanChangeRequest: { planChangeId },
      }),
    // Cancel only asks the provider to drop the schedule. The row stays Pending until that
    // provider's webhook lands, so refetching the pending change here would still return it
    // and the banner would come back. Clear that cache entry instead. It holds until reload
    // because this query client does not refetch on mount or focus, and by then the webhook
    // should have removed the row. Clearing it is also what brings the package list back:
    // that list is hidden while a pending change is cached, and it loads again once this
    // entry is gone. A list loaded before the change is still in the cache, and showing
    // it is what makes the packages reappear. Refetching that list would replace it
    // with the empty response the server gives until the webhook lands. A page that
    // opened with the banner never loaded a list, so that case has to ask again.
    onSuccess: async (_, { subscriptionId }) => {
      await queryClient.cancelQueries({
        queryKey: planChangeQueryKeys.pending(subscriptionId),
      });
      queryClient.setQueryData(planChangeQueryKeys.pending(subscriptionId), null);

      const products = queryClient.getQueryData<SubscriptionProductInfo[]>(
        planChangeQueryKeys.products(),
      );
      if (products && products.length > 0) {
        return;
      }
      const productsState = queryClient.getQueryState(planChangeQueryKeys.products());
      // Nothing subscribes to this flag. An unused entry only lives for the client's
      // cache time, and a cache time of 0 drops it on the next tick — before the
      // products query can schedule its retry. Hold it until that query clears it.
      queryClient.setQueryDefaults(planChangeQueryKeys.productsRefresh(), {
        cacheTime: Infinity,
      });
      queryClient.setQueryData(planChangeQueryKeys.productsRefresh(), {
        startingUpdateCount:
          (productsState?.dataUpdateCount ?? 0) + (productsState?.errorUpdateCount ?? 0),
      });
      return queryClient.invalidateQueries({ queryKey: planChangeQueryKeys.products() });
    },
  });
};
