import {
  actionTypeName,
  SduiErrorName,
  type ActionConfig,
  type AnalyticsFieldMap,
  type SduiActionHandlerConfig,
  type SduiActionTelemetryHandler,
} from "@rbx/sdui-core";

const CUSTOM_ANALYTICS_ENVELOPE_KEYS = new Set([
  "eventName",
  "event_name",
  "eventFields",
  "event_fields",
]);

const EVENT_FIELDS_KEYS = ["eventFields", "event_fields"] as const;

function isEventFields(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** Bufbuild runtime metadata (`$typeName`, `$unknown`) must not ship on event-stream payloads. */
function isProtoMetadataKey(key: string): boolean {
  return key.startsWith("$");
}

function copyAnalyticsFields(source: Record<string, unknown>): Record<string, unknown> {
  const params: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(source)) {
    if (!CUSTOM_ANALYTICS_ENVELOPE_KEYS.has(key) && !isProtoMetadataKey(key)) {
      params[key] = value;
    }
  }

  return params;
}

function readNestedEventFields(params: Record<string, unknown>): Record<string, unknown> {
  for (const key of EVENT_FIELDS_KEYS) {
    const value = params[key];
    if (isEventFields(value)) {
      return copyAnalyticsFields(value);
    }
  }
  return {};
}

/**
 * Removes the custom-event envelope and gives template `eventFields`
 * precedence over activation-time params.
 */
export function buildCustomAnalyticsEventParams(
  actionParams: Record<string, unknown>,
): Record<string, unknown> {
  return {
    ...copyAnalyticsFields(actionParams),
    ...readNestedEventFields(actionParams),
  };
}

function readEventName(actionParams: Record<string, unknown>): string | undefined {
  const eventName = actionParams.eventName ?? actionParams.event_name;
  return typeof eventName === "string" && eventName.length > 0 ? eventName : undefined;
}

function scalarFields(source: Record<string, unknown> = {}): AnalyticsFieldMap {
  const fields: AnalyticsFieldMap = {};
  for (const [key, value] of Object.entries(source)) {
    if (
      !isProtoMetadataKey(key) &&
      (typeof value === "string" || typeof value === "number" || typeof value === "boolean")
    ) {
      fields[key] = value;
    }
  }
  return fields;
}

/** Matches app's CustomAnalyticsEvent: merge scalar fields and send without event registration. */
export const customAnalyticsEventTelemetryHandler: SduiActionTelemetryHandler = (
  { actionParams },
  analyticsContext,
  ctx,
) => {
  // The name resolver reports malformed names before this fallback is invoked.
  const eventName = readEventName(actionParams);
  if (!eventName) return;

  ctx.analyticsReporter.logEvent(
    { name: eventName, type: eventName, context: ctx.pageContext.appPage },
    {
      ...scalarFields(analyticsContext?.getAncestorAnalyticsDataSnapshot()),
      ...scalarFields(analyticsContext?.getAnalyticsDataSnapshot()),
      ...scalarFields(copyAnalyticsFields(actionParams)),
      ...scalarFields(readNestedEventFields(actionParams)),
    },
  );
};

export const resolveCustomAnalyticsTelemetryHandlerName: NonNullable<
  SduiActionHandlerConfig["resolveTelemetryHandlerName"]
> = (actionConfig: ActionConfig, _analyticsContext, ctx) => {
  const eventName = readEventName(actionConfig.actionParams);
  if (eventName) {
    return eventName;
  }

  ctx.errorReporter.reportSduiError(
    SduiErrorName.MalformedActionParam,
    "CUSTOM_ANALYTICS_EVENT missing required eventName action param",
    ctx.pageContext,
    {
      actionType: actionTypeName(actionConfig.actionType),
      propName: "eventName",
    },
  );
  return undefined;
};
