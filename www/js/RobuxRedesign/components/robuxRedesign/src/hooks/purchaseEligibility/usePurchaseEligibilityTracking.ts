import { useCallback } from "react";
import {
  paymentFlowAnalyticsService as pfas,
  UserPurchaseSettingFailureReason,
} from "@rbx/payments/payments-flow-analytics";
import { Tracking } from "../useTracking";

export type PurchaseEligibilityTracking = {
  trackEconomicRestrictionErrorShown: () => void;
  trackPurchaseDisabledConfirm: (showVPCOptimization: boolean) => void;
  trackPurchaseDisabledNeutral: (showVPCOptimization: boolean) => void;
  trackPurchaseDisabledShown: (showVPCOptimization: boolean) => void;
};

export function usePurchaseEligibilityTracking({
  trackFlow,
}: Tracking): PurchaseEligibilityTracking {
  const {
    ENUM_VIEW_MESSAGE: { CANCEL, CLOSE, GO_TO_SETTINGS },
    ENUM_VIEW_NAME: {
      ECONOMIC_RESTRICTION_ERROR,
      OPTIMIZED_PURCHASE_VPC_MODAL,
      PURCHASE_VPC_MODAL,
    },
    ENUM_PURCHASE_EVENT_TYPE: { USER_INPUT, VIEW_SHOWN },
  } = pfas;

  const trackEconomicRestrictionErrorShown = useCallback(() => {
    trackFlow(ECONOMIC_RESTRICTION_ERROR, VIEW_SHOWN);
  }, [trackFlow, ECONOMIC_RESTRICTION_ERROR, VIEW_SHOWN]);

  const trackPurchaseDisabledConfirm = useCallback(
    (showVPCOptimization: boolean) => {
      trackFlow(
        showVPCOptimization ? OPTIMIZED_PURCHASE_VPC_MODAL : PURCHASE_VPC_MODAL,
        USER_INPUT,
        GO_TO_SETTINGS,
      );
    },
    [trackFlow, OPTIMIZED_PURCHASE_VPC_MODAL, PURCHASE_VPC_MODAL, USER_INPUT, GO_TO_SETTINGS],
  );

  const trackPurchaseDisabledNeutral = useCallback(
    (showVPCOptimization: boolean) => {
      trackFlow(
        showVPCOptimization ? OPTIMIZED_PURCHASE_VPC_MODAL : PURCHASE_VPC_MODAL,
        USER_INPUT,
        showVPCOptimization ? CLOSE : CANCEL,
      );
    },
    [trackFlow, OPTIMIZED_PURCHASE_VPC_MODAL, PURCHASE_VPC_MODAL, USER_INPUT, CLOSE, CANCEL],
  );

  const trackPurchaseDisabledShown = useCallback(
    (showVPCOptimization: boolean) => {
      trackFlow(
        showVPCOptimization ? OPTIMIZED_PURCHASE_VPC_MODAL : PURCHASE_VPC_MODAL,
        VIEW_SHOWN,
        UserPurchaseSettingFailureReason.PurchaseNotEnabled,
      );
    },
    [trackFlow, OPTIMIZED_PURCHASE_VPC_MODAL, PURCHASE_VPC_MODAL, VIEW_SHOWN],
  );

  return {
    trackEconomicRestrictionErrorShown,
    trackPurchaseDisabledConfirm,
    trackPurchaseDisabledNeutral,
    trackPurchaseDisabledShown,
  };
}
