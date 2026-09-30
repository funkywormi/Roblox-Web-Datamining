import type { startSpan, getActiveSpan, flush, captureException } from "@sentry/browser";

/**
 * The Sentry surface `components/sentry` installs on the window.
 *
 * Signatures come from `@sentry/browser` rather than being written out, so this cannot drift from
 * what that component assigns.
 */
export type SentryGlobal = {
  startSpan: typeof startSpan;
  getActiveSpan: typeof getActiveSpan;
  flush: typeof flush;
  captureException: typeof captureException;
};

/**
 * Reading a global another pack installs is this module's job, so the cast lives here and callers
 * import a typed accessor instead of touching `window`.
 */
const getSentry = (): SentryGlobal | undefined =>
  typeof window === "undefined" ? undefined : (window as { Sentry?: SentryGlobal }).Sentry;

/** Whether the Sentry pack has run and installed its global yet. */
export const isSentryReady = (): boolean => getSentry() !== undefined;

/**
 * Logs an error and reports it to Sentry.
 *
 * `components/sentry` loads as its own pack, so the global may be absent when an early error fires.
 * The `console.error` happens either way, so nothing is lost silently.
 */
export const reportError = (error: unknown, context?: Record<string, unknown>): void => {
  console.error(error, context);

  getSentry()?.captureException(error, context ? { extra: context } : undefined);
};
