import pfas from "@rbx/core-scripts/payments-flow";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { isInApp } from "./platform";

const isDesktop = getDeviceMeta()?.isDesktop;

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

export function getTriggerContext(isSubscriptionProduct = false) {
  if (isInApp) {
    return isSubscriptionProduct ? WEBVIEW_PREMIUM_PURCHASE : WEBVIEW_ROBUX_PURCHASE;
  }

  if (isDesktop) {
    return isSubscriptionProduct ? WEB_PREMIUM_PURCHASE : WEB_ROBUX_PURCHASE;
  }

  return isSubscriptionProduct ? MOBILE_WEB_PREMIUM_PURCHASE : MOBILE_WEB_ROBUX_PURCHASE;
}
