import { create, DescMessage, MessageInitShape } from "@bufbuild/protobuf";
import environmentUrls from "@rbx/environment-urls";
import { Message, Schema, EventStreamClient } from "@rbx/event-stream-v2";
import { WebEventBaseSchema } from "@rbx/event-stream-proto/event/web_event_base_pb";
import { SupportCenterTicketClickedEventSchema } from "@rbx/event-stream-proto/eventstream/creatorbizops/support_center_ticket_clicked_pb";
import { SupportCenterTicketReplyStartedEventSchema } from "@rbx/event-stream-proto/eventstream/creatorbizops/support_center_ticket_reply_started_pb";
import { SupportCenterTicketReplySubmittedEventSchema } from "@rbx/event-stream-proto/eventstream/creatorbizops/support_center_ticket_reply_submitted_pb";

// @rbx/event-stream-v2's webEventBase defaults guestId to the bigint literal `0n`.
// That token is not valid ES5, so it fails es-check when bundled. Protobuf accepts a number here.
function webEventBase() {
  return create(WebEventBaseSchema, {
    pageId: "",
    referrerUrl: "",
    sessionId: "",
    // @ts-expect-error - es5 doesn't support bigint, but the protobuf schema does, so we need to ignore this type mismatch
    guestId: 0,
    localTimestamp: new Date().toISOString(),
  });
}

export type StructuredEvent = {
  schema: Schema<DescMessage>;
  message: Message<DescMessage>;
};

type TicketClickedEvent = Omit<
  MessageInitShape<typeof SupportCenterTicketClickedEventSchema>,
  "$typeName" | "ingestTimestampMilliseconds" | "universeId"
> & {
  ingestTimestampMilliseconds?: number;
  universeId?: number;
};

type TicketReplyStartedEvent = Omit<
  MessageInitShape<typeof SupportCenterTicketReplyStartedEventSchema>,
  "$typeName" | "ingestTimestampMilliseconds" | "universeId"
> & {
  ingestTimestampMilliseconds?: number;
  universeId?: number;
};

type TicketReplySubmittedEvent = Omit<
  MessageInitShape<typeof SupportCenterTicketReplySubmittedEventSchema>,
  "$typeName" | "ingestTimestampMilliseconds" | "universeId" | "characterCount"
> & {
  ingestTimestampMilliseconds?: number;
  universeId?: number;
  characterCount?: number;
};

const client = new EventStreamClient({
  baseUrl: environmentUrls.apiGatewayUrl,
});

export const SupportCenterMetrics = {
  SupportCenterTicketClicked: (msg: TicketClickedEvent): StructuredEvent => ({
    schema: SupportCenterTicketClickedEventSchema,
    message: create(
      SupportCenterTicketClickedEventSchema,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      msg as MessageInitShape<typeof SupportCenterTicketClickedEventSchema>,
    ),
  }),
  SupportCenterTicketReplyStarted: (msg: TicketReplyStartedEvent): StructuredEvent => ({
    schema: SupportCenterTicketReplyStartedEventSchema,
    message: create(
      SupportCenterTicketReplyStartedEventSchema,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      msg as MessageInitShape<typeof SupportCenterTicketReplyStartedEventSchema>,
    ),
  }),
  SupportCenterTicketReplySubmitted: (msg: TicketReplySubmittedEvent): StructuredEvent => ({
    schema: SupportCenterTicketReplySubmittedEventSchema,
    message: create(
      SupportCenterTicketReplySubmittedEventSchema,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      msg as MessageInitShape<typeof SupportCenterTicketReplySubmittedEventSchema>,
    ),
  }),
};

export const sendEvent = (event: StructuredEvent): void => {
  // eslint-disable-next-line no-void
  void client.sendEvent(event.schema, {
    ...event.message,
    webEventBase: webEventBase(),
    ingestTimestampMilliseconds: Date.now(),
  });
};

export default { sendEvent };
