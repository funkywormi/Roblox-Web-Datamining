import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";
import { TradeDetail, TradeOffer, TradeSummary } from "../types";

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
  // errorMessage / errorCode / errorName are packed into metadata.
  error: "tradeError",
} as const;

type EventProperties = Record<string, unknown>;

/** Legacy EventStream event (unchanged pipeline). */
export const sendEvent = (
  eventName: string,
  context: string,
  properties: EventProperties = {},
): void => {
  sendEventWithTarget(eventName, context, {
    ...properties,
    pg: currentPage,
    framework,
  });
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
      metaData: JSON.stringify({ context, ...properties, pg: currentPage, framework }),
    },
  });
};

/** Errors reach us as Error instances, raw strings, or API error payloads. */
type TradeError =
  | Error
  | string
  | {
      errors?: { code?: number; message?: string }[];
      message?: string;
      code?: number;
      name?: string;
    }
  | null
  | undefined;

/**
 * Normalizes the different error shapes seen in this app into a flat set of
 * metadata fields.
 */
const normalizeError = (error: TradeError): EventProperties => {
  if (!error) {
    return {};
  }
  if (typeof error === "string") {
    return { errorMessage: error };
  }
  if ("errors" in error && Array.isArray(error.errors) && error.errors.length > 0) {
    const first = error.errors[0]!;
    return { errorCode: first.code, errorMessage: first.message };
  }
  return {
    errorName: error.name,
    errorMessage: error.message,
    errorCode: (error as { code?: number }).code,
  };
};

/**
 * Logs an error to AX Analytics so failures can be tracked (and compared across
 * the Angular vs React versions) during the migration. `context` identifies
 * where the error occurred; `error` accepts an Error, a string, or an API error
 * payload. Reuses sendAXEvent so the framework + pg tags are attached
 * automatically.
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
