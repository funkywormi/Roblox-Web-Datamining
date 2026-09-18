// NOTE: THIS FILE CAN BE SAFELY DELETED ONCE ERRORS ARE FULLY OFFBOARDED FROM SENTRY CLOUD

import {
  makeBrowserOfflineTransport,
  makeFetchTransport,
  makeMultiplexedTransport,
} from "@sentry/browser";

// Options the browser offline transport receives; includes the ingest `url` and the
// IndexedDB store keys (`storeName`/`dbName`). Derived from the SDK so it stays in sync.
type OfflineTransportOptions = Parameters<ReturnType<typeof makeBrowserOfflineTransport>>[0];

type DsnMatcher = NonNullable<Parameters<typeof makeMultiplexedTransport>[1]>;

/**
 * Routes every envelope to the primary (Sentry Cloud) DSN, and additionally routes
 * error/message envelopes to the self-hosted DSN. Only errors get matched by
 * `getEvent(["event"])`. The primary DSN is returned explicitly because the init `dsn`
 * is only consulted as a fallback when the matcher returns nothing.
 */
export function buildDsnMatcher(primaryDsn: string, selfHostedDsn: string): DsnMatcher {
  return param => {
    const routes = [primaryDsn];
    if (param.getEvent(["event"])) {
      routes.push(selfHostedDsn);
    }
    return routes;
  };
}

/**
 * Builds the Sentry transport. It dual-writes via a multiplexed transport.
 * https://docs.sentry.io/platforms/javascript/best-practices/micro-frontends/
 *
 * `makeBrowserOfflineTransport uses IndexedDB's to store offline traces. We need
 * separate dbs for the two dsn's so that they don't pop from a shared queue and send
 * duplicate errors to one dsn
 */
export function buildTransport(primaryDsn: string, selfHostedDsn: string) {
  const createPerDsnOfflineTransport = (options: OfflineTransportOptions) =>
    makeBrowserOfflineTransport(makeFetchTransport)({
      ...options,
      dbName: `sentry-offline:${options.url}`,
    });

  return makeMultiplexedTransport(
    createPerDsnOfflineTransport,
    buildDsnMatcher(primaryDsn, selfHostedDsn),
  );
}
