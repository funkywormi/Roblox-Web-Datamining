import type { BrowserOptions, Event } from "@sentry/browser";
import * as json from "@rbx/core-lib/json";
import type { DeviceInfo } from "../device";

type BeforeSendTransactionCallback = NonNullable<BrowserOptions["beforeSendTransaction"]>;

type SentryTransactionEvent = Parameters<BeforeSendTransactionCallback>[0];

// ---- OTLP/HTTP JSON trace payload types ----
// Based on: https://github.com/open-telemetry/opentelemetry-proto/blob/main/opentelemetry/proto/trace/v1/trace.proto

type OtelAnyValue = {
  stringValue?: string;
  boolValue?: boolean;
  intValue?: string; // OTLP JSON uses string for 64-bit ints
  doubleValue?: number;
  arrayValue?: { values: OtelAnyValue[] };
  kvlistValue?: { values: OtelKeyValue[] };
};

type OtelKeyValue = {
  key: string;
  value: OtelAnyValue;
};

// OpenTelemetry Status codes
export enum OtelStatusCode {
  UNSET = 0,
  OK = 1,
  ERROR = 2,
}

type OtelStatus = {
  message?: string;
  code: OtelStatusCode;
};

type OtelSpan = {
  traceId: string; // 32 hex chars
  spanId: string; // 16 hex chars
  traceState?: string;
  parentSpanId?: string;
  name: string;
  kind: number; // SpanKind enum: UNSPECIFIED=0, INTERNAL=1, SERVER=2, CLIENT=3, PRODUCER=4, CONSUMER=5
  startTimeUnixNano: string;
  endTimeUnixNano: string;
  attributes?: OtelKeyValue[];
  droppedAttributesCount?: number;
  events?: OtelEvent[];
  droppedEventsCount?: number;
  status?: OtelStatus;
};

type OtelEvent = {
  timeUnixNano: string;
  name: string;
  attributes?: OtelKeyValue[];
  droppedAttributesCount?: number;
};

type OtelScopeSpans = {
  scope?: { name?: string; version?: string };
  spans: OtelSpan[];
  schemaUrl?: string;
};

type OtelResourceSpans = {
  resource?: { attributes?: OtelKeyValue[]; droppedAttributesCount?: number };
  scopeSpans: OtelScopeSpans[];
  schemaUrl?: string;
};

type OtelTracesExport = {
  resourceSpans: OtelResourceSpans[];
};

// Sentry span status type (subset)
type SentryStatus = string | undefined;

export function secondsToUnixNanos(seconds: number | undefined): string {
  if (seconds == null || Number.isNaN(seconds)) {
    // fall back to now
    return String(Math.trunc(performance.timeOrigin * 1_000_000 + performance.now() * 1_000_000));
  }
  // seconds -> nanoseconds
  return String(Math.trunc(seconds * 1_000_000_000));
}

export function toAnyValue(value: unknown): OtelAnyValue {
  switch (typeof value) {
    case "string":
      return { stringValue: value };
    case "boolean":
      return { boolValue: value };
    case "number":
      return Number.isInteger(value) ? { intValue: String(value) } : { doubleValue: value };
    case "object":
      if (value === null) {
        return { stringValue: "null" };
      }
      if (Array.isArray(value)) {
        return { arrayValue: { values: value.map(toAnyValue) } };
      }
      // For objects, convert to key-value list
      return {
        kvlistValue: {
          values: Object.entries(value).map(([k, v]) => ({
            key: k,
            value: toAnyValue(v),
          })),
        },
      };
    case "bigint":
      return { intValue: String(value) };
    case "symbol":
      return { stringValue: String(value) };
    case "undefined":
      return { stringValue: "undefined" };
    case "function":
      return { stringValue: "[Function]" };
    default:
      return { stringValue: String(value) };
  }
}

export function objectEntriesSafe(obj: Record<string, unknown> | undefined): [string, unknown][] {
  if (obj == null || typeof obj !== "object") return [];
  return Object.entries(obj);
}

export function buildAttributes(
  fromObjects: (Record<string, unknown> | undefined)[],
): OtelKeyValue[] {
  const attrs: OtelKeyValue[] = [];
  for (const src of fromObjects) {
    for (const [key, val] of objectEntriesSafe(src)) {
      if (val == null) continue;
      attrs.push({ key, value: toAnyValue(val) });
    }
  }
  return attrs;
}

// Drops empty strings so a blank device type/browser is omitted rather than emitted as "".
const nonEmpty = (value?: string | null): string | undefined =>
  value == null || value === "" ? undefined : value;

// Device info as OTEL resource attributes, following semantic conventions.
export function buildDeviceResourceAttributes(deviceInfo?: DeviceInfo): OtelKeyValue[] {
  return buildAttributes([
    {
      "device.type": nonEmpty(deviceInfo?.deviceType),
      "browser.name": nonEmpty(deviceInfo?.browser),
    },
  ]);
}

// Map Sentry span status to OpenTelemetry status code
// Reverse of the mapping in https://develop.sentry.dev/sdk/performance/opentelemetry/#span-status
export function mapSentryStatusToOtel(sentryStatus: SentryStatus): OtelStatus {
  if (!sentryStatus) {
    return { code: OtelStatusCode.UNSET };
  }

  const status = sentryStatus.toLowerCase();

  // Map Sentry status codes to OTEL
  if (status === "ok") {
    return { code: OtelStatusCode.OK };
  }

  // All error states map to ERROR
  const errorStatuses = [
    "cancelled",
    "unknown_error",
    "invalid_argument",
    "deadline_exceeded",
    "not_found",
    "already_exists",
    "permission_denied",
    "resource_exhausted",
    "failed_precondition",
    "aborted",
    "out_of_range",
    "unimplemented",
    "internal_error",
    "unavailable",
    "data_loss",
    "unauthenticated",
  ];

  if (errorStatuses.includes(status)) {
    return { code: OtelStatusCode.ERROR, message: sentryStatus };
  }

  // Default to UNSET for unknown statuses
  return { code: OtelStatusCode.UNSET };
}

// Determine OpenTelemetry SpanKind from Sentry span operation
// Based on common Sentry span operations
export function getSpanKind(op: string | undefined): number {
  if (!op) return 1; // SPAN_KIND_INTERNAL

  const opLower = op.toLowerCase();

  // HTTP client requests
  if (opLower.includes("http") || opLower.includes("fetch") || opLower.includes("xhr")) {
    return 3; // SPAN_KIND_CLIENT
  }

  // Database operations
  if (opLower.includes("db") || opLower.includes("query") || opLower.includes("sql")) {
    return 3; // SPAN_KIND_CLIENT
  }

  // Server-side operations
  if (opLower.includes("server") || opLower.includes("request")) {
    return 2; // SPAN_KIND_SERVER
  }

  // Message queue producers
  if (opLower.includes("publish") || opLower.includes("send") || opLower.includes("produce")) {
    return 4; // SPAN_KIND_PRODUCER
  }

  // Message queue consumers
  if (opLower.includes("consume") || opLower.includes("receive") || opLower.includes("process")) {
    return 5; // SPAN_KIND_CONSUMER
  }

  // Default to INTERNAL
  return 1; // SPAN_KIND_INTERNAL
}

// web-vital measurements documentation: https://develop.sentry.dev/sdk/foundations/envelopes/event-payloads/transaction/
type SentryMeasurements = Event["measurements"];

// snake_case fields mirror Sentry's transaction naming conventions
type SentryTransactionEventInternal = {
  contexts?: {
    trace?: {
      trace_id?: string;
      span_id?: string;
      parent_span_id?: string;
      op?: string;
      status?: string;
      sampled?: boolean;
    };
    otel?: {
      resource?: Record<string, unknown>;
      attributes?: Record<string, unknown>;
    };
  };
  environment?: string;
  release?: string;
  tags?: Record<string, unknown>;
  transaction?: string;
  platform?: string;
  start_timestamp?: number;
  timestamp?: number;
  spans?: SentrySpanInternal[];
  measurements?: SentryMeasurements;
  sdk?: {
    version?: string;
  };
};

type SentrySpanInternal = {
  description?: string;
  op?: string;
  status?: string;
  span_id?: string;
  parent_span_id?: string;
  start_timestamp?: number;
  timestamp?: number;
  data?: Record<string, unknown>;
  tags?: Record<string, unknown>;
};

// Extracts Sentry measurements (TTFB, LCP, FCP, CLS) and turns them into
// standard OpenTelemetry span attributes.
// Omit unit because it is always milliseconds
const TRACKED_WEB_VITALS: Set<string> = new Set<string>(["ttfb", "lcp", "fcp", "cls"]);

export function extractMeasurements(measurements?: SentryMeasurements): OtelKeyValue[] {
  if (!measurements || typeof measurements !== "object") return [];

  const attrs: OtelKeyValue[] = [];
  for (const [metric, data] of Object.entries(measurements)) {
    if (typeof data.value === "number" && TRACKED_WEB_VITALS.has(metric)) {
      // Conventional OTel naming format for Web Vitals (e.g. browser.web_vital.lcp)
      // Emitted as intValue because TraceQL function `quantile_over_time` only
      // supports integer values, and not doubleValue (support for doubles will
      // be added in the future)
      // Because cls is normally a double value, it needs to be multiplied by a large
      // constant to turn it into an integer
      const metricData = metric === "cls" ? data.value * 1000 : data.value;
      attrs.push({
        key: `browser.web_vital.${metric}`,
        value: { intValue: String(Math.round(metricData)) },
      });
    }
  }
  return attrs;
}

// ---- 1) Convert Sentry transaction event to OTLP JSON traces payload ----
// This is the REVERSE of the mapping described in:
// https://develop.sentry.dev/sdk/performance/opentelemetry/
export function convertSentryToOtel(
  event: SentryTransactionEvent,
  deviceInfo?: DeviceInfo,
): OtelTracesExport | null {
  const eventAny = event as SentryTransactionEventInternal;
  const trace = eventAny.contexts?.trace ?? {};
  const otelContext = eventAny.contexts?.otel;

  // Extract trace context (Sentry -> OTEL mapping)
  const traceId = trace.trace_id;
  const transactionSpanId = trace.span_id;
  const parentSpanId = trace.parent_span_id;

  if (!traceId) {
    return null;
  }

  // Build resource attributes from otel.resource context or defaults
  // This reverses: otel.resource -> OpenTelemetry Resource
  const resourceAttrs = [
    ...(otelContext?.resource
      ? buildAttributes([otelContext.resource])
      : buildAttributes([
          { "service.name": "web" },
          eventAny.environment ? { "deployment.environment": eventAny.environment } : undefined,
          { "telemetry.sdk.name": "@sentry/browser" },
          eventAny.release ? { "telemetry.sdk.version": eventAny.release } : undefined,
        ])),
    ...buildDeviceResourceAttributes(deviceInfo),
  ];

  const spans: OtelSpan[] = [];

  // Root transaction -> OTEL root span
  // Sentry transaction name -> OTEL span name
  // Sentry transaction op -> determines OTEL span kind
  const transactionOp = eventAny.contexts?.trace?.op;
  const transactionStatus = eventAny.contexts?.trace?.status;

  const measurementAttrs = extractMeasurements(eventAny.measurements);

  // Build attributes from otel.attributes context or from transaction data
  const transactionAttrs = otelContext?.attributes
    ? [...buildAttributes([otelContext.attributes]), ...measurementAttrs]
    : [
        ...buildAttributes([
          eventAny.tags,
          { "sentry.transaction": eventAny.transaction },
          { "sentry.op": transactionOp },
          transactionOp ? { op: transactionOp } : undefined,
          eventAny.platform ? { platform: eventAny.platform } : undefined,
          eventAny.release ? { release: eventAny.release } : undefined,
          typeof trace.sampled === "boolean" ? { sampled: trace.sampled } : undefined,
        ]),
        ...measurementAttrs,
      ];

  spans.push({
    traceId,
    spanId: transactionSpanId ?? "0000000000000000",
    parentSpanId,
    name: eventAny.transaction ?? "unknown",
    kind: getSpanKind(transactionOp),
    startTimeUnixNano: secondsToUnixNanos(eventAny.start_timestamp),
    endTimeUnixNano: secondsToUnixNanos(eventAny.timestamp),
    attributes: transactionAttrs,
    status: mapSentryStatusToOtel(transactionStatus),
  });

  // Child spans -> OTEL child spans
  const childSpans = Array.isArray(eventAny.spans) ? eventAny.spans : [];
  for (const sentrySpan of childSpans) {
    // Sentry span description -> OTEL span name
    const spanName = sentrySpan.description ?? sentrySpan.op ?? "unknown";
    const spanOp = sentrySpan.op;
    const spanStatus = sentrySpan.status;

    // Combine span data and tags as OTEL attributes
    const spanAttrs = buildAttributes([
      sentrySpan.data,
      sentrySpan.tags,
      spanOp ? { op: spanOp } : undefined,
      { "sentry.op": spanOp },
    ]);

    const otelSpan: OtelSpan = {
      traceId,
      spanId: sentrySpan.span_id ?? "0000000000000000",
      parentSpanId: sentrySpan.parent_span_id ?? transactionSpanId,
      name: spanName,
      kind: getSpanKind(spanOp),
      startTimeUnixNano: secondsToUnixNanos(sentrySpan.start_timestamp),
      endTimeUnixNano: secondsToUnixNanos(sentrySpan.timestamp),
      attributes: spanAttrs,
      status: mapSentryStatusToOtel(spanStatus),
    };

    spans.push(otelSpan);
  }

  const payload: OtelTracesExport = {
    resourceSpans: [
      {
        resource: { attributes: resourceAttrs },
        scopeSpans: [
          {
            scope: {
              name: "@sentry/browser",
              version: eventAny.sdk?.version,
            },
            spans,
          },
        ],
      },
    ],
  };

  return payload;
}

// ---- 2) Post event to OTEL endpoint ----
export function postOtel(endpoint: string, payload: OtelTracesExport): void {
  const body = json.serialize(payload);
  if (body.isErr()) return;

  // eslint-disable-next-line no-restricted-globals
  fetch(endpoint, {
    method: "POST",
    body: body.value,
    headers: {
      "content-type": "application/json",
    },
  })
    .then(
      response => {
        if (!response.ok) {
          console.error("[OTEL DEBUG] Failed to send:", response.status, response.statusText);
        }
      },
      (error: unknown) => {
        console.error("[OTEL DEBUG] Fetch error:", error);
      },
    )
    .catch((error: unknown) => {
      console.error("[OTEL DEBUG] Catch error:", error);
    });
}

// ---- Public entry: convert then send ----
export function sendToOtel(
  endpoint: string,
  event: SentryTransactionEvent,
  deviceInfo?: DeviceInfo,
): void {
  try {
    const otel = convertSentryToOtel(event, deviceInfo);
    if (otel == null) {
      return;
    }
    postOtel(endpoint, otel);
  } catch (error) {
    console.error("[OTEL DEBUG] sendToOtel error:", error);
  }
}
