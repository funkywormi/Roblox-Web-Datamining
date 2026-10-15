import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import ExperimentationService from "@rbx/experimentation";

export const PENDING_TRUSTED_FRIEND_REQUESTS_IXP_LAYER = "Social.Friends.Frontend";
export const SHOW_PENDING_TRUSTED_FRIEND_REQUESTS_PARAM = "showPendingTrustedFriendRequests";

type PendingTrustedFriendRequestsIxpConfig = {
  [SHOW_PENDING_TRUSTED_FRIEND_REQUESTS_PARAM]?: boolean;
};

/**
 * Reads the Social.Friends.Frontend IXP variant for the pending trusted-friend-requests section.
 * Pass `enabled` only when the user has pending requests so we do not enroll users
 * outside that audience.
 *
 * Exposure-based: getAllValuesForLayer assigns the variant; logLayerExposure records exposure
 * when the user is enrolled (param present).
 */
export const usePendingTrustedFriendRequestsIxp = (
  hasPendingTrustedFriendRequests: boolean,
): { data: boolean; isLoading: boolean } => {
  const { data, isLoading } = useQuery({
    queryKey: [`ixp/${PENDING_TRUSTED_FRIEND_REQUESTS_IXP_LAYER}`],
    queryFn: async (): Promise<PendingTrustedFriendRequestsIxpConfig> => {
      try {
        return await ExperimentationService.getAllValuesForLayer(
          PENDING_TRUSTED_FRIEND_REQUESTS_IXP_LAYER,
        );
      } catch {
        return {};
      }
    },
    staleTime: Infinity,
    enabled: hasPendingTrustedFriendRequests,
  });

  useEffect(() => {
    if (data != null && SHOW_PENDING_TRUSTED_FRIEND_REQUESTS_PARAM in data) {
      ExperimentationService.logLayerExposure(PENDING_TRUSTED_FRIEND_REQUESTS_IXP_LAYER);
    }
  }, [data]);

  return {
    data: data?.[SHOW_PENDING_TRUSTED_FRIEND_REQUESTS_PARAM] === true,
    isLoading: hasPendingTrustedFriendRequests && isLoading,
  };
};
