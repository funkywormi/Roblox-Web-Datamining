import { useCallback } from "react";
import pfas from "@rbx/core-scripts/payments-flow";
import { Product } from "../../types/buyRobuxPageData";
import { Tracking } from "../useTracking";

export type QuickPayTracking = {
  trackQuickPay3DSShown: () => void;
  trackQuickPayClick: () => void;
  trackQuickPayClickPaymentMethodDropdown: () => void;
  trackQuickPayClose: () => void;
  trackQuickPayPurchase: (product: Product | undefined) => void;
  trackQuickPayShown: (product: Product) => void;
  trackQuickPayUseDifferentPaymentMethod: () => void;
};

export function useQuickPayTracking({ trackFlow, trackStatus }: Tracking): QuickPayTracking {
  const {
    ENUM_PURCHASE_STATUS: { SUCCESS },
    ENUM_VIEW_MESSAGE: { CANCEL, PAY_NOW, PAYMENT_METHOD_DROPDOWN, USE_DIFFERENT_PAYMENT_METHOD },
    ENUM_VIEW_NAME: { PRODUCT_PURCHASE_QUICK_PAY, QUICK_PAY_3DS },
    ENUM_PURCHASE_EVENT_TYPE: { USER_INPUT, VIEW_SHOWN },
  } = pfas;

  const trackQuickPayClick = useCallback(() => {
    trackFlow(PRODUCT_PURCHASE_QUICK_PAY, USER_INPUT, PAY_NOW);
  }, [trackFlow, PRODUCT_PURCHASE_QUICK_PAY, USER_INPUT, PAY_NOW]);

  const trackQuickPayClickPaymentMethodDropdown = useCallback(() => {
    trackFlow(PRODUCT_PURCHASE_QUICK_PAY, USER_INPUT, PAYMENT_METHOD_DROPDOWN);
  }, [trackFlow, PRODUCT_PURCHASE_QUICK_PAY, USER_INPUT, PAYMENT_METHOD_DROPDOWN]);

  const trackQuickPayClose = useCallback(() => {
    trackFlow(PRODUCT_PURCHASE_QUICK_PAY, USER_INPUT, CANCEL);
  }, [trackFlow, PRODUCT_PURCHASE_QUICK_PAY, USER_INPUT, CANCEL]);

  const trackQuickPayPurchase = useCallback(
    (product: Product | undefined) => {
      trackStatus(PRODUCT_PURCHASE_QUICK_PAY, SUCCESS, product?.productId);
    },
    [trackStatus, PRODUCT_PURCHASE_QUICK_PAY, SUCCESS],
  );

  const trackQuickPayShown = useCallback(
    ({ productId }: Product) => {
      trackFlow(PRODUCT_PURCHASE_QUICK_PAY, VIEW_SHOWN, undefined, { productId });
    },
    [trackFlow, PRODUCT_PURCHASE_QUICK_PAY, VIEW_SHOWN],
  );

  const trackQuickPay3DSShown = useCallback(() => {
    trackFlow(QUICK_PAY_3DS, VIEW_SHOWN);
  }, [trackFlow, QUICK_PAY_3DS, VIEW_SHOWN]);

  const trackQuickPayUseDifferentPaymentMethod = useCallback(() => {
    trackFlow(PRODUCT_PURCHASE_QUICK_PAY, USER_INPUT, USE_DIFFERENT_PAYMENT_METHOD);
  }, [trackFlow, PRODUCT_PURCHASE_QUICK_PAY, USER_INPUT, USE_DIFFERENT_PAYMENT_METHOD]);

  return {
    trackQuickPay3DSShown,
    trackQuickPayClick,
    trackQuickPayClickPaymentMethodDropdown,
    trackQuickPayClose,
    trackQuickPayPurchase,
    trackQuickPayShown,
    trackQuickPayUseDifferentPaymentMethod,
  };
}
