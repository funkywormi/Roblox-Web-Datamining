import type React from "react";

/**
 * Mirrors react-router's `<Link>`: returns true only for clicks the browser
 * would handle as a plain in-page navigation. Modified clicks
 * (cmd/ctrl/shift/alt), non-primary buttons, and already-defaulted events are
 * left to the browser (e.g. open-in-new-tab) so callers can decide whether to
 * intercept for client-side routing.
 */
export const isPlainLeftClick = (event: React.MouseEvent): boolean =>
  !event.defaultPrevented &&
  event.button === 0 &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.shiftKey &&
  !event.altKey;

/** Returns `url` if it parses as an absolute http(s) URL, otherwise undefined. */
export function resolveValidHttpUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const { protocol } = new URL(url);
    return protocol === "https:" || protocol === "http:" ? url : undefined;
  } catch {
    return undefined;
  }
}
