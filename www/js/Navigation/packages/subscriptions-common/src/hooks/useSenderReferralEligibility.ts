import { SubscriptionReferralEligibility } from "@rbx/client-subscriptions-api/v2";
import { isReferralEnabled } from "@rbx/core-scripts/meta/subscription";
import { subscriptionsV2Api } from "@rbx/payments/services/subscriptions";
import { useQuery } from "@tanstack/react-query";

import type { ReferralEligibility } from "./useReferralEligibility";

const ELIGIBILITY_BY_WIRE_VALUE = new Map<string | number, ReferralEligibility>([
  ["Invalid", "Invalid"],
  ["Eligible", "Eligible"],
  ["Ineligible", "Ineligible"],
  [SubscriptionReferralEligibility.NUMBER_0, "Invalid"],
  [SubscriptionReferralEligibility.NUMBER_1, "Eligible"],
  [SubscriptionReferralEligibility.NUMBER_2, "Ineligible"],
]);

export type UseSenderReferralEligibilityResult = {
  eligibility: ReferralEligibility | undefined;
  isLoading: boolean;
};

/**
 * Checks whether the signed-in user is eligible to *send* referrals. Unlike
 * `useReferralEligibility` (which checks a recipient against a referrer), this calls the same
 * endpoint without a `referrerId` so the server evaluates the authenticated user as the sender.
 */
export const useSenderReferralEligibility = ({
  enabled = true,
}: { enabled?: boolean } = {}): UseSenderReferralEligibilityResult => {
  const shouldRequest = enabled && isReferralEnabled();

  const { data: eligibility, isLoading } = useQuery({
    queryKey: ["plus-referrals", "sender-eligibility"],
    enabled: shouldRequest,
    queryFn: async () => {
      const { eligibility: wireValue } =
        await subscriptionsV2Api.subscriptionsV2CheckSubscriptionReferralEligibility({});
      return ELIGIBILITY_BY_WIRE_VALUE.get(wireValue);
    },
  });

  return { eligibility, isLoading: shouldRequest && isLoading };
};
