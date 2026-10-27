import { useCallback, useContext, useEffect, useState } from "react";
import { document } from "@rbx/core-lib/browser";
import { isInApp, isOnDesktop } from "../../utils/platform";
import { Product } from "../../types/buyRobuxPageData";
import { getPurchaseWarning, PurchaseWarningAction } from "../../services/purchaseWarningsService";
import { BuyRobuxPageContext } from "../../contexts/BuyRobuxPageContext";
import { ModalContext } from "../../contexts/ModalContext";
import { trackCounter } from "../../observability";

export const DATASET_ELEMENT_ID = "robux-container-base";

type ContinuePurchaseFn = (
  product: Product,
  isSubscriptionProduct: boolean,
  purchaseUrl: string,
) => void;

export function usePurchaseWarning(): {
  isStoppedByPurchaseWarning: (
    product: Product,
    isSubscriptionProduct: boolean,
    purchaseUrl: string,
    continuePurchase: ContinuePurchaseFn,
  ) => Promise<boolean>;
} {
  const { isSubscriber } = useContext(BuyRobuxPageContext);
  const {
    purchaseWarning: { openModal: openPurchaseWarningModal },
  } = useContext(ModalContext);

  const [isPurchaseWarningModalEnabled, setIsPurchaseWarningModalEnabled] =
    useState<boolean>(false);

  useEffect(() => {
    const rootDataset = document?.getElementById(DATASET_ELEMENT_ID)?.dataset;

    if (rootDataset) {
      setIsPurchaseWarningModalEnabled(rootDataset.isScaryModalEnabled === "true");
    }
  }, []);

  const isStoppedByPurchaseWarning = useCallback(
    async (
      product: Product,
      isSubscriptionProduct: boolean,
      purchaseUrl: string,
      continuePurchase: ContinuePurchaseFn,
    ): Promise<boolean> => {
      if (isOnDesktop && !isPurchaseWarningModalEnabled) {
        // Only desktop respect this on the Robux package selection page.
        // On desktop, users above 13 won’t see any purchase warnings on the **Robux package selection page**.
        // On desktop, users 13 - 17 will see the parentalAuthorization13To17Required on the **payment method selection page**.
        // On mobile webview (native purchase), there is no payment method selection.
        // Thus, only desktop needs to respect this setting.
        return false;
      }

      // Only show the scary modal for 13-17 when it's not on desktop & user is not premium & not buying a subscription package
      const is13To17ScaryModalEnabled = !isOnDesktop && !isSubscriber && !isSubscriptionProduct;

      const purchaseWarning = await getPurchaseWarning(
        is13To17ScaryModalEnabled,
        product.productId,
      );
      if (!purchaseWarning) {
        return false;
      }

      const { action } = purchaseWarning;
      const showsScaryModal =
        action === PurchaseWarningAction.U13PaymentModal ||
        action === PurchaseWarningAction.U13MonthlyThreshold1Modal ||
        action === PurchaseWarningAction.U13MonthlyThreshold2Modal;
      const showsParentalConsentInApp =
        action === PurchaseWarningAction.ParentalConsentWarningPaymentModal13To17 && isInApp;

      if (showsScaryModal || showsParentalConsentInApp) {
        trackCounter("PurchaseWarningModalShown", { action });
        openPurchaseWarningModal(action, () => {
          continuePurchase(product, isSubscriptionProduct, purchaseUrl);
        });
        return true;
      }

      return false;
    },
    [isPurchaseWarningModalEnabled, isSubscriber, openPurchaseWarningModal],
  );

  return {
    isStoppedByPurchaseWarning,
  };
}
