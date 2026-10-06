import { getRealtimeGlobals } from "../lib/realtimeConfig";
import type { NotificationDetail } from "../lib/types";

export const maybeSendEventToDataLake = (
  namespaceId: string,
  details: NotificationDetail | NotificationDetail[],
  payloadSize: number,
) => {
  const { EventStream } = getRealtimeGlobals();
  if (!EventStream) {
    return;
  }

  const isDetailsArray = Array.isArray(details);
  // An empty array throws on destructure below, as in the JS.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const primaryDetail = isDetailsArray ? details[0]! : details;
  const {
    SequenceNumber: sequenceNumber,
    ShouldSendToEventStream: shouldSendToEventStream,
    RealtimeMessageIdentifier: messageIdentifier,
  } = primaryDetail;
  if (!shouldSendToEventStream) {
    return;
  }

  EventStream.SendEventWithTarget(
    "RealtimeHandleEvent",
    "RealtimeHandleEventContext", // Context; not currently used
    {
      localTimestampMilliseconds: Date.now(),
      namespaceId,
      sequenceNumber: parseInt(String(sequenceNumber), 10),
      payloadSize,
      bulkMessageCount: isDetailsArray ? details.length : 1,
      messageIdentifier,
    },
    EventStream.TargetTypes.WWW,
  );
};

export const sendConnectionEventToDataLake = (
  connectionState: number,
  connectionId: string,
  subscriptionStatus: string | undefined,
) => {
  const { EventStream } = getRealtimeGlobals();
  if (!EventStream) {
    return;
  }

  EventStream.SendEventWithTarget(
    "RealtimeWebConnectionChange",
    "RealtimeWebConnectionChangeContext", // Context; not currently used
    {
      localTimestampMilliseconds: Date.now(),
      connectionState,
      connectionId,
      subscriptionStatus,
    },
    EventStream.TargetTypes.WWW,
  );
};

export const sendDurableReplayEvent = (action: string) => {
  // window.EventTracker is the legacy untyped global boundary.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const { EventTracker } = window as unknown as {
    EventTracker?: { fireEvent: (name: string) => void };
  };
  EventTracker?.fireEvent(`RealtimeDurableReplay_${action}`);
};
