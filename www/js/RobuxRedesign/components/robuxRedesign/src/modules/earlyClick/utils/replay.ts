import type { KeyboardEvent } from "react";
import { navigator, window } from "@rbx/core-lib/browser";
import { isNextJs } from "../../../utils/isNextJs";
import type { EarlyClickWaitingFor } from "./telemetry";
import {
  EARLY_CLICK_CTA_SELECTOR,
  EARLY_CLICK_HYDRATED_ATTR,
  EARLY_CLICK_PENDING_ATTR,
  EARLY_CLICK_ROW_ATTR,
  EARLY_CLICK_STATE_KEY,
} from "./capture";

export type EarlyClickState = {
  key: string;
  startedAt: number;
  taps: number;
  timer: number;
  /** Set by React once it has reported that this tap is being held (see reporting.ts). */
  isHeldReported?: boolean;
  /** Set by React once it has reported how this tap ended; the script then skips its expiry note. */
  isOutcomeReported?: boolean;
  /**
   * What the tap was waiting for when React first reported it. Later reports use this instead of
   * looking the row up again, because the row may have unmounted.
   */
  waitingFor?: EarlyClickWaitingFor;
};

/** A tap the capture script gave up on after EARLY_CLICK_TIMEOUT_MS, before React resolved it. */
export type ExpiredEarlyClick = {
  key: string;
  taps: number;
  waitMs: number;
  /** Whether React had already reported the tap as held before the script gave up on it. */
  isHeldReported?: boolean;
  /** Copied from the held state, so the outcome uses the same wait reason as `held`. */
  waitingFor?: EarlyClickWaitingFor;
};

/** A tap the script discarded because the user moved on, before React resolved it. */
export type DiscardedEarlyClick = {
  key: string;
  taps: number;
  waitMs: number;
  /** Whether React had already reported the tap as held before the script discarded it. */
  isHeldReported?: boolean;
  /** Copied from the held state, so the outcome uses the same wait reason as `held`. */
  waitingFor?: EarlyClickWaitingFor;
  /** `dropped`: the user tapped something this script will not hold. `replaced`: they tapped another row. */
  reason: "dropped" | "replaced";
};

declare global {
  interface Window {
    // Written by EARLY_CLICK_CAPTURE_SCRIPT; keep the names in sync with EARLY_CLICK_STATE_KEY,
    // EARLY_CLICK_EXPIRED_KEY and EARLY_CLICK_DISCARDED_KEY.
    robuxEarlyClick?: EarlyClickState;
    robuxEarlyClickExpired?: ExpiredEarlyClick[];
    robuxEarlyClickDiscarded?: DiscardedEarlyClick[];
    /** Set by `useEarlyClickMonitor` once React is reporting taps. */
    robuxEarlyClickReactReady?: boolean;
    /** Set by the inline script once it has sent a leave with no tap. */
    robuxEarlyClickNoTapReported?: boolean;
  }
}

/** How long ago the script caught the tap that `state` holds. */
export const getEarlyClickWaitMs = (state: EarlyClickState): number =>
  Math.max(0, (window?.performance.now() ?? state.startedAt) - state.startedAt);

/**
 * Taps the script discarded on its own timeout, which only React can report. Returns them and
 * clears the list, so it is safe to call from several places or twice (StrictMode).
 */
export const takeExpiredEarlyClicks = (): ExpiredEarlyClick[] => {
  const expired = window?.robuxEarlyClickExpired ?? [];
  delete window?.robuxEarlyClickExpired;
  return expired;
};

/** Taps the script discarded because the user moved on. Clears the list, so it is safe to call twice. */
export const takeDiscardedEarlyClicks = (): DiscardedEarlyClick[] => {
  const discarded = window?.robuxEarlyClickDiscarded ?? [];
  delete window?.robuxEarlyClickDiscarded;
  return discarded;
};

/**
 * `scope` keeps the same product in two sections (the main list and a bonus section) from sharing
 * one held tap. The `|scope` suffix is stripped by `parseEarlyClickKey`, so product ids may contain
 * colons but not `|`.
 */
export const robuxProductEarlyClickKey = (productId: string, scope?: string): string =>
  scope ? `product:${productId}|${scope}` : `product:${productId}`;

/**
 * Whether a section that can redirect renders its redirect controls. On Next.js that is as soon as
 * redirect is enabled (`redirect` exists), even while its URL is still being fetched, because the
 * row holds the tap until the URL exists. On .NET it is the original rule: only once the URL exists.
 */
export const isEarlyClickRedirectSection = (
  isRedirect: boolean | undefined,
  redirect: { url: string } | undefined,
): boolean => Boolean(isRedirect) && (isNextJs() ? redirect !== undefined : Boolean(redirect?.url));

/**
 * Href for a redirect control. On Next.js there is none until the auth URL exists, so an early tap
 * cannot open a half-built URL. The .NET page keeps `href`, including when it is empty.
 */
export const earlyClickRedirectHref = (href: string, hasUrl: boolean): string | undefined =>
  hasUrl || !isNextJs() ? href : undefined;

/**
 * An `<a>` with no href is not in the tab order and Enter does not activate it. Redirect rows have
 * no href until the auth-ticket URL exists, so this keeps that control reachable from the keyboard.
 */
export const earlyClickHrefLessLinkProps = {
  tabIndex: 0,
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    event.currentTarget.click();
  },
} as const;
export const subscriptionEarlyClickKey = (productId: string): string => `subscription:${productId}`;

/**
 * Spread onto the container that holds a purchase control. It marks the container for the capture
 * script, and while that script is holding a tap for this key it renders the same `data-pending`
 * and `aria-busy` the script already set on the DOM, so hydration sees no mismatch.
 */
export const getEarlyClickRowProps = (key: string) => {
  const isPending = window?.robuxEarlyClick?.key === key;
  return {
    [EARLY_CLICK_ROW_ATTR]: key,
    [EARLY_CLICK_PENDING_ATTR]: isPending ? "" : undefined,
    "aria-busy": isPending ? true : undefined,
  } as const;
};

const takePendingEarlyClick = (key: string): EarlyClickState | undefined => {
  const state = window?.robuxEarlyClick;
  if (state?.key !== key) {
    return undefined;
  }
  window?.clearTimeout(state.timer);
  delete window?.[EARLY_CLICK_STATE_KEY];
  return state;
};

/** How long a redirect row keeps holding taps for its auth ticket before it lets taps through. */
export const EARLY_CLICK_REDIRECT_URL_TIMEOUT_MS = 10000;

const clearPendingMarkers = (row: HTMLElement): void => {
  row.removeAttribute(EARLY_CLICK_PENDING_ATTR);
  row.removeAttribute("aria-busy");
};

export type ReplayEarlyClickOptions = {
  onReplay?: (state: EarlyClickState) => void;
  /** Called instead of `onReplay` when `requiresUserActivation` finds the activation gone. */
  onActivationLost?: (state: EarlyClickState) => void;
  /**
   * For controls that open a new tab (`target="_blank"`). A click replayed after the browser's
   * transient user activation has lapsed is blocked as a popup, so when the activation is gone the
   * spinner is dropped and the user taps again instead. Browsers without
   * `navigator.userActivation` get the replay anyway.
   */
  requiresUserActivation?: boolean;
};

/**
 * Call after the container has committed and the control can do its job. Marks it hydrated (so the
 * capture script lets later taps through) and, if the script swallowed a tap on this key, re-fires
 * it as a normal click that React can now handle.
 */
export const replayEarlyClick = (
  row: HTMLElement,
  key: string,
  { onReplay, onActivationLost, requiresUserActivation = false }: ReplayEarlyClickOptions = {},
): void => {
  const held = window?.robuxEarlyClick;
  if (held?.key !== key) {
    row.setAttribute(EARLY_CLICK_HYDRATED_ATTR, "");
    return;
  }
  // Leave the script's timeout in place until this click actually runs. If the row is gone by
  // then, the timeout is still the thing that gives up on the tap. Marking the row hydrated now
  // would let a tap in this gap through, and that tap plus the replay would start two purchases.
  // Not cancelled on effect cleanup: StrictMode re-runs this effect, and the second run finds the
  // tap already taken.
  window?.setTimeout(() => {
    // The row may have been remounted (the redirect URL arriving rebuilds it) before this runs.
    // Leave the tap, and its timeout, for the row that is still on the page.
    if (!row.isConnected) {
      return;
    }
    // Look the control up now. A subscription tile can swap its button for another between the
    // effect and this timeout; clicking the one captured earlier would hit a detached node.
    const cta = row.querySelector<HTMLElement>(EARLY_CLICK_CTA_SELECTOR);
    if (!cta?.isConnected) {
      return;
    }
    row.setAttribute(EARLY_CLICK_HYDRATED_ATTR, "");
    const state = takePendingEarlyClick(key);
    if (!state) {
      return;
    }
    clearPendingMarkers(row);
    // Older browsers lack `userActivation`, though the DOM typings declare it always present.
    const userActivation = (navigator as { userActivation?: { isActive: boolean } } | undefined)
      ?.userActivation;
    const isActivationLost = requiresUserActivation && userActivation?.isActive === false;
    if (isActivationLost) {
      onActivationLost?.(state);
      return;
    }
    cta.click();
    onReplay?.(state);
  }, 0);
};

/**
 * Stops holding taps on this container without replaying one: marks it hydrated and drops any
 * pending tap and spinner. Used when what the tap was waiting for is not coming. Returns the tap
 * that was being held, if any: when there is one, the user is looking at a spinner that just
 * vanished.
 */
export const releaseEarlyClick = (row: HTMLElement, key: string): EarlyClickState | undefined => {
  row.setAttribute(EARLY_CLICK_HYDRATED_ATTR, "");
  const droppedTap = takePendingEarlyClick(key);
  clearPendingMarkers(row);
  return droppedTap;
};
