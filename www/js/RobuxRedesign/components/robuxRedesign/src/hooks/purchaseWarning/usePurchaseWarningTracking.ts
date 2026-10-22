import { useCallback } from "react";
import pfas from "@rbx/core-scripts/payments-flow";
import { PurchaseWarningAction } from "../../services/purchaseWarningsService";
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
