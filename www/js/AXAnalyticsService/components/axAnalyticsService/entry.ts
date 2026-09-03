import Roblox, { AXAnalyticsService } from "Roblox";
import sendAXTracking from "@rbx/catalog/analytics/sendAXTracking";
import AXAnalyticsConstants from "@rbx/catalog/analytics/AXAnalyticsConstants";
import useAXTrackView from "@rbx/catalog/analytics/useAXTrackView";
import useIsElementVisible from "@rbx/catalog/analytics/useIsElementVisible";
import reportAXError from "@rbx/catalog/analytics/reportAXError";
import { AXSendTrackingActionType } from "@rbx/catalog/analytics/types";

const AnalyticsService: typeof AXAnalyticsService = {
  sendAXTracking,
  useAXTrackView,
  useIsElementVisible,
  AXAnalyticsConstants,
  reportAXError,
};

Roblox.AXAnalyticsService = AnalyticsService;
Roblox.AXSendTrackingActionType = AXSendTrackingActionType;
