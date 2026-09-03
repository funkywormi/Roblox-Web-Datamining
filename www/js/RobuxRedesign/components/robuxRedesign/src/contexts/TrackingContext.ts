import { createContext } from "react";
import { PurchaseWarningTracking } from "../hooks/purchaseWarning/usePurchaseWarningTracking";
import { QuickPayTracking } from "../hooks/quickPay/useQuickPayTracking";
import { RobuxGiftingTracking } from "../hooks/robuxGifting/useRobuxGiftingTracking";
import { PurchaseEligibilityTracking } from "../hooks/purchaseEligibility/usePurchaseEligibilityTracking";
import { PurchaseTracking } from "../hooks/purchase/usePurchaseTracking";
import { GiftCardTracking } from "../hooks/giftCards/giftCardTracking";
import { RedirectTracking } from "../hooks/useRedirectTracking";
import { SamsungPaymentMethodsTracking } from "../hooks/samsungPaymentMethods/useSamsungPaymentMethodsTracking";
import type { SubscriptionV2Tracking } from "../hooks/subscriptionV2/useSubscriptionV2Tracking";
import { TransfersTracking } from "../hooks/useTransfersTracking";

/** Interface merge avoids intersection blow-ups where TS/ESLint infer `error` for some keys. */
export interface TrackingContextProps
  extends GiftCardTracking,
    PurchaseTracking,
    PurchaseEligibilityTracking,
    PurchaseWarningTracking,
    QuickPayTracking,
    RobuxGiftingTracking,
    SubscriptionV2Tracking,
    RedirectTracking,
    SamsungPaymentMethodsTracking,
    TransfersTracking {}

export const TrackingContext = createContext<TrackingContextProps>({
  trackEconomicRestrictionErrorShown: () => undefined,
  trackGiftCardClick: () => undefined,
  trackPurchase: () => undefined,
  trackPurchaseDisabledConfirm: () => undefined,
  trackPurchaseDisabledNeutral: () => undefined,
  trackPurchaseDisabledShown: () => undefined,
  trackPurchaseWarningShown: () => undefined,
  trackQuickPay3DSShown: () => undefined,
  trackQuickPayClick: () => undefined,
  trackQuickPayClickPaymentMethodDropdown: () => undefined,
  trackQuickPayClose: () => undefined,
  trackQuickPayPurchase: () => undefined,
  trackQuickPayShown: () => undefined,
  trackQuickPayUseDifferentPaymentMethod: () => undefined,
  trackRobuxGiftClick: () => undefined,
  trackRobuxGiftShown: () => undefined,
  trackSubscriptionV2Shown: () => undefined,
  trackSubscriptionV2SubscribeClick: () => undefined,
  trackSubscriptionV2LearnMoreClick: () => undefined,
  trackRedirectClick: () => undefined,
  trackSamsungPaymentMethodsCancel: () => undefined,
  trackSamsungPaymentMethodsRedeemCreditClick: () => undefined,
  trackSamsungPaymentMethodsSamsungPayClick: () => undefined,
  trackSamsungPaymentMethodsShown: () => undefined,
  trackTransferSendImpression: () => undefined,
  trackTransferSendSheetView: () => undefined,
  trackTransferSendUserSelected: _source => undefined,
  trackPendingTransfersImpression: () => undefined,
  trackPendingTransfersSheetView: () => undefined,
  trackPendingTransfersAcceptClick: () => undefined,
});
