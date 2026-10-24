import { useCallback } from "react";
import {
  paymentFlowAnalyticsService as pfas,
  PurchaseWarningAction,
} from "@rbx/payments/payments-flow-analytics";
import { Tracking } from "../useTracking";

export type PurchaseWarningTracking = {
  trackPurchaseWarningShown: (action: PurchaseWarningAction) => void;
};

export function usePurchaseWarningTracking({ trackFlow }: Tracking): PurchaseWarningTracking {
  const {
    ENUM_VIEW_NAME: { PURCHASE_WARNING },
    ENUM_PURCHASE_EVENT_TYPE: { VIEW_SHOWN },
  } = pfas;

  const trackPurchaseWarningShown = useCallback(
    (action: PurchaseWarningAction) => {
      trackFlow(PURCHASE_WARNING, VIEW_SHOWN, action);
    },
    [trackFlow, PURCHASE_WARNING, VIEW_SHOWN],
  );

  return {
    trackPurchaseWarningShown,
  };
}
