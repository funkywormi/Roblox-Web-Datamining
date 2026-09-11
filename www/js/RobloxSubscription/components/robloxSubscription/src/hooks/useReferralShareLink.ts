import { userId } from "@rbx/core-scripts/meta/user";
import { useQuery } from "@tanstack/react-query";

import { subscriptionsV2Api } from "../clients/subscriptions";

type UseReferralShareLinkOptions = {
  enabled: boolean;
};

type UseReferralShareLinkResult = {
  shareUrl: string | undefined;
  isLoading: boolean;
  error: Error | undefined;
};

/** Mints/fetches the signed-in user's referral link when `enabled`. */
export const useReferralShareLink = ({
  enabled,
}: UseReferralShareLinkOptions): UseReferralShareLinkResult => {
  const currentUserId = userId();

  const { data, isFetching, error } = useQuery<
    Awaited<ReturnType<typeof subscriptionsV2Api.subscriptionsV2CreateSubscriptionReferralLink>>,
    Error
  >({
    queryKey: ["referral-share-link", currentUserId],
    queryFn: () => subscriptionsV2Api.subscriptionsV2CreateSubscriptionReferralLink(),
    enabled: enabled && currentUserId !== null,
  });

  return {
    shareUrl: data?.deepLinkUrl,
    isLoading: isFetching,
    error: error ?? undefined,
  };
};
