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
