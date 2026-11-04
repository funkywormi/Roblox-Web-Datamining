import { paymentFlowAnalyticsService } from "@rbx/payments/payments-flow-analytics";
import type { DeviceMeta } from "@rbx/www-common/device/types";

import { trackCounter } from "../observability";
import { getRobloxAppMinorVersion } from "./appVersion";
import { getTriggerContext } from "./getTriggerContext";
import { watchNativePurchaseHandoff } from "./watchNativePurchaseHandoff";

/**
 * Starts a handoff watch after an in-app purchase click. Logs a counter and a
 * purchase-funnel event only when the webview is still focused after the
 * timeout, which means the native purchase did not take over.
 */
export function startNativePurchaseHandoffWatch(
  deviceMeta: DeviceMeta,
  isSubscription: boolean,
  productId: string,
): void {
  if (!deviceMeta.isIosApp && !deviceMeta.isAndroidApp) {
    return;
  }

  watchNativePurchaseHandoff(signal => {
    if (signal !== "none") {
      return;
    }

    const appMinorVersion = getRobloxAppMinorVersion();
    const appMinorVersionLabel = appMinorVersion == null ? "unknown" : String(appMinorVersion);

    const isSub = String(isSubscription);

    trackCounter("NativePurchaseHandoffMissed", {
      appMinorVersion: appMinorVersionLabel,
      isSub,
    });
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent({
      triggerContext: getTriggerContext(deviceMeta, isSubscription),
      isMidPurchaseStep: true,
      viewName: paymentFlowAnalyticsService.ENUM_VIEW_NAME.NATIVE_PURCHASE_HANDOFF_MISSED,
      purchaseEventType: paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.VIEW_SHOWN,
      eventMetadata: {
        appMinorVersion: appMinorVersionLabel,
        isSub,
        productId,
      },
    });
  });
}
