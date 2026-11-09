import { paymentFlowAnalyticsService } from "@rbx/payments/payments-flow-analytics";
import type { DeviceMeta } from "@rbx/www-common/device/types";

import { trackCounter } from "../observability";
import { getRobloxAppMinorVersion } from "./appVersion";
import { getTriggerContext } from "./getTriggerContext";
import {
  watchNativePurchaseHandoff,
  type NativePurchaseUiShownResult,
} from "./watchNativePurchaseHandoff";

const NATIVE_PURCHASE_UI_SHOWN_BUCKETS = [
  { maxMs: 1000, label: "0-1s" },
  { maxMs: 2000, label: "1-2s" },
  { maxMs: 5000, label: "2-5s" },
  { maxMs: 10000, label: "5-10s" },
  { maxMs: 30000, label: "10-30s" },
] as const;

export type NativePurchaseUiShownBucket =
  | (typeof NATIVE_PURCHASE_UI_SHOWN_BUCKETS)[number]["label"]
  | "timeout"
  | "superseded";

type NativePurchaseContext = {
  appMinorVersion: string;
  isSub: string;
  productId: string;
  triggerContext: ReturnType<typeof getTriggerContext>;
};

export function getNativePurchaseUiShownBucket(elapsedMs: number): NativePurchaseUiShownBucket {
  const bucket = NATIVE_PURCHASE_UI_SHOWN_BUCKETS.find(({ maxMs }) => elapsedMs <= maxMs);
  return bucket?.label ?? "timeout";
}

function getNativePurchaseContext(
  deviceMeta: DeviceMeta,
  isSubscription: boolean,
  productId: string,
): NativePurchaseContext {
  const appMinorVersion = getRobloxAppMinorVersion();
  return {
    appMinorVersion: appMinorVersion == null ? "unknown" : String(appMinorVersion),
    isSub: String(isSubscription),
    productId,
    triggerContext: getTriggerContext(deviceMeta, isSubscription),
  };
}

function trackNativePurchaseUiShown(
  context: NativePurchaseContext,
  result: NativePurchaseUiShownResult,
): void {
  const bucket =
    result.outcome === "shown" ? getNativePurchaseUiShownBucket(result.elapsedMs) : result.outcome;

  trackCounter("NativePurchaseUiShownTime", {
    bucket,
    appMinorVersion: context.appMinorVersion,
    isSub: context.isSub,
  });
  paymentFlowAnalyticsService.sendUserPurchaseFlowEvent({
    triggerContext: context.triggerContext,
    isMidPurchaseStep: true,
    viewName: paymentFlowAnalyticsService.ENUM_VIEW_NAME.NATIVE_PURCHASE_UI_SHOWN_TIME,
    purchaseEventType: paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.VIEW_SHOWN,
    eventMetadata: {
      appMinorVersion: context.appMinorVersion,
      isSub: context.isSub,
      productId: context.productId,
      outcome: result.outcome,
      ...(result.outcome === "shown" ? { elapsedMs: String(result.elapsedMs) } : {}),
    },
  });
}

/**
 * Starts a watch after an in-app purchase click and logs how long the native
 * sheet takes to appear, up to 30 seconds.
 */
export function startNativePurchaseHandoffWatch(
  deviceMeta: DeviceMeta,
  isSubscription: boolean,
  productId: string,
): void {
  if (!deviceMeta.isIosApp && !deviceMeta.isAndroidApp) {
    return;
  }

  const context = getNativePurchaseContext(deviceMeta, isSubscription, productId);

  watchNativePurchaseHandoff({
    onUiShown: result => {
      trackNativePurchaseUiShown(context, result);
    },
  });
}
