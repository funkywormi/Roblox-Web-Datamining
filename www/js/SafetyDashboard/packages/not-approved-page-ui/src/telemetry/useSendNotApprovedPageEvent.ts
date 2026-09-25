import { useCallback } from "react";
import { useNotApprovedUIConfig } from "../providers/NotApprovedUIProvider";
import { EventTypes, type NotApprovedPageEventProperties } from "./analytics";
import sendNotApprovedPageEvent from "./sendNotApprovedPageEvent";
import { useNotApprovedPagePunishment } from "../context/NotApprovedPagePunishmentProvider";

type AdditionalProperties = Omit<
  NotApprovedPageEventProperties,
  "eventType" | "timestamp" | "platform" | "isKidsTreatment"
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
  const { isKidsTreatment, ixpData } = useNotApprovedPagePunishment();
  const isKidsTreatmentAssigned = ixpData?.FFlagKidsNotApprovedPageTreatment2 === true;

  return useCallback(
    (eventType: EventTypes, additionalProperties?: AdditionalProperties) => {
      sendNotApprovedPageEvent(sendAnalyticsEvent, platform, eventType, readOnly ?? false, {
        ...additionalProperties,
        ...(isKidsTreatmentAssigned ? { isKidsTreatment } : {}),
      });
    },
    [sendAnalyticsEvent, platform, readOnly, isKidsTreatment, isKidsTreatmentAssigned],
  );
}
