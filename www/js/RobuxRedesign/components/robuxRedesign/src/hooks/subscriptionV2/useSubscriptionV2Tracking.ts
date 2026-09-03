import { useCallback } from "react";
import pfas from "@rbx/core-scripts/payments-flow";
import { Tracking } from "../useTracking";
import { trackCounter } from "../../observability";

export type TrackSubscriptionV2SubscribeClickArgs = {
  isFreeTrial: boolean;
  /** Identifies which Plus product tier (baseline vs bundle) was selected; enables bundle attribution. */
  productId: string;
  /** Used to identify redirect-eligible tiles in the iOS in-app redirect cohort. */
  isRedirect: boolean;
};

export type SubscriptionV2Tracking = {
  trackSubscriptionV2Shown: (isFreeTrial: boolean) => void;
  trackSubscriptionV2SubscribeClick: (args: TrackSubscriptionV2SubscribeClickArgs) => void;
  trackSubscriptionV2LearnMoreClick: () => void;
};

const {
  ENUM_VIEW_NAME: { ROBLOX_PLUS_BUY_ROBUX },
  ENUM_PURCHASE_EVENT_TYPE: { USER_INPUT, VIEW_SHOWN },
  ENUM_VIEW_MESSAGE: { ROBLOX_PLUS_FREE_TRIAL, ROBLOX_PLUS_SUBSCRIBE, ROBLOX_PLUS_LEARN_MORE },
} = pfas;

export function useSubscriptionV2Tracking({ trackFlow }: Tracking): SubscriptionV2Tracking {
  const trackSubscriptionV2Shown = useCallback(
    (isFreeTrial: boolean) => {
      trackFlow(ROBLOX_PLUS_BUY_ROBUX, VIEW_SHOWN, undefined, { isFreeTrial });
    },
    [trackFlow],
  );

  const trackSubscriptionV2SubscribeClick = useCallback(
    ({ isFreeTrial, productId, isRedirect }: TrackSubscriptionV2SubscribeClickArgs) => {
      trackCounter("SubscriptionV2SubscribeClick", {
        isFreeTrial: String(isFreeTrial),
        productId,
        isRedirect: String(isRedirect),
      });
      const viewMessage = isFreeTrial ? ROBLOX_PLUS_FREE_TRIAL : ROBLOX_PLUS_SUBSCRIBE;
      trackFlow(ROBLOX_PLUS_BUY_ROBUX, USER_INPUT, viewMessage, {
        isFreeTrial,
        productId,
        isRedirect,
      });
    },
    [trackFlow],
  );

  const trackSubscriptionV2LearnMoreClick = useCallback(() => {
    trackCounter("SubscriptionV2LearnMoreClick");
    trackFlow(ROBLOX_PLUS_BUY_ROBUX, USER_INPUT, ROBLOX_PLUS_LEARN_MORE);
  }, [trackFlow]);

  return {
    trackSubscriptionV2Shown,
    trackSubscriptionV2SubscribeClick,
    trackSubscriptionV2LearnMoreClick,
  };
}
