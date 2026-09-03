import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import { ProfileType } from "@rbx/profile-platform";

const PROFILE_PLATFORM_CONTEXT = "profilePlatform";
const TELEMETRY_EVENT_TRACKER = window.EventTracker;

export default {
  fireAnalyticsEvent: (
    profileType: ProfileType,
    eventName: string,
    data: Record<string, string | number | undefined>,
  ): void => {
    sendEventWithTarget(eventName, PROFILE_PLATFORM_CONTEXT, data, targetTypes.WWW);
    // TODO: Update the telemetry event to distinguish between different types of button clicks
    TELEMETRY_EVENT_TRACKER?.fireEvent(`${PROFILE_PLATFORM_CONTEXT}_${profileType}_${eventName}`);
  },
};
