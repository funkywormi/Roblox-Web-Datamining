import { type RefObject, useEffect, useRef } from "react";
import { type ReplayEarlyClickOptions, replayEarlyClick } from "../utils/replay";

/**
 * Runs `replayEarlyClick` from an effect, which fires only after React has committed the
 * container. Pass `enabled: false` while the control cannot act yet (e.g. a redirect link with no
 * URL): taps stay held until it flips to true.
 */
export const useEarlyClickReplay = (
  rowRef: RefObject<HTMLElement | null>,
  key: string,
  {
    enabled = true,
    onReplay,
    onActivationLost,
    requiresUserActivation,
  }: { enabled?: boolean } & ReplayEarlyClickOptions = {},
): void => {
  // Latest callbacks without re-running the replay when their identity changes. Declared before
  // the replay effect so it has already run when that one reads the ref.
  const callbacksRef = useRef({ onReplay, onActivationLost });
  useEffect(() => {
    callbacksRef.current = { onReplay, onActivationLost };
  }, [onReplay, onActivationLost]);

  useEffect(() => {
    if (enabled && rowRef.current) {
      replayEarlyClick(rowRef.current, key, {
        onReplay: state => callbacksRef.current.onReplay?.(state),
        onActivationLost: state => callbacksRef.current.onActivationLost?.(state),
        requiresUserActivation,
      });
    }
  }, [enabled, key, requiresUserActivation, rowRef]);
};
