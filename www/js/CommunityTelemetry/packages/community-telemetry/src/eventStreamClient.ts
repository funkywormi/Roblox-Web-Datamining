import { create, toBinary } from "@bufbuild/protobuf";
import type { DescMessage } from "@bufbuild/protobuf";
import { gzipSync } from "fflate";
import { Message, Schema } from "@rbx/event-stream-v2";

import { WebEventBase, WebEventBaseSchema } from "@rbx/event-stream-proto/event/web_event_base_pb";
import { SendEventRequestSchema } from "@rbx/service-contracts-proto/roblox/experiencesignalsingest/experiencesignalsingest/v1/experience_signals_ingest_api_pb";

interface EventStreamClientConfig {
  baseUrl?: string;
}

export class EventStreamClient {
  private readonly baseUrl: string;

  constructor({ baseUrl = "https://apis.roblox.com" }: EventStreamClientConfig = {}) {
    this.baseUrl = `${baseUrl.replace(/\/$/, "")}/experience-signals-ingest/public`;
  }

  async sendEvent<T extends DescMessage>(schema: Schema<T>, msg: Message<T>): Promise<void> {
    try {
      const eventPayload = toBinary(schema, create(schema, msg), { writeUnknownFields: false });

      const req = create(SendEventRequestSchema, {
        event: {
          source: schema.typeName,
          payload: eventPayload,
        },
      });

      // The experience-signals-ingest endpoint takes a gzipped binary protobuf body with
      // keepalive; @rbx/core-scripts/http cannot send that. This is fire-and-forget
      // telemetry, not an authenticated data call. (see eslint override in eslint.config.js)
      const response = await fetch(`${this.baseUrl}/v1/events/single`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-protobuf",
          "Content-Encoding": "gzip",
        },
        // fflate returns a Uint8Array which fetch accepts as a body at runtime.
        body: gzipSync(
          toBinary(SendEventRequestSchema, req, { writeUnknownFields: false }),
        ) as unknown as ArrayBuffer,
        credentials: "include",
        keepalive: true,
      });

      if (!response.ok) {
        throw new Error(`status ${response.status}`);
      }
    } catch (error) {
      console.error("EventStream failed to send event:", error);
    }
  }
}

export function webEventBase(
  params: {
    pageId?: string;
    referrerUrl?: string;
    sessionId?: string;
    guestId?: bigint;
    localTime?: Date;
  } = {},
): WebEventBase {
  return create(WebEventBaseSchema, {
    pageId: params.pageId ?? "",
    referrerUrl: params.referrerUrl ?? "",
    sessionId: params.sessionId ?? "",
    // @ts-expect-error - es5 doesn't support bigint, but the protobuf schema does, so we need to ignore this type mismatch
    guestId: params.guestId ?? 0,
    localTimestamp: (params.localTime ?? new Date()).toISOString(),
  });
}
