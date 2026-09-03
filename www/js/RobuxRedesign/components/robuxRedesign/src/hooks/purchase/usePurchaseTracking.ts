import { useCallback } from "react";
import pfas from "@rbx/core-scripts/payments-flow";
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
