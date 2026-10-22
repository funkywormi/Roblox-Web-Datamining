import { useCallback } from "react";
import { paymentFlowAnalyticsService as pfas } from "@rbx/payments/payments-flow-analytics";
import { Tracking } from "../useTracking";
import { Product } from "../../types/buyRobuxPageData";
import { BuyRobuxPageSectionType } from "../../contexts/PurchaseContext";

export type PurchaseTracking = {
  trackPurchase: (
    product: Product,
    isSubscriptionProduct: boolean,
    sectionType?: BuyRobuxPageSectionType,
  ) => void;
};

export function usePurchaseTracking({ trackFlow }: Tracking): PurchaseTracking {
  const {
    ENUM_VIEW_NAME: { PREMIUM_PURCHASE, PRODUCT_PURCHASE },
    ENUM_PURCHASE_EVENT_TYPE: { USER_INPUT },
  } = pfas;

  const trackPurchase = useCallback(
    (
      { defaultDisplayName, productId }: Product,
      isSubscriptionProduct: boolean,
      sectionType?: BuyRobuxPageSectionType,
    ) => {
      const viewName = isSubscriptionProduct ? PREMIUM_PURCHASE : PRODUCT_PURCHASE;
      const purchaseFromSectionType = sectionType ?? "Unknown";

      // TODO: fix this type error
      // @ts-expect-error - the 3rd param ViewMessage is a typed value but here we are passing a dynamic string. Dynamic string is still tracked, but the type checker is not happy. Hence we are ignoring the type error for now
      trackFlow(viewName, USER_INPUT, `${productId},${defaultDisplayName}`, {
        productId,
        purchaseFromSectionType,
      });
    },
    [trackFlow, PREMIUM_PURCHASE, PRODUCT_PURCHASE, USER_INPUT],
  );

  return {
    trackPurchase,
  };
}
