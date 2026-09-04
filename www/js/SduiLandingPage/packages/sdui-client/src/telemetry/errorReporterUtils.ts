import { sendEvent } from "@rbx/core-scripts/event-stream";
import type { SduiPageContext } from "@rbx/sdui-core";
import { parseEventParams } from "@rbx/unified-logging";

import type { CaptureErrorInput, CaptureErrorInSentryInput } from "./types";

export function getErrorPageContext(pageContext?: SduiPageContext): string {
  return pageContext?.appPage ?? "unknown";
}

/**
 * Fires the real-time error counter keyed by error name. No-op when the host
 * `EventTracker` isn't present.
 */
export function fireErrorCounter(errorName: string): void {
  if (typeof window !== "undefined" && window.EventTracker) {
    window.EventTracker.fireEvent(errorName);
  }
}

export function captureError({
  eventName,
  errorName,
  errorMessage,
  errorContext,
}: CaptureErrorInput): void {
  fireErrorCounter(errorName);

  const params = { errorName, errorMessage };
  sendEvent(
    {
      name: eventName,
      type: eventName,
      context: errorContext,
    },
    parseEventParams(params),
  );
}

/**
 * Forwards an error to Sentry as a captured exception.
 * No-op when Sentry isn't loaded on the page.
 */
export function captureErrorInSentry({
  applicationName,
  errorNameTagKey,
  errorName,
  errorMessage,
  appPage,
  additionalTags,
  additionalContext,
  additionalFingerprint,
}: CaptureErrorInSentryInput): void {
  if (typeof window !== "undefined" && window.Sentry) {
    const error = new Error(errorMessage);
    error.name = errorName;

    window.Sentry.captureException(error, {
      tags: {
        [errorNameTagKey]: errorName,
        appPage,
        ...additionalTags,
      },
      extra: {
        errorMessage,
        ...additionalContext,
      },
      fingerprint: [applicationName, errorName, ...(additionalFingerprint ?? [])],
    });
  }
}
