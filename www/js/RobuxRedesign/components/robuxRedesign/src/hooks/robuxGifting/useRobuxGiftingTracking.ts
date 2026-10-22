import { useCallback } from "react";
import pfas from "@rbx/core-scripts/payments-flow";
import { Tracking } from "../useTracking";

export type RobuxGiftingTracking = {
  trackRobuxGiftClick: () => void;
  trackRobuxGiftShown: () => void;
};

export function useRobuxGiftingTracking({ trackFlow }: Tracking): RobuxGiftingTracking {
  const {
    ENUM_VIEW_MESSAGE: { REQUEST_ROBUX },
    ENUM_VIEW_NAME: { ROBUX_GIFT, ROBUX_GIFT_MODAL },
    ENUM_PURCHASE_EVENT_TYPE: { USER_INPUT, VIEW_SHOWN },
  } = pfas;

  const trackRobuxGiftClick = useCallback(() => {
    trackFlow(ROBUX_GIFT, USER_INPUT, REQUEST_ROBUX);
  }, [trackFlow, ROBUX_GIFT, USER_INPUT, REQUEST_ROBUX]);

  const trackRobuxGiftShown = useCallback(() => {
    trackFlow(ROBUX_GIFT_MODAL, VIEW_SHOWN, REQUEST_ROBUX);
  }, [trackFlow, ROBUX_GIFT_MODAL, VIEW_SHOWN, REQUEST_ROBUX]);

  return {
    trackRobuxGiftClick,
    trackRobuxGiftShown,
  };
}
