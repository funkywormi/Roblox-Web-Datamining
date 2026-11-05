import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { fireEvent } from "@rbx/www-common/event-tracker";
import {
  AXSendTrackingActionType,
  AXSendTrackingPlatformType,
  type AXSendTrackingContextType,
} from "@rbx/catalog/analytics/types";

// Mirrors `@rbx/catalog`'s `sendAXTracking`, but fires the counter through www-common because
// Next.js has no `window.EventTracker`.

const isMobileDevice = (): boolean => {
  const deviceMetaData = getDeviceMeta();
  return (
    Boolean(deviceMetaData?.isPhone) ||
    Boolean(deviceMetaData?.isTablet) ||
    deviceMetaData?.deviceType === "phone"
  );
};

export const sendAxTracking = ({
  itemName,
  counterName,
  metaData,
  actionType = AXSendTrackingActionType.View,
}: Pick<
  AXSendTrackingContextType,
  "itemName" | "counterName" | "metaData" | "actionType"
>): void => {
  const isMobile = isMobileDevice();
  fireEvent(`AXTracking_${isMobile ? "Mweb" : "Web"}_${counterName ?? itemName}`);
  sendEventWithTarget("userJourneyAction", "RobloxWWW", {
    item_name: itemName,
    action_type: actionType,
    platform: isMobile ? AXSendTrackingPlatformType.MobileWeb : AXSendTrackingPlatformType.Web,
    ...metaData,
  });
};
