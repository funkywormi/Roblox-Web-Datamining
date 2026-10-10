import { subscriptionsV2Api } from "@rbx/payments/services/subscriptions";
import { useMutation } from "@tanstack/react-query";

import type { SubscriptionProductKey } from "@rbx/client-subscriptions-api/v2";
import type { UseMutationResult } from "@tanstack/react-query";

export type PreparePlanChangeVariables = {
  subscriptionId: string;
  targetSubscriptionProductKey: SubscriptionProductKey;
};

/**
 * Checks that the subscription can change to another Plus tier and records the change for
 * `useReservePlanChange` to commit. Resolves with the plan change id.
 */
export const usePreparePlanChange = (): UseMutationResult<
  number,
  unknown,
  PreparePlanChangeVariables
> =>
  useMutation({
    mutationFn: async ({
      subscriptionId,
      targetSubscriptionProductKey,
    }: PreparePlanChangeVariables) => {
      const { planChangeId } =
        await subscriptionsV2Api.subscriptionsV2PrepareSubscriptionPlanChange({
          subscriptionId,
          prepareSubscriptionPlanChangeRequest: { targetSubscriptionProductKey },
        });
      return planChangeId;
    },
  });
