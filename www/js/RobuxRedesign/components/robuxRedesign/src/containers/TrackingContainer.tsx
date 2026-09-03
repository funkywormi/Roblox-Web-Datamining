import { ReactNode, useMemo } from "react";
import { TrackingContext } from "../contexts/TrackingContext";
import { useTracking } from "../hooks/useTracking";
import { usePurchaseWarningTracking } from "../hooks/purchaseWarning/usePurchaseWarningTracking";
import { useQuickPayTracking } from "../hooks/quickPay/useQuickPayTracking";
import { useRobuxGiftingTracking } from "../hooks/robuxGifting/useRobuxGiftingTracking";
import { useSubscriptionV2Tracking } from "../hooks/subscriptionV2/useSubscriptionV2Tracking";
import { usePurchaseEligibilityTracking } from "../hooks/purchaseEligibility/usePurchaseEligibilityTracking";
import { usePurchaseTracking } from "../hooks/purchase/usePurchaseTracking";
import { useGiftCardTracking } from "../hooks/giftCards/giftCardTracking";
import { useRedirectTracking } from "../hooks/useRedirectTracking";
import { useSamsungPaymentMethodsTracking } from "../hooks/samsungPaymentMethods/useSamsungPaymentMethodsTracking";
import { useTransfersTracking } from "../hooks/useTransfersTracking";

export function TrackingContainer({ children }: { children: ReactNode }) {
  const tracking = useTracking();

  const giftCardTracking = useGiftCardTracking(tracking);
  const transfersTracking = useTransfersTracking(tracking);
  const samsungPaymentMethodsTracking = useSamsungPaymentMethodsTracking(tracking);
  const purchaseTracking = usePurchaseTracking(tracking);
  const purchaseEligibilityTracking = usePurchaseEligibilityTracking(tracking);
  const purchaseWarningTracking = usePurchaseWarningTracking(tracking);
  const quickPayTracking = useQuickPayTracking(tracking);
  const robuxGiftingTracking = useRobuxGiftingTracking(tracking);
  const subscriptionV2Tracking = useSubscriptionV2Tracking(tracking);
  const redirectTracking = useRedirectTracking(tracking);

  const trackingContextValue = useMemo(
    () => ({
      ...giftCardTracking,
      ...samsungPaymentMethodsTracking,
      ...purchaseTracking,
      ...purchaseEligibilityTracking,
      ...purchaseWarningTracking,
      ...quickPayTracking,
      ...robuxGiftingTracking,
      ...subscriptionV2Tracking,
      ...redirectTracking,
      ...transfersTracking,
    }),
    [
      giftCardTracking,
      samsungPaymentMethodsTracking,
      purchaseTracking,
      purchaseEligibilityTracking,
      purchaseWarningTracking,
      quickPayTracking,
      robuxGiftingTracking,
      subscriptionV2Tracking,
      redirectTracking,
      transfersTracking,
    ],
  );

  return (
    <TrackingContext.Provider value={trackingContextValue}>{children}</TrackingContext.Provider>
  );
}
