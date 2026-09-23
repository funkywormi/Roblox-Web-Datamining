import * as http from "@rbx/core-scripts/http";
import { isReferralEnabled } from "@rbx/core-scripts/meta/subscription";
import { isBlackbirdUser, userId } from "@rbx/core-scripts/meta/user";
import environmentUrls from "@rbx/environment-urls";
import { useQuery } from "@tanstack/react-query";

type AmpFeatureResponse = { access: "Granted" | "Denied" };

/**
 * Whether the viewer holds Plus, confirmed against AMP rather than the page-load meta tag.
 *
 * `isBlackbirdUser` reads a meta tag the server wrote when the page loaded, so on the screen that
 * follows a purchase it still says no. Surfaces that key off it keep offering the non-subscriber
 * treatment until something forces a full page load.
 *
 * Only a signed-in non-subscriber on the rollout is worth asking about: a subscriber's tag cannot
 * be stale in the direction that matters, and nobody else is shown referral treatment either way.
 */
export const useIsPlusSubscriber = (): boolean => {
  const isSubscriberAtPageLoad = isBlackbirdUser();
  const canHaveSubscribedSince =
    isReferralEnabled() && userId() !== null && !isSubscriberAtPageLoad;

  // A failed lookup leaves `data` undefined, which falls back to what the page said. That is the
  // pre-existing behaviour, so the worst case is the stale answer rather than a wrong one.
  const { data: hasSubscribedSince } = useQuery({
    queryKey: ["plus-referrals", "viewer-subscription"],
    enabled: canHaveSubscribedSince,
    queryFn: async () => {
      const namespace = encodeURIComponent("subscriptions/PlusSubscription");
      const { data } = await http.get<AmpFeatureResponse>({
        url: `${environmentUrls.apiGatewayUrl}/access-management/v1/upsell-feature-access?featureName=IsRobloxPlusSubscribed&namespace=${namespace}`,
        withCredentials: true,
      });
      return data.access === "Granted";
    },
  });

  return isSubscriberAtPageLoad || hasSubscribedSince === true;
};

export default useIsPlusSubscriber;
