import { paymentFlowAnalyticsService as pfas } from "@rbx/payments/payments-flow-analytics";
import { DeviceMeta } from "@rbx/www-common/device/types";
import { getIsNativePurchasePlatform } from "./platform";

const {
  ENUM_TRIGGERING_CONTEXT: {
    MOBILE_WEB_PREMIUM_PURCHASE,
    MOBILE_WEB_ROBUX_PURCHASE,
    WEBVIEW_PREMIUM_PURCHASE,
    WEBVIEW_ROBUX_PURCHASE,
    WEB_PREMIUM_PURCHASE,
    WEB_ROBUX_PURCHASE,
  },
} = pfas;

export function getTriggerContext(deviceMeta: DeviceMeta, isSubscriptionProduct = false) {
  if (getIsNativePurchasePlatform(deviceMeta)) {
    return isSubscriptionProduct ? WEBVIEW_PREMIUM_PURCHASE : WEBVIEW_ROBUX_PURCHASE;
  }

  if (deviceMeta.isDesktop) {
    return isSubscriptionProduct ? WEB_PREMIUM_PURCHASE : WEB_ROBUX_PURCHASE;
  }

  return isSubscriptionProduct ? MOBILE_WEB_PREMIUM_PURCHASE : MOBILE_WEB_ROBUX_PURCHASE;
}
