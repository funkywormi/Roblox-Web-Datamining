import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { fireEvent } from "@rbx/www-common/event-tracker";
import { AXSendTrackingActionType, AXSendTrackingPlatformType } from "@rbx/catalog/analytics/types";
import type { AXSendTrackingContextType, AXErrorContextType } from "@rbx/catalog/analytics/types";

/**
 * Next-safe reimplementation of the avatar-editor slice of `window.Roblox.AXAnalyticsService`
 * (`@rbx/catalog`'s `sendAXTracking` / `reportAXError` + `AXAnalyticsConstants`), previously sourced
 * off the deprecated `@rbx/legacy-webapp-types/Roblox` barrel.
 *
 * Device meta is read lazily per call so importing this module is SSR-safe. Both signals the original
 * emitted are preserved verbatim:
 *   - `userJourneyAction` EventStream telemetry via `@rbx/core-scripts/event-stream`.
 *   - the `AXTracking_{Web|Mweb}_*` counter via `@rbx/www-common/event-tracker` `fireEvent`, which POSTs
 *     the same metrics report-event web-counter the legacy `roblox-event-tracker` `fireEvent` fed —
 *     identical counter names, so existing dashboards/alerts keep working.
 */

const isMobileDevice = (): boolean => {
  const deviceMetaData = getDeviceMeta();
  return (
    !!deviceMetaData?.isPhone ||
    !!deviceMetaData?.isTablet ||
    deviceMetaData?.deviceType === "phone"
  );
};

export const sendAXTracking = ({
  itemName,
  counterName,
  metaData,
  actionType = AXSendTrackingActionType.View,
  excludeCounter = false,
  excludeTelemetry = false,
}: AXSendTrackingContextType): void => {
  const isMobile = isMobileDevice();

  if (!excludeCounter) {
    fireEvent(`AXTracking_${isMobile ? "Mweb" : "Web"}_${counterName ?? itemName}`);
  }

  if (!excludeTelemetry) {
    const payload: Record<string, string | number> = {
      item_name: itemName,
      action_type: actionType,
      platform: isMobile ? AXSendTrackingPlatformType.MobileWeb : AXSendTrackingPlatformType.Web,
      ...metaData,
    };
    sendEventWithTarget("userJourneyAction", "RobloxWWW", payload, targetTypes.WWW);
  }
};

export const reportAXError = ({ log, itemName, counterName }: AXErrorContextType): void => {
  sendAXTracking({
    itemName: `AXError_${itemName}`,
    counterName,
    metaData: { metaData: log },
    actionType: AXSendTrackingActionType.Error,
  });
};

/**
 * The subset of `@rbx/catalog`'s `AXAnalyticsConstants` used by the avatar editor. Values are the
 * self-named event strings from the source of truth (`AXAnalyticsConstants.ts`); kept as a local
 * copy so emitting events does not depend on the `axAnalyticsService` external being redeployed.
 */
export const AXAnalyticsConstants = {
  AvatarEditorView: "AvatarEditorView",
  AvatarEditorChangeAvatar: "AvatarEditorChangeAvatar",
  PurchaseButtonClick: "PurchaseButtonClick",
  PurchaseSuccess: "PurchaseSuccess",
  PurchaseSuccessAsset: "PurchaseSuccessAsset",
  PurchaseSuccessTimedOptionRepurchase: "PurchaseSuccessTimedOptionRepurchase",
} as const;
