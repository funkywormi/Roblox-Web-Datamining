import { eventStreamService } from "core-roblox-utilities";
import { deviceMeta as DeviceMeta } from "header-scripts";
import { fireEvent } from "roblox-event-tracker";
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

const deviceMetaData = DeviceMeta.getDeviceMeta();
const isMobile =
  deviceMetaData?.isPhone || deviceMetaData?.isTablet || deviceMetaData?.deviceType === "phone";

const COUNTER_PREFIX = `AXTracking_${isMobile ? "Mweb" : "Web"}`;
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

  // Send counter event as long as the flag is not set to exclude it
  if (!excludeCounter) {
    const counter = counterName
      ? `${COUNTER_PREFIX}_${counterName}`
      : `${COUNTER_PREFIX}_${itemName}`;
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
    eventStreamService.sendEventWithTarget("userJourneyAction", "RobloxWWW", payload);

    // Manually set session storage to enable debug logging
    if (enableDebugLogging) {
      // eslint-disable-next-line no-console
      console.log("AXAnalyticsService.sendEvent", payload);
    }
  }
};

export default sendAXTracking;
