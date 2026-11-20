import { useCallback, useContext, useEffect, useRef } from "react";
import { ModalContext } from "../../../contexts/ModalContext";
import { TrackingContext } from "../../../contexts/TrackingContext";
import { isNextJs } from "../../../utils/isNextJs";
import { type EarlyClickState, getEarlyClickRowProps } from "../utils/replay";
import type { EarlyClickOutcome } from "../utils/telemetry";
import { registerEarlyClickRow, reportEarlyClickOutcome } from "../utils/reporting";
import { useEarlyClickGiveUp } from "./useEarlyClickGiveUp";
import { useEarlyClickReplay } from "./useEarlyClickReplay";

type EarlyClickRowBaseOptions = {
  /** False leaves the container unmarked: the capture script ignores it and nothing is replayed. */
  isEnabled?: boolean;
  /**
   * The control opens a new tab (`target="_blank"`), so a held tap is replayed only while the
   * browser still counts it as a user gesture (see `requiresUserActivation`).
   */
  isRedirect?: boolean;
  /**
   * The control cannot act yet (a redirect link still waiting for its auth ticket). Taps stay held
   * until this flips to false; after EARLY_CLICK_REDIRECT_URL_TIMEOUT_MS the row gives up and, if a
   * tap was held, tells the user to try again.
   */
  isAwaitingUrl?: boolean;
  onReplay?: (state: EarlyClickState) => void;
};

/**
 * Wires a purchase container into early-click capture (utils/capture.ts): spread the
 * result onto the element that contains the control. It carries the ref and the marker and
 * pending attributes, and the hooks behind it replay or give up on a tap the inline script held.
 * Held taps are reported as an observability counter and a purchase-flow event: `held`, then how
 * this row ended them (replayed, activation lost, gave up). Taps no row resolves are reported by
 * `useEarlyClickMonitor`. Components use `useEarlyClickRow` or `useEarlyClickRedirectRow`, which
 * pick the options here so a redirect row cannot be wired without its href and tab-stop handling.
 */
export const useEarlyClickRowBase = (
  key: string,
  {
    isEnabled: isEnabledOption = true,
    isRedirect = false,
    isAwaitingUrl = false,
    onReplay,
  }: EarlyClickRowBaseOptions = {},
) => {
  // The hold is a Next.js feature. On the .NET page the row is left unmarked, so nothing here
  // changes what a tap does.
  const isEnabled = isEnabledOption && isNextJs();
  const ref = useRef<HTMLDivElement>(null);
  const { trackEarlyClick } = useContext(TrackingContext);

  useEffect(
    () => registerEarlyClickRow(key, isEnabled && isRedirect),
    [key, isEnabled, isRedirect],
  );

  const report = useCallback(
    (outcome: EarlyClickOutcome, state: EarlyClickState) => {
      reportEarlyClickOutcome(trackEarlyClick, outcome, state);
    },
    [trackEarlyClick],
  );

  const handleReplay = useCallback(
    (state: EarlyClickState) => {
      report("replayed", state);
      onReplay?.(state);
    },
    [report, onReplay],
  );
  const handleActivationLost = useCallback(
    (state: EarlyClickState) => {
      report("activationLost", state);
    },
    [report],
  );
  useEarlyClickReplay(ref, key, {
    enabled: isEnabled && !isAwaitingUrl,
    requiresUserActivation: isRedirect,
    onReplay: handleReplay,
    onActivationLost: handleActivationLost,
  });

  // Same dialog a hydrated tap gets when the redirect URL is empty. The context default is a no-op
  // outside a provider.
  const {
    redirectError: { openModal: openRedirectErrorModal },
  } = useContext(ModalContext);
  const handleGiveUp = useCallback(
    (state: EarlyClickState) => {
      report("gaveUp", state);
      openRedirectErrorModal();
    },
    [report, openRedirectErrorModal],
  );
  useEarlyClickGiveUp(ref, key, { enabled: isEnabled && isAwaitingUrl, onGiveUp: handleGiveUp });

  return { ref, ...(isEnabled ? getEarlyClickRowProps(key) : {}) };
};

export type UseEarlyClickRowOptions = Pick<EarlyClickRowBaseOptions, "isEnabled">;

/**
 * For a control that can act as soon as it hydrates: a button, or a link whose href is in the
 * server HTML. A redirect link that waits for its auth URL uses `useEarlyClickRedirectRow`.
 */
export const useEarlyClickRow = (key: string, { isEnabled }: UseEarlyClickRowOptions = {}) =>
  useEarlyClickRowBase(key, { isEnabled });
