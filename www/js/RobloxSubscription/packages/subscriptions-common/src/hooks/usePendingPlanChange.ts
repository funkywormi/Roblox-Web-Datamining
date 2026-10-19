import { SubscriptionPlanChangeStatus } from "@rbx/client-subscriptions-api/v2";
import { subscriptionsV2Api } from "@rbx/payments/services/subscriptions";
import { useQuery } from "@tanstack/react-query";

import { planChangeQueryKeys } from "./planChangeQueryKeys";

import type { SubscriptionPlanChange } from "@rbx/client-subscriptions-api/v2";

export type UsePendingPlanChangeOptions = {
  /** V2 subscription id. The request waits until it's set. */
  subscriptionId?: string;
  /** Skips the request. */
  enabled?: boolean;
};

/** Narrower than the API row so a just-reserved change can be cached before the provider confirms it. */
export type PendingPlanChange = Pick<
  SubscriptionPlanChange,
  "planChangeId" | "targetSubscriptionProductKey" | "scheduledTimestampMs"
>;

export type UsePendingPlanChangeResult = {
  /** `undefined` when no change is scheduled, or when the lookup fails. */
  pendingPlanChange: PendingPlanChange | undefined;
  isLoading: boolean;
};

/**
 * The plan change scheduled on a subscription. It takes effect at the next renewal, and until then
 * the subscription still reports its current product.
 */
export const usePendingPlanChange = ({
  subscriptionId,
  enabled = true,
}: UsePendingPlanChangeOptions = {}): UsePendingPlanChangeResult => {
  const shouldRequest = enabled && Boolean(subscriptionId);

  const { data, isLoading } = useQuery<PendingPlanChange | null>({
    queryKey: planChangeQueryKeys.pending(subscriptionId ?? ""),
    enabled: shouldRequest,
    queryFn: async () => {
      if (!subscriptionId) {
        return null;
      }

      // Only one change can be pending at a time.
      const { planChanges } = await subscriptionsV2Api.subscriptionsV2ListSubscriptionPlanChanges({
        subscriptionId,
        status: SubscriptionPlanChangeStatus.Pending,
        pageSize: 1,
      });
      return planChanges.at(0) ?? null;
    },
  });

  return {
    pendingPlanChange: data ?? undefined,
    // react-query v4 reports a disabled query as loading, which would stall callers forever.
    isLoading: shouldRequest && isLoading,
  };
};
