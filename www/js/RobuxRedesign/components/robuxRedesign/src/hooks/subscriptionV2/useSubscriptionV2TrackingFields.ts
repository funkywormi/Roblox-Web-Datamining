import { useContext } from "react";

import { TrackingContext } from "../../contexts/TrackingContext";

import type { SubscriptionV2Tracking } from "./useSubscriptionV2Tracking";

/** Reads subscription V2 handlers from `TrackingContext` with an explicit `SubscriptionV2Tracking` return type. */
export function useSubscriptionV2TrackingFields(): SubscriptionV2Tracking {
  const ctx = useContext(TrackingContext);
  return {
    trackSubscriptionV2Shown: ctx.trackSubscriptionV2Shown,
    trackSubscriptionV2SubscribeClick: ctx.trackSubscriptionV2SubscribeClick,
    trackSubscriptionV2LearnMoreClick: ctx.trackSubscriptionV2LearnMoreClick,
  };
}
