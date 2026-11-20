// Inline script and shared names for catching Buy Robux purchase taps that land before React has
// hydrated the control. React never replays a button `onClick` that arrives before its fiber
// commits (it drops it), so the server HTML ships this script, which swallows the tap, shows a
// spinner and remembers it. `useEarlyClickReplay` re-fires it once the container has committed.
//
// The script body is `installEarlyClickCapture` in captureScript.ts, so the type checker sees it.
// This module stringifies that function and inlines the names below as its argument. It never
// calls the function: apps/www renders the string on the server, before any browser global exists.
// The same script sends a leave beacon for a held tap that exits before React reports it. The
// page container carries the flow id, trigger context, and ecsv2 URL it needs (`beacon.ts`).
//
// Containers opt in with `data-early-click="<key>"` (see `getEarlyClickRowProps`). The marker sits
// on an element robuxRedesign renders, never on the control itself, because some controls come
// from other packages (e.g. `SubscriptionButton`) and cannot carry our attributes.

import {
  EVENT_NAME,
  PURCHASE_EVENT_TYPE,
  VIEW_NAME,
} from "@rbx/payments/payments-flow-analytics/constants";
import { installEarlyClickCapture, type EarlyClickCaptureConfig } from "./captureScript";

export const EARLY_CLICK_STATE_KEY = "robuxEarlyClick" as const;
/** Taps the script gave up on (EARLY_CLICK_TIMEOUT_MS) before React took over; see `takeExpiredEarlyClicks`. */
export const EARLY_CLICK_EXPIRED_KEY = "robuxEarlyClickExpired" as const;
/**
 * Taps the script discarded because the user moved on (another row, or a control that is already
 * usable). See `takeDiscardedEarlyClicks`.
 */
export const EARLY_CLICK_DISCARDED_KEY = "robuxEarlyClickDiscarded" as const;
/**
 * Fired on `window` when the script starts holding a tap or gives up on one, so React (once it is
 * running) can report it without polling. See `useEarlyClickMonitor`.
 */
export const EARLY_CLICK_EVENT = "robuxearlyclick" as const;
export const EARLY_CLICK_ROW_ATTR = "data-early-click" as const;
export const EARLY_CLICK_ROW_SELECTOR = "[data-early-click]" as const;
/** The control inside a marked container that a user taps. Containers must hold exactly one. */
export const EARLY_CLICK_CTA_SELECTOR = "button, a";
/** Set on a container by React once it has committed; the script stops intercepting taps there. */
export const EARLY_CLICK_HYDRATED_ATTR = "data-hydrated" as const;
/** Set on the tapped container by the script; the stylesheet draws a spinner on its control. */
export const EARLY_CLICK_PENDING_ATTR = "data-pending" as const;
/**
 * Gives up if hydration takes longer than this. The row is then marked so later taps pass through
 * to whatever the control does on its own, instead of being held again.
 */
export const EARLY_CLICK_TIMEOUT_MS = 60000;
/** Top-of-page line shown until hydration commits (rendered and removed by HydrationBar). */
export const EARLY_CLICK_HYDRATION_BAR_ID = "robux-hydration-bar" as const;
/**
 * On the page container when there is a purchase flow. The inline script reads them if a held tap
 * leaves before React reports it. See `getEarlyClickBeaconProps`.
 */
export const EARLY_CLICK_BEACON_FLOW_ATTR = "data-early-click-flow" as const;
export const EARLY_CLICK_BEACON_CONTEXT_ATTR = "data-early-click-context" as const;
export const EARLY_CLICK_BEACON_ENDPOINT_ATTR = "data-early-click-endpoint" as const;
/** Set when React's monitor starts. The inline script then stops sending leave beacons. */
export const EARLY_CLICK_REACT_READY_KEY = "robuxEarlyClickReactReady" as const;
/** The inline script has already sent a leave beacon, `noTap` or for taps. */
export const EARLY_CLICK_NO_TAP_REPORTED_KEY = "robuxEarlyClickNoTapReported" as const;

const earlyClickCaptureConfig = {
  stateKey: EARLY_CLICK_STATE_KEY,
  expiredKey: EARLY_CLICK_EXPIRED_KEY,
  discardedKey: EARLY_CLICK_DISCARDED_KEY,
  eventName: EARLY_CLICK_EVENT,
  rowAttr: EARLY_CLICK_ROW_ATTR,
  rowSelector: EARLY_CLICK_ROW_SELECTOR,
  hydratedAttr: EARLY_CLICK_HYDRATED_ATTR,
  pendingAttr: EARLY_CLICK_PENDING_ATTR,
  timeoutMs: EARLY_CLICK_TIMEOUT_MS,
  beaconFlowAttr: EARLY_CLICK_BEACON_FLOW_ATTR,
  beaconContextAttr: EARLY_CLICK_BEACON_CONTEXT_ATTR,
  beaconEndpointAttr: EARLY_CLICK_BEACON_ENDPOINT_ATTR,
  beaconTarget: "www",
  beaconEventType: EVENT_NAME.USER_PURCHASE_FLOW,
  beaconViewName: VIEW_NAME.EARLY_CLICK,
  beaconPurchaseEventType: PURCHASE_EVENT_TYPE.USER_INPUT,
  beaconSource: "inlineScript",
  beaconWebStack: "nextjs",
  beaconRefUrlMaxLength: 200,
  reactReadyKey: EARLY_CLICK_REACT_READY_KEY,
  noTapReportedKey: EARLY_CLICK_NO_TAP_REPORTED_KEY,
} as const satisfies EarlyClickCaptureConfig;

// Parentheses make the function expression callable. The argument is the names above, so the
// string that reaches the page has no reference back to this module.
export const EARLY_CLICK_CAPTURE_SCRIPT = `(${installEarlyClickCapture.toString()})(${JSON.stringify(earlyClickCaptureConfig)});`;
