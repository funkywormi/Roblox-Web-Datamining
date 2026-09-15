import { SubscriptionReferralStatus } from "@rbx/client-subscriptions-api/v1";
import { isReferralEnabled } from "@rbx/core-scripts/meta/subscription";
import { isBlackbirdUser, userId } from "@rbx/core-scripts/meta/user";
import { subscriptionsV2Api } from "@rbx/payments/services/subscriptions";
import { useQuery } from "@tanstack/react-query";

import type { SubscriptionReferral } from "@rbx/client-subscriptions-api/v1";

const PENDING_REFERRALS_PAGE_SIZE = 5;

const EMPTY_REFERRALS: SubscriptionReferral[] = [];

/** Only a signed-in non-subscriber can have an invite waiting, and only while the rollout is on. */
const canHavePendingReferrals = (): boolean =>
  isReferralEnabled() && userId() !== null && !isBlackbirdUser();

export type UsePendingPlusReferralsResult = {
  pendingReferrals: SubscriptionReferral[];
  latestPendingReferral: SubscriptionReferral | undefined;
  isLoading: boolean;
};

/**
 * Pending Plus referrals for the signed-in non-subscriber.
 *
 * The nav and the Buy Robux header both ask on the same page load, so they share one cached query.
 */
export const usePendingPlusReferrals = (): UsePendingPlusReferralsResult => {
  const enabled = canHavePendingReferrals();

  // A failed lookup leaves `data` undefined, which reads as "no invite waiting". The prompt is
  // additive, so there is nothing to show and nothing to report.
  const { data, isLoading } = useQuery({
    queryKey: ["plus-referrals", "pending"],
    enabled,
    queryFn: async () => {
      const { referrals } = await subscriptionsV2Api.subscriptionsV2ListSubscriptionReferrals({
        // Proto Pending = 1 (OpenAPI emits NUMBER_1).
        status: SubscriptionReferralStatus.NUMBER_1,
        pageSize: PENDING_REFERRALS_PAGE_SIZE,
      });
      return referrals;
    },
  });

  const pendingReferrals = data ?? EMPTY_REFERRALS;

  return {
    pendingReferrals,
    latestPendingReferral: pendingReferrals.at(0),
    // react-query v4 reports a disabled query as loading, which would stall callers forever.
    isLoading: enabled && isLoading,
  };
};
