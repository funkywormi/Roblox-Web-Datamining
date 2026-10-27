import { EVENT_CONTEXT, EVENT_NAME, type EventType } from "./eventConstants";

/**
 * Optional analytics fields supplied by callers, parsed into the snake_case wire fields below.
 */
export interface AdditionalFields {
  eventId?: string;
  timeoutDurationSeconds?: number;
  acknowledgeable?: boolean;
  interventionType?: string;
  evidence?: string;
  timeToInteractSeconds?: number;
  error?: string;
}

/**
 * The snake_case wire property schema owned by this package. Deliberately excludes any
 * ambient host identity (e.g. user/session ID) — the host's injected sender is responsible
 * for stamping those on before forwarding to the event stream.
 */
export interface UniversalFeatureRestrictionsAnalyticsProperties {
  timestamp_milliseconds: number;
  event_type: EventType;
  abuse_vector: string;
  placement: string;
  event_id?: string;
  timeout_duration_seconds?: number;
  acknowledgeable?: boolean;
  intervention_type?: string;
  evidence?: string;
  time_to_interact_seconds?: number;
  error?: string;
}

/**
 * A fully-formed analytics event owned by this package.
 */
export interface UniversalFeatureRestrictionsAnalyticsEvent {
  name: typeof EVENT_NAME;
  context: typeof EVENT_CONTEXT;
  properties: UniversalFeatureRestrictionsAnalyticsProperties;
}

/**
 * Builds the typed analytics event for a given event type, abuse vector, host placement, and
 * optional fields. The optional fields are parsed into the package's snake_case wire schema.
 */
export function buildAnalyticsEvent(
  eventType: EventType,
  abuseVector: string,
  placement: string,
  additionalFields?: AdditionalFields,
): UniversalFeatureRestrictionsAnalyticsEvent {
  return {
    name: EVENT_NAME,
    context: EVENT_CONTEXT,
    properties: {
      timestamp_milliseconds: Date.now(),
      event_type: eventType,
      abuse_vector: abuseVector,
      placement,

      // Optional fields passed in from consumers parsed into snake_case fields
      event_id: additionalFields?.eventId,
      timeout_duration_seconds: additionalFields?.timeoutDurationSeconds,
      acknowledgeable: additionalFields?.acknowledgeable,
      intervention_type: additionalFields?.interventionType,
      evidence: additionalFields?.evidence,
      time_to_interact_seconds: additionalFields?.timeToInteractSeconds,
      error: additionalFields?.error,
    },
  };
}
