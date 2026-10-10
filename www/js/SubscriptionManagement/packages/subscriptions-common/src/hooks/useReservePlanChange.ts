import { subscriptionsV2Api } from "@rbx/payments/services/subscriptions";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { planChangeQueryKeys } from "./planChangeQueryKeys";

import type { UseMutationResult } from "@tanstack/react-query";

export type ReservePlanChangeVariables = {
  subscriptionId: string;
  planChangeId: number;
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
    // The subscription now has a pending change and nothing left to change to.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: planChangeQueryKeys.all() }),
  });
};
