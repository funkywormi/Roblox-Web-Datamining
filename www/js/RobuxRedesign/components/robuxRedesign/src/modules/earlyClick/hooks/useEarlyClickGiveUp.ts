import { type RefObject, useEffect, useRef } from "react";
import { window } from "@rbx/core-lib/browser";
import { EARLY_CLICK_EVENT } from "../utils/capture";
import {
  EARLY_CLICK_REDIRECT_URL_TIMEOUT_MS,
  type EarlyClickState,
  releaseEarlyClick,
} from "../utils/replay";

/**
 * While `enabled`, gives up a tap `afterMs` after it was held, so a control whose prerequisite
 * never arrives (a failed auth ticket) does not swallow that tap forever. The wait starts when the
 * tap is held, not when the row mounts. Cancelled if `enabled` flips or the container unmounts,
 * which is what happens when the redirect URL lands. `onGiveUp` runs only if a tap was being held
 * (not for rows nobody tapped), so it is the place to tell the user.
 */
export const useEarlyClickGiveUp = (
  rowRef: RefObject<HTMLElement | null>,
  key: string,
  {
    enabled,
    afterMs = EARLY_CLICK_REDIRECT_URL_TIMEOUT_MS,
    onGiveUp,
  }: { enabled: boolean; afterMs?: number; onGiveUp?: (state: EarlyClickState) => void },
): void => {
  // Latest callback without restarting the timer when its identity changes.
  const onGiveUpRef = useRef(onGiveUp);
  useEffect(() => {
    onGiveUpRef.current = onGiveUp;
  }, [onGiveUp]);

  useEffect(() => {
    const row = rowRef.current;
    if (!enabled || !row || !window) {
      return undefined;
    }
    const currentWindow = window;
    let timer: number | undefined;
    const clearTimer = () => {
      if (timer === undefined) {
        return;
      }
      currentWindow.clearTimeout(timer);
      timer = undefined;
    };
    // Re-armed from the tap's own start time whenever the held tap moves onto or off this row, so
    // a tap that left and came back gets a full wait, and a row the user left is not released.
    const sync = () => {
      const state = currentWindow.robuxEarlyClick;
      if (state?.key !== key) {
        clearTimer();
        return;
      }
      if (timer !== undefined) {
        return;
      }
      const elapsed = Math.max(0, currentWindow.performance.now() - state.startedAt);
      timer = currentWindow.setTimeout(
        () => {
          timer = undefined;
          if (currentWindow.robuxEarlyClick?.key !== key) {
            return;
          }
          const droppedTap = releaseEarlyClick(row, key);
          if (droppedTap) {
            onGiveUpRef.current?.(droppedTap);
          }
        },
        Math.max(0, afterMs - elapsed),
      );
    };
    sync();
    currentWindow.addEventListener(EARLY_CLICK_EVENT, sync);
    return () => {
      currentWindow.removeEventListener(EARLY_CLICK_EVENT, sync);
      clearTimer();
    };
  }, [enabled, key, afterMs, rowRef]);
};
