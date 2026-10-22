import { useCallback } from "react";
import { paymentFlowAnalyticsService as pfas } from "@rbx/payments/payments-flow-analytics";
import { Tracking } from "../useTracking";

export type GiftCardTracking = {
  trackGiftCardClick: () => void;
};

export function useGiftCardTracking({ trackFlow }: Tracking): GiftCardTracking {
  const {
    ENUM_VIEW_MESSAGE: { BUY_NOW },
    ENUM_VIEW_NAME: { GIFT_CARD },
    ENUM_PURCHASE_EVENT_TYPE: { USER_INPUT },
  } = pfas;

  const trackGiftCardClick = useCallback(() => {
    trackFlow(GIFT_CARD, USER_INPUT, BUY_NOW);
  }, [trackFlow, GIFT_CARD, USER_INPUT, BUY_NOW]);

  return {
    trackGiftCardClick,
  };
}
