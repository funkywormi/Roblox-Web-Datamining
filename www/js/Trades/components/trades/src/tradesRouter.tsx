import { createContext, useContext } from "react";

// Client-side routing for the trades SPA. Mirrors the three Angular ui-router
// states (trades-list, trade-with-user, counter-trade) so React can own the
// whole feature and navigate between the list and the trade-request builder
// without a server round-trip (see tradesModule.js for the original states).

export type TradesView = "list" | "create" | "counter";

export type TradesRoute = {
  view: TradesView;
  /** Trade partner user id for the create ("trade with user") view. */
  userId?: number;
  /** Existing trade id for the counter view. */
  tradeId?: number;
  /** Selected status tab for the list view (persisted in the URL query). */
  tab?: string;
};

// Everything before `/trades` or `/users/...` is treated as an optional locale
// prefix (e.g. `/en`), matching the `${prefix}` handling in tradesModule.js.
const LOCALE_PREFIX_RE = /\/(?:trades|users)(?:\/.*)?$/;

export const getLocalePrefix = (pathname: string = window.location.pathname): string =>
  pathname.replace(LOCALE_PREFIX_RE, "");

/**
 * Parse the current location into a trades route, or null if the path is not a
 * recognized trades-app route (in which case the bundle should defer to Angular).
 */
export const parseTradesRoute = (
  pathname: string = window.location.pathname,
  search: string = window.location.search,
): TradesRoute | null => {
  // Counter is an in-app view reached from the list. A cold load of this URL
  // 404s (the server doesn't serve the trades bundle here), and there's nothing
  // the client can do without JS on the page, so we don't try to work around it.
  const counter = /\/trades\/(\d+)\/counter\/?$/.exec(pathname);
  if (counter) {
    return { view: "counter", tradeId: parseInt(counter[1]!, 10) };
  }

  const create = /\/users\/(\d+)\/trade\/?$/.exec(pathname);
  if (create) {
    return { view: "create", userId: parseInt(create[1]!, 10) };
  }

  if (/\/trades\/?$/.test(pathname)) {
    const tab = new URLSearchParams(search).get("tab") || undefined;
    return { view: "list", tab };
  }

  return null;
};

/** Build the URL path for a route, preserving any locale prefix. */
export const buildTradesPath = (route: TradesRoute, prefix: string = getLocalePrefix()): string => {
  switch (route.view) {
    case "counter":
      return `${prefix}/trades/${route.tradeId ?? ""}/counter`;
    case "create":
      return `${prefix}/users/${route.userId ?? ""}/trade`;
    case "list":
    default:
      return `${prefix}/trades${route.tab ? `?tab=${encodeURIComponent(route.tab)}` : ""}`;
  }
};

type TradesRouterValue = {
  route: TradesRoute;
  navigate: (route: TradesRoute) => void;
};

const TradesRouterContext = createContext<TradesRouterValue | null>(null);

export const TradesRouterProvider = TradesRouterContext.Provider;

export const useTradesRouter = (): TradesRouterValue => {
  const value = useContext(TradesRouterContext);
  if (!value) {
    throw new Error("useTradesRouter must be used within a TradesRouterProvider");
  }
  return value;
};
