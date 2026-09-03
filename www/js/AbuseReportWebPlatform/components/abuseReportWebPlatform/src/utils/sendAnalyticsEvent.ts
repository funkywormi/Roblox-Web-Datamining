import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import { TELEMETRY_ENTRY_POINT, TELEMETRY_EVENT_CONTEXT, TELEMETRY_EVENT_NAME } from "./constants";

export enum TelemetryEventType {
  Abandoned = "EVENT_ABANDONED",
  Error = "EVENT_ERROR",
  Rendered = "EVENT_RENDERED",
  Submitted = "EVENT_SUBMITTED",
}

export type AnalyticsEventMetadata = {
  error?: string;
};

export type AnalyticsEventProps = {
  abuseVector: string;
  eventType: TelemetryEventType;
  meta?: AnalyticsEventMetadata;
};

const buildCustomFields = ({ abuseVector, eventType, meta }: AnalyticsEventProps) => {
  const { CurrentUser } = window.Roblox;

  const customFields: Record<string, string | number | undefined> = {
    abuseVector,
    entryPoint: TELEMETRY_ENTRY_POINT,
    eventType,
    meta: meta ? JSON.stringify(meta) : undefined,
    userId: CurrentUser?.userId,
  };
  return customFields;
};

const sendAnalyticsEvent = (analyticsEventProps: AnalyticsEventProps) => {
  const customFields = buildCustomFields(analyticsEventProps);
  sendEventWithTarget(TELEMETRY_EVENT_NAME, TELEMETRY_EVENT_CONTEXT, customFields, targetTypes.WWW);
};

export default sendAnalyticsEvent;
