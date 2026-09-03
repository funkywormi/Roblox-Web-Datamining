import { useCallback } from "react";
import { useNotApprovedUIConfig } from "../providers/NotApprovedUIProvider";
import { EventTypes, type NotApprovedPageEventProperties } from "./analytics";
import sendNotApprovedPageEvent from "./sendNotApprovedPageEvent";

type AdditionalProperties = Omit<
  NotApprovedPageEventProperties,
  "eventType" | "timestamp" | "platform"
>;

/**
 * Hook that returns a bound version of sendNotApprovedPageEvent,
 * so callers don't need to pass the analytics function explicitly.
 */
export default function useSendNotApprovedPageEvent(): (
  eventType: EventTypes,
  additionalProperties?: AdditionalProperties,
) => void {
  const { sendAnalyticsEvent, platform, readOnly } = useNotApprovedUIConfig();

  return useCallback(
    (eventType: EventTypes, additionalProperties?: AdditionalProperties) => {
      sendNotApprovedPageEvent(
        sendAnalyticsEvent,
        platform,
        eventType,
        readOnly ?? false,
        additionalProperties,
      );
    },
    [sendAnalyticsEvent, platform, readOnly],
  );
}
