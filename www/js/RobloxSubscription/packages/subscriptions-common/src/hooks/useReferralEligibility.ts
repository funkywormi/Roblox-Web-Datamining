import { SubscriptionReferralEligibility } from "@rbx/client-subscriptions-api/v1";
import { subscriptionsV2Api } from "@rbx/payments/services/subscriptions";
import { useQuery } from "@tanstack/react-query";

/** `Invalid` means the pair can never refer each other; `Ineligible` may pass later. */
export type ReferralEligibility = "Eligible" | "Ineligible" | "Invalid";

/**
 * The api answers with the enum name, though the generated types call it an integer. Accepting
 * both stops a serialization change from turning every verdict into `undefined`, which the
 * recipient gate rejects as a dead link.
 */
const ELIGIBILITY_BY_WIRE_VALUE = new Map<string | number, ReferralEligibility>([
  ["Invalid", "Invalid"],
  ["Eligible", "Eligible"],
  ["Ineligible", "Ineligible"],
  [SubscriptionReferralEligibility.NUMBER_0, "Invalid"],
  [SubscriptionReferralEligibility.NUMBER_1, "Eligible"],
  [SubscriptionReferralEligibility.NUMBER_2, "Ineligible"],
]);

export type UseReferralEligibilityOptions = {
  /** Referrer's user id from v2 resolve `targetId`. */
  referrerId?: string;
  /** Skips the request for landings that already know the answer. */
  enabled?: boolean;
};

export type UseReferralEligibilityResult = {
  /**
   * `undefined` means unanswered: no referrer, a failed request, or an off-contract answer.
   * Callers must require an explicit `Eligible` rather than reading it as permission.
   */
  eligibility: ReferralEligibility | undefined;
  /** Callers must wait on this, or they show the wrong sheet first. */
  isLoading: boolean;
};

/**
 * Second-stage check for a referral landing.
 *
 * Resolving the share link only proves it parses. Whether this visitor can accept the referral is
 * a separate question, and only this endpoint answers it.
 */
export const useReferralEligibility = ({
  referrerId,
  enabled = true,
}: UseReferralEligibilityOptions = {}): UseReferralEligibilityResult => {
  // Anything but a positive integer would spend a guaranteed 400, so it reads as "no referrer".
  const referrer = Number.parseInt(referrerId ?? "", 10);
  const hasReferrer = Number.isFinite(referrer) && referrer > 0;
  const shouldRequest = enabled && hasReferrer;

  // A failed request leaves `data` undefined, which callers reject rather than trust.
  const { data: eligibility, isLoading } = useQuery({
    queryKey: ["plus-referrals", "eligibility", referrer],
    enabled: shouldRequest,
    queryFn: async () => {
      if (!hasReferrer) {
        return undefined;
      }

      const { eligibility: wireValue } =
        await subscriptionsV2Api.subscriptionsV2CheckSubscriptionReferralEligibility({
          referrerId: referrer,
        });
      return ELIGIBILITY_BY_WIRE_VALUE.get(wireValue);
    },
  });

  // react-query v4 reports a disabled query as loading, which would stall callers forever.
  return { eligibility, isLoading: shouldRequest && isLoading };
};
