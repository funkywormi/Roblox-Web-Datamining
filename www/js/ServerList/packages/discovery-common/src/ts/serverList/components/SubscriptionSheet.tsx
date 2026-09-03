import { useCallback, useEffect } from "react";
import type { ElementType } from "react";
import { SheetRoot } from "@rbx/foundation-ui";
import type { DeviceMeta } from "@rbx/core-scripts/meta/device";

import type { SubscriptionProductData } from "../hooks/useSubscriptionProduct";
import useSubscriptionMembershipPoll from "../hooks/useSubscriptionMembershipPoll";
import usePrivateServerUpsellEvents from "../hooks/usePrivateServerUpsellEvents";

type SubscriptionSheetProps = {
  SheetComponent: ElementType;
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
  subscriptionProduct: SubscriptionProductData;
  deviceMeta: DeviceMeta;
  redirectUrl: string;
  assetType: string;
};

/**
 * Shared Plus-subscription sheet wrapper for the private-server flow.
 * Owns: membership polling, full-page reload on success, and the full set of
 * Prometheus funnel counters (Shown, Attempted, Succeeded, Failed, Dismissed).
 * Used by both MigrationServerListContainer (production) and v2/ServerListContainer.
 */
const SubscriptionSheet = ({
  SheetComponent,
  sheetOpen,
  setSheetOpen,
  subscriptionProduct,
  deviceMeta,
  redirectUrl,
  assetType,
}: SubscriptionSheetProps) => {
  const {
    trackSubscribeSheetClick,
    trackSheetDismiss,
    trackUpsellShown,
    trackSubscribePurchaseSucceeded,
    trackSubscribePurchaseFailed,
  } = usePrivateServerUpsellEvents();

  useEffect(() => {
    if (sheetOpen) trackUpsellShown();
  }, [sheetOpen, trackUpsellShown]);

  // Full reload to refresh server-derived pricing / CTA state across the
  // page (mirrors the /plus PurchaseView pattern); intentional over SPA
  // navigation since the upstream data is computed at page load.
  const onMembershipDetected = useCallback(() => {
    trackSubscribePurchaseSucceeded();
    setSheetOpen(false);
    window.location.reload();
  }, [setSheetOpen, trackSubscribePurchaseSucceeded]);

  const { startPolling, stopPolling, isPolling } = useSubscriptionMembershipPoll({
    productType: subscriptionProduct.productKey.type,
    onMembershipDetected,
  });

  return (
    <SheetRoot
      open={sheetOpen}
      onOpenChange={(nextOpen: boolean) => {
        if (!nextOpen) {
          trackSheetDismiss();
          // Proxy for Subscribe-click-without-Succeeded: if polling is still
          // in-flight when the sheet closes, the native purchase either failed
          // or the user abandoned it. This is a noisy lower-bound on failures.
          if (isPolling) trackSubscribePurchaseFailed();
          setSheetOpen(false);
          // User-initiated dismiss only - programmatic close from
          // onMembershipDetected bypasses Radix and won't reach here.
          stopPolling();
        }
      }}
    >
      {sheetOpen && (
        <SheetComponent
          assetType={assetType}
          deviceMeta={deviceMeta}
          isLoading={isPolling ? true : undefined}
          redirectUrl={redirectUrl}
          subscriptionProductInfo={subscriptionProduct}
          onMobilePurchaseInitiated={startPolling}
          onSubscribeClick={trackSubscribeSheetClick}
        />
      )}
    </SheetRoot>
  );
};

export default SubscriptionSheet;
