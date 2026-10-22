import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { fireEvent } from "@rbx/legacy-webapp-types/roblox-event-tracker";
import {
  AXSendTrackingContextType,
  AXSendTrackingActionType,
  AXSendTrackingPlatformType,
} from "./types";

/**
 * Sends a tracking event to the AX Analytics Service.
 *
 * @param {string} itemName - The name of the item being tracked.
 * @param {Partial<Record<AXAnalyticsOptionalColumnNames, string | number | boolean>>} metaData - Additional metadata associated with the tracking event.
 * @param {boolean} excludeCounter - Flag to exclude the event from sent as counter.
 * @param {boolean} excludeTelemetry - Flag to exclude the event from telemetry data.
 * @returns void
 * * */

// Read per call, not at module scope: consumers bundle this module, so a module-scope read runs at
// their load time and reports Web on a phone whose meta tag is not in the document yet.
const isMobileDevice = (): boolean => {
  const deviceMetaData = getDeviceMeta();
  return (
    !!deviceMetaData?.isPhone ||
    !!deviceMetaData?.isTablet ||
    deviceMetaData?.deviceType === "phone"
  );
};

const sendAXTracking = ({
  itemName,
  counterName,
  metaData,
  actionType = AXSendTrackingActionType.View,
  excludeCounter = false,
  excludeTelemetry = false,
}: AXSendTrackingContextType): void => {
  // Debug logging
  const enableDebugLogging = sessionStorage.getItem("AXAnalyticsDebugLogging");
  const isMobile = isMobileDevice();
  const counterPrefix = `AXTracking_${isMobile ? "Mweb" : "Web"}`;

  // Send counter event as long as the flag is not set to exclude it
  if (!excludeCounter) {
    const counter = counterName
      ? `${counterPrefix}_${counterName}`
      : `${counterPrefix}_${itemName}`;
    fireEvent(counter);

    // Manually set session storage to enable debug logging
    if (enableDebugLogging) {
      // eslint-disable-next-line no-console
      console.log("AXAnalyticsService.sendCounter", counter);
    }
  }

  // Send telemetry data as long as the flag is not set to exclude it
  if (!excludeTelemetry) {
    const platform: AXSendTrackingPlatformType = isMobile
      ? AXSendTrackingPlatformType.MobileWeb
      : AXSendTrackingPlatformType.Web;
    const payload: { [key: string]: string | number } = {
      item_name: itemName,
      action_type: actionType,
      platform,
      ...metaData,
    };
    sendEventWithTarget("userJourneyAction", "RobloxWWW", payload);

    // Manually set session storage to enable debug logging
    if (enableDebugLogging) {
      // eslint-disable-next-line no-console
      console.log("AXAnalyticsService.sendEvent", payload);
    }
  }
};

export default sendAXTracking;
