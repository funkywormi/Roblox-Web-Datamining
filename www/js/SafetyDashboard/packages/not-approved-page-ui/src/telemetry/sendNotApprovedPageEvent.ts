import {
  EventContext,
  EventTypes,
  EVENT_NAME,
  type NotApprovedPageEventProperties,
  type SendAnalyticsEvent,
} from "./analytics";

const sendNotApprovedPageEvent = (
  sendAnalyticsEvent: SendAnalyticsEvent,
  platform: string,
  eventType: EventTypes,
  readOnly: boolean,
  additionalProperties?: Omit<
    NotApprovedPageEventProperties,
    "eventType" | "timestamp" | "platform"
  >,
): void => {
  if (readOnly) {
    return;
  }

  const properties: NotApprovedPageEventProperties = {
    eventType,
    timestamp: Date.now(),
    platform,
    ...additionalProperties,
  };

  sendAnalyticsEvent({
    eventName: EVENT_NAME,
    context: EventContext.NotApprovedPage,
    properties,
  });
};

export default sendNotApprovedPageEvent;
