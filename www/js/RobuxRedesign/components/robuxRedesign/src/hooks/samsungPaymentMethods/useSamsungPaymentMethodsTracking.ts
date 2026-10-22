import { useCallback } from "react";
import pfas from "@rbx/core-scripts/payments-flow";
import { Tracking } from "../useTracking";

export type SamsungPaymentMethodsTracking = {
  trackSamsungPaymentMethodsCancel: () => void;
  trackSamsungPaymentMethodsRedeemCreditClick: () => void;
  trackSamsungPaymentMethodsSamsungPayClick: () => void;
  trackSamsungPaymentMethodsShown: () => void;
};

export function useSamsungPaymentMethodsTracking({
  trackFlow,
}: Tracking): SamsungPaymentMethodsTracking {
  const {
    ENUM_VIEW_MESSAGE: { CANCEL, REDEEM_CREDIT_SELECTED, SAMSUNG_PAY_SELECTED },
    ENUM_VIEW_NAME: {
      MOBILE_PAYMENT_METHOD,
      MOBILE_PAYMENT_METHOD_REDEEM_CREDIT,
      MOBILE_PAYMENT_METHOD_SAMSUNG_PAY,
    },
    ENUM_PURCHASE_EVENT_TYPE: { USER_INPUT, VIEW_SHOWN },
  } = pfas;

  const trackSamsungPaymentMethodsCancel = useCallback(() => {
    trackFlow(MOBILE_PAYMENT_METHOD, USER_INPUT, CANCEL);
  }, [trackFlow, MOBILE_PAYMENT_METHOD, USER_INPUT, CANCEL]);

  const trackSamsungPaymentMethodsRedeemCreditClick = useCallback(() => {
    trackFlow(MOBILE_PAYMENT_METHOD_REDEEM_CREDIT, USER_INPUT, REDEEM_CREDIT_SELECTED);
  }, [trackFlow, MOBILE_PAYMENT_METHOD_REDEEM_CREDIT, USER_INPUT, REDEEM_CREDIT_SELECTED]);

  const trackSamsungPaymentMethodsSamsungPayClick = useCallback(() => {
    trackFlow(MOBILE_PAYMENT_METHOD_SAMSUNG_PAY, USER_INPUT, SAMSUNG_PAY_SELECTED);
  }, [trackFlow, MOBILE_PAYMENT_METHOD_SAMSUNG_PAY, USER_INPUT, SAMSUNG_PAY_SELECTED]);

  const trackSamsungPaymentMethodsShown = useCallback(() => {
    trackFlow(MOBILE_PAYMENT_METHOD, VIEW_SHOWN);
  }, [trackFlow, MOBILE_PAYMENT_METHOD, VIEW_SHOWN]);

  return {
    trackSamsungPaymentMethodsCancel,
    trackSamsungPaymentMethodsRedeemCreditClick,
    trackSamsungPaymentMethodsSamsungPayClick,
    trackSamsungPaymentMethodsShown,
  };
}
