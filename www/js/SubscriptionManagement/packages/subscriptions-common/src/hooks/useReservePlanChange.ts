import { subscriptionsV2Api } from "@rbx/payments/services/subscriptions";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { planChangeQueryKeys } from "./planChangeQueryKeys";

import type { PendingPlanChange } from "./usePendingPlanChange";
import type {
  SubscriptionProductInfo,
  SubscriptionProductKey,
} from "@rbx/client-subscriptions-api/v2";
import type { UseMutationResult } from "@tanstack/react-query";

export type ReservePlanChangeVariables = {
  subscriptionId: string;
  planChangeId: number;
  targetSubscriptionProductKey: SubscriptionProductKey;
  /** The package the subscriber picked, so the banner can render without another lookup. */
  targetProduct: SubscriptionProductInfo;
};

/**
 * Commits a plan change from `usePreparePlanChange`. It takes effect at the subscription's next
 * renewal.
 */
export const useReservePlanChange = (): UseMutationResult<
  void,
  unknown,
  ReservePlanChangeVariables
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subscriptionId, planChangeId }: ReservePlanChangeVariables) =>
      subscriptionsV2Api.subscriptionsV2ReserveSubscriptionPlanChange({
        subscriptionId,
        reserveSubscriptionPlanChangeRequest: { planChangeId },
      }),
    // Reserve only asks the payment provider to schedule the change. subscriptions-api leaves
    // the row Initialized, and subscriptions-service does not mark it Pending until that
    // provider's webhook arrives. Refetching the pending-change query here races the webhook
    // and usually comes back empty. That empty result then sticks: the shared query client
    // does not refetch on mount or window focus, so the banner would stay hidden until a
    // full reload.
    //
    // Seed the cache with the plan-change id and target product this call already has.
    // scheduledTimestampMs stays unset because only the webhook knows it; the banner falls
    // back to the subscription's renewal date. A later reload replaces this entry with the
    // server row. The package list stays cached and is only hidden while this entry is
    // set, so cancelling can show it again without asking the server. An in-flight
    // pending lookup would otherwise finish after this and wipe the seeded change.
    onSuccess: async (
      _,
      { subscriptionId, planChangeId, targetSubscriptionProductKey, targetProduct },
    ) => {
      await queryClient.cancelQueries({
        queryKey: planChangeQueryKeys.pending(subscriptionId),
      });
      queryClient.setQueryData<PendingPlanChange>(planChangeQueryKeys.pending(subscriptionId), {
        planChangeId,
        targetSubscriptionProductKey,
        scheduledTimestampMs: null,
      });
      queryClient.setQueryData(
        planChangeQueryKeys.product(targetSubscriptionProductKey.id),
        targetProduct,
      );
    },
  });
};
