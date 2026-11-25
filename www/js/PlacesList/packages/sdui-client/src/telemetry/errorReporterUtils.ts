import { sendEvent } from "@rbx/core-scripts/event-stream";
import { captureException } from "@rbx/core-scripts/sentry";
import type { SduiPageContext } from "@rbx/sdui-core";
import { parseEventParams } from "@rbx/unified-logging";
import { fireEvent } from "@rbx/www-common/event-tracker";

import type { CaptureErrorInput, CaptureErrorInSentryInput } from "./types";

export function getErrorPageContext(pageContext?: SduiPageContext): string {
  return pageContext?.appPage ?? "unknown";
}

/**
 * Decides whether a channel should fire for the given per-channel sample rate.
 * An unset rate (or any rate `>= 1`) always fires; `0` never fires; otherwise a
 * fresh random draw must fall under the rate.
 */
export function shouldFireChannel(rate: number | undefined): boolean {
  if (rate === undefined || rate >= 1) {
    return true;
  }
  if (rate <= 0) {
    return false;
  }
  return Math.random() < rate;
}

/**
 * Fires the real-time error counter keyed by error name. Works on .NET and
 * Next.js; never throws.
 */
export function fireErrorCounter(errorName: string): void {
  fireEvent(errorName);
}

/**
 * Emits the error to the eventstream table. Kept separate from the counter so
 * the two channels can be sampled independently.
 */
export function sendErrorEvent({
  eventName,
  errorName,
  errorMessage,
  errorContext,
}: CaptureErrorInput): void {
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
  const error = new Error(errorMessage);
  error.name = errorName;

  captureException(error, {
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
