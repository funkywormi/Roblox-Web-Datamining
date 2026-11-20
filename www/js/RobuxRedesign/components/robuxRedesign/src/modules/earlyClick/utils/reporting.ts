import {
  type EarlyClickState,
  getEarlyClickWaitMs,
  takeDiscardedEarlyClicks,
  takeExpiredEarlyClicks,
} from "./replay";
import {
  type EarlyClickOutcome,
  type EarlyClickStep,
  type EarlyClickWaitingFor,
  parseEarlyClickKey,
} from "./telemetry";
import type { EarlyClickTracking } from "../hooks/useEarlyClickTracking";

export type TrackEarlyClick = EarlyClickTracking["trackEarlyClick"];

/** Keys of mounted rows whose control is a redirect link, so any reporter knows what a tap waits on. */
const redirectRowKeys = new Set<string>();

export const registerEarlyClickRow = (key: string, isRedirect: boolean): (() => void) => {
  if (!isRedirect) {
    return () => undefined;
  }
  redirectRowKeys.add(key);
  return () => {
    redirectRowKeys.delete(key);
  };
};

const getWaitingFor = (key: string): EarlyClickWaitingFor =>
  redirectRowKeys.has(key) ? "redirectUrl" : "hydration";

const send = (
  trackEarlyClick: TrackEarlyClick,
  step: EarlyClickStep,
  key: string,
  waitMs: number,
  taps: number,
  waitingFor?: EarlyClickWaitingFor,
) => {
  trackEarlyClick({
    outcome: step,
    ...parseEarlyClickKey(key),
    waitingFor: waitingFor ?? getWaitingFor(key),
    waitMs,
    taps,
  });
};

/** Reports that `state` is being held, once per tap however many places see it. */
export const reportEarlyClickHeld = (trackEarlyClick: TrackEarlyClick, state: EarlyClickState) => {
  if (state.isHeldReported) {
    return;
  }
  // The flags live on the shared state object, which the capture script copies into its notes.
  const waitingFor = getWaitingFor(state.key);
  Object.assign(state, { isHeldReported: true, waitingFor });
  send(trackEarlyClick, "held", state.key, getEarlyClickWaitMs(state), state.taps, waitingFor);
};

/**
 * Reports how `state` ended, once per tap: the first outcome wins, so a tap reported as abandoned
 * when the page was hidden is not counted again if the user comes back and it then replays.
 */
export const reportEarlyClickOutcome = (
  trackEarlyClick: TrackEarlyClick,
  outcome: EarlyClickOutcome,
  state: EarlyClickState,
) => {
  if (state.isOutcomeReported) {
    return;
  }
  reportEarlyClickHeld(trackEarlyClick, state);
  Object.assign(state, { isOutcomeReported: true });
  send(
    trackEarlyClick,
    outcome,
    state.key,
    getEarlyClickWaitMs(state),
    state.taps,
    state.waitingFor,
  );
};

/** Reports the taps the capture script gave up on, adding `held` for any React never saw. */
export const reportExpiredEarlyClicks = (trackEarlyClick: TrackEarlyClick) => {
  takeExpiredEarlyClicks().forEach(({ key, taps, waitMs, isHeldReported, waitingFor }) => {
    if (!isHeldReported) {
      send(trackEarlyClick, "held", key, waitMs, taps, waitingFor);
    }
    send(trackEarlyClick, "expired", key, waitMs, taps, waitingFor);
  });
};

/**
 * Reports taps the script discarded because the user moved on, adding `held` for any React never
 * saw. Without this, those taps stay in the `held` bucket that is read as "the page died".
 */
export const reportDiscardedEarlyClicks = (trackEarlyClick: TrackEarlyClick) => {
  takeDiscardedEarlyClicks().forEach(
    ({ key, taps, waitMs, isHeldReported, reason, waitingFor }) => {
      if (!isHeldReported) {
        send(trackEarlyClick, "held", key, waitMs, taps, waitingFor);
      }
      send(trackEarlyClick, reason, key, waitMs, taps, waitingFor);
    },
  );
};
