import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";
import { isBlackbirdUser } from "@rbx/core-scripts/meta/user";
import { TradeDetail, TradeOffer, TradeSummary } from "../types";
import { isCappedByFreeTrades } from "../utils/tradesUtils";
import { getCachedCanTrade } from "./tradesApi";

// TypeScript port of js/angular/trades/services/tradeEventsService.js. Keeps the
// exact event names so funnel/engagement analytics stay continuous across the
// Angular -> React migration.

const currentPage = "v2";

// Identifies which frontend implementation emitted the event so analytics can
// distinguish the Angular version from the React version during the migration.
const framework = "react";

export const tradeEvents = {
  tradesList: "tradesListInteraction",
  tradeRequest: "tradeRequestInteractionV2",
  tradeRequestSent: "tradeRequestSent",
  pageView: "tradePageView",
  tradeInitiated: "tradeInitiated",
  tradeCompleted: "tradeCompleted",
  tradeDeclined: "tradeDeclined",
  tradeCanceled: "tradeCanceled",
  tradeCountered: "tradeCountered",
  tradeViewed: "tradeViewed",
  firstVisit: "tradeCenterFirstVisit",
  filterClick: "tradeFilterClick",
  howToTradeClick: "tradeHowToTradeClick",
  bannerDismiss: "tradeBannerDismiss",
  profileClick: "tradeProfileClick",
  // Client-side errors/failures. `context` identifies the call site;
  // errorStatus / errorCode / errorMessage / errorName / errorUrl /
  // errorMethod / error are packed into metadata (`error` is a JSON string
  // of the safe payload).
  error: "tradeError",
} as const;

type EventProperties = Record<string, string | number | boolean | null | undefined>;

/**
 * Whether the viewer is on the free-trade allowance rather than unlimited
 * (Plus) trades. Unknown quota is treated as not using free trades so early
 * events still emit a boolean.
 */
const getIsUsingFreeTrades = (): boolean =>
  isCappedByFreeTrades(getCachedCanTrade()?.freeTradesAllowance) && !isBlackbirdUser();

const withEventMetadata = (properties: EventProperties): EventProperties => ({
  ...properties,
  pg: currentPage,
  framework,
  isUsingFreeTrades: getIsUsingFreeTrades(),
});

/** Legacy EventStream event (unchanged pipeline). */
export const sendEvent = (
  eventName: string,
  context: string,
  properties: EventProperties = {},
): void => {
  sendEventWithTarget(eventName, context, withEventMetadata(properties));
};

/** New funnel/engagement event routed through the AX Analytics service. */
export const sendAXEvent = (
  eventName: string,
  context: string,
  properties: EventProperties = {},
): void => {
  const axService = Roblox.AXAnalyticsService;
  const actionTypes = Roblox.AXSendTrackingActionType;

  if (!axService || typeof axService.sendAXTracking !== "function") {
    return;
  }

  const isView =
    eventName === tradeEvents.pageView ||
    eventName === tradeEvents.firstVisit ||
    eventName === tradeEvents.tradeViewed;
  const actionType = isView ? actionTypes?.View : actionTypes?.Click;

  axService.sendAXTracking({
    itemName: eventName,
    actionType,
    metaData: {
      metaData: JSON.stringify({ context, ...withEventMetadata(properties) }),
    },
  });
};

/**
 * Errors reach us as Error instances, raw strings, API `{ errors }` payloads,
 * or (most commonly) the Axios *response* the core-scripts interceptor
 * rejects with — `{ status, data, ... }` rather than a thrown Error.
 */
type TradeError = unknown;

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === "object" ? (value as Record<string, unknown>) : null;

type ApiErrorItem = { code?: number; message?: string };

const readErrorsArray = (value: unknown): ApiErrorItem[] | undefined => {
  const record = asRecord(value);
  if (!record || !Array.isArray(record.errors) || record.errors.length === 0) {
    return undefined;
  }
  return record.errors as ApiErrorItem[];
};

const stringifyUnknown = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  try {
    const serialized = JSON.stringify(value);
    if (typeof serialized === "string") {
      return serialized;
    }
    return "unserializable error";
  } catch {
    return "unserializable error";
  }
};

const serializeErrorPayload = (value: unknown): string | undefined => {
  if (value === undefined) {
    return undefined;
  }
  return stringifyUnknown(value);
};

const readString = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;

/** Request URL/method only — never headers, which can include CSRF tokens. */
const readRequestLocation = (
  ...sources: (Record<string, unknown> | null)[]
): { url?: string; method?: string } => {
  for (const source of sources) {
    const config = asRecord(source?.config) ?? source;
    if (!config) {
      continue;
    }
    const url = readString(config.url);
    const baseUrl = readString(config.baseURL);
    const resolvedUrl =
      url && /^https?:\/\//i.test(url)
        ? url
        : baseUrl && url
          ? `${baseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`
          : (url ?? baseUrl);
    const method = readString(config.method);
    if (resolvedUrl || method) {
      return { url: resolvedUrl, method };
    }
  }
  return {};
};

/**
 * Flattens the rejection shapes seen in this app into AX metadata. HTTP
 * wrappers are unwrapped so a 429 (or any other status) still carries
 * `errorStatus`, the API URL, and the API body. Axios `headers` are omitted
 * so tokens do not land in analytics.
 */
const normalizeError = (error: TradeError): EventProperties => {
  if (error == null) {
    return {};
  }
  if (typeof error === "string") {
    return { errorMessage: error };
  }

  const record = asRecord(error);
  if (!record) {
    return { errorMessage: stringifyUnknown(error) };
  }

  const response = asRecord(record.response);
  const data = record.data ?? response?.data;
  const errors = readErrorsArray(record) ?? readErrorsArray(data);
  const first = errors?.[0];

  const errorStatus =
    (typeof record.status === "number" ? record.status : undefined) ??
    (typeof response?.status === "number" ? response.status : undefined);
  const statusText =
    (typeof record.statusText === "string" ? record.statusText : undefined) ??
    (typeof response?.statusText === "string" ? response.statusText : undefined);
  const errorName = typeof record.name === "string" ? record.name : undefined;
  const thrownMessage = typeof record.message === "string" ? record.message : undefined;
  const errorMessage = first?.message ?? thrownMessage ?? statusText;
  const errorCode = first?.code ?? (typeof record.code === "number" ? record.code : undefined);
  const thrownCode =
    typeof record.code === "number" || typeof record.code === "string" ? record.code : undefined;
  const { url: errorUrl, method: errorMethod } = readRequestLocation(record, response);

  return {
    errorStatus,
    errorCode,
    errorMessage,
    errorName,
    errorUrl,
    errorMethod,
    error: serializeErrorPayload({
      status: errorStatus,
      statusText,
      url: errorUrl,
      method: errorMethod,
      data: data ?? (errors ? { errors } : undefined),
      name: errorName,
      message: thrownMessage,
      code: thrownCode,
    }),
  };
};

/**
 * Logs an error to AX Analytics so failures can be tracked (and compared across
 * the Angular vs React versions) during the migration. `context` identifies
 * where the error occurred; `error` accepts an Error, a string, an API error
 * payload, or a rejected Axios response. Reuses sendAXEvent so the framework +
 * pg tags are attached automatically.
 */
export const sendAXError = (
  context: string,
  error: TradeError,
  properties: EventProperties = {},
): void => {
  sendAXEvent(tradeEvents.error, context, { ...properties, ...normalizeError(error) });
};

/**
 * Builds the trade value dimensions attached to funnel/engagement events.
 * Port of utils/tradesEventUtils.getTradeItemParameters. Offer index 1 is "you
 * give" (offered), index 0 is "you receive" (requested).
 */
export const getTradeItemParameters = (
  trade: TradeDetail | TradeSummary,
): Record<string, number> => {
  const offers = (trade as TradeDetail).offers as TradeOffer[] | undefined;
  if (!offers || offers.length < 2) {
    return {};
  }

  const sumItems = (offer: TradeOffer): number =>
    offer.items.reduce((total, item) => total + (Number(item.recentAveragePrice) || 0), 0);

  let valueOffered = Number(offers[1]!.robux) || 0;
  let valueRequested = Number(offers[0]!.robux) || 0;
  valueOffered += sumItems(offers[1]!);
  valueRequested += sumItems(offers[0]!);

  const params: Record<string, number> = {
    totalValueOffered: valueOffered,
    totalValueRequested: valueRequested,
    robuxOffered: Number(offers[1]!.robux) || 0,
    robuxRequested: Number(offers[0]!.robux) || 0,
  };

  [0, 1, 2, 3].forEach(index => {
    params[`itemValueOffered_${index + 1}`] =
      offers[1]!.items.length > index ? offers[1]!.items[index]!.recentAveragePrice || 0 : 0;
    params[`itemValueRequested_${index + 1}`] =
      offers[0]!.items.length > index ? offers[0]!.items[index]!.recentAveragePrice || 0 : 0;
  });

  return params;
};
