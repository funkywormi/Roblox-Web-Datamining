import { subscriptionsV2Api } from "@rbx/payments/services/subscriptions";
import { useQuery } from "@tanstack/react-query";

export type UseCreateSubscriptionReferralOptions = {
  /** Referrer's user id from v2 resolve `targetId`. */
  referrerId?: string;
  /** Skips the request for surfaces that did not arrive through a referral link. */
  enabled?: boolean;
};

export type UseCreateSubscriptionReferralResult = {
  /** `undefined` when nothing was recorded: no referrer, a skipped request, or a failed one. */
  referralId: number | undefined;
  isLoading: boolean;
};

/**
 * Records the referral a recipient arrived on, so a later purchase has a row to attribute to.
 *
 * A query rather than an effect: the service treats this as get-or-create, and react-query dedupes
 * on the key where an effect would post again on every remount.
 */
export const useCreateSubscriptionReferral = ({
  referrerId,
  enabled = true,
}: UseCreateSubscriptionReferralOptions = {}): UseCreateSubscriptionReferralResult => {
  // Anything but a positive integer would spend a guaranteed 400, so it reads as "no referrer".
  const referrer = Number.parseInt(referrerId ?? "", 10);
  const hasReferrer = Number.isFinite(referrer) && referrer > 0;
  const shouldRequest = enabled && hasReferrer;

  const { data: referralId, isLoading } = useQuery({
    queryKey: ["plus-referrals", "create", referrer],
    enabled: shouldRequest,
    // The row never changes once created, so a refetch would only repost.
    staleTime: Infinity,
    queryFn: async () => {
      if (!hasReferrer) {
        return undefined;
      }

      const { referralId: createdReferralId } =
        await subscriptionsV2Api.subscriptionsV2CreateSubscriptionReferral({
          referrerId: referrer,
        });
      return createdReferralId;
    },
  });

  // react-query v4 reports a disabled query as loading, which would stall callers forever.
  return { referralId, isLoading: shouldRequest && isLoading };
};
