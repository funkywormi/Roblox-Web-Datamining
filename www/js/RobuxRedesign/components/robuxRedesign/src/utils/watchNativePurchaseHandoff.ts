import { document, window } from "@rbx/core-lib/browser";

/**
 * `shown` is the time until the native sheet took over. `timeout` means it
 * never did within 30 seconds. `tapCount` is how many purchase taps happened
 * during the watch, including the tap that started it.
 */
export type NativePurchaseUiShownResult =
  | { outcome: "shown"; elapsedMs: number; tapCount: number }
  | { outcome: "timeout"; tapCount: number };

export const NATIVE_PURCHASE_UI_SHOWN_TIMEOUT_MS = 30000;

type ActiveWatch = {
  tapCount: number;
  recordTap: () => void;
};

let activeWatch: ActiveWatch | null = null;

type WatchNativePurchaseHandoffOptions = {
  onUiShown?: (result: NativePurchaseUiShownResult) => void;
  uiShownTimeoutMs?: number;
};

/**
 * Measures how long a native purchase sheet takes to take over after a click.
 * A window blur means the sheet opened. If 30 seconds pass first, the watch
 * reports a timeout. Another click while the watch is running is counted as
 * another tap and does not restart the timer, because the blur still belongs
 * to the first click.
 */
export function watchNativePurchaseHandoff({
  onUiShown,
  uiShownTimeoutMs = NATIVE_PURCHASE_UI_SHOWN_TIMEOUT_MS,
}: WatchNativePurchaseHandoffOptions): void {
  const browserWindow = window;
  const browserDocument = document;
  if (browserWindow === undefined || browserDocument === undefined) {
    return;
  }

  if (activeWatch) {
    activeWatch.recordTap();
    return;
  }

  const startedAt = Date.now();
  const watch: ActiveWatch & {
    shownTimer?: number;
    onBlur?: (event: FocusEvent) => void;
  } = {
    tapCount: 1,
    recordTap: () => undefined,
  };

  const stop = () => {
    if (activeWatch !== watch) {
      return;
    }
    activeWatch = null;
    if (watch.shownTimer !== undefined) {
      browserWindow.clearTimeout(watch.shownTimer);
    }
    if (watch.onBlur !== undefined) {
      browserWindow.removeEventListener("blur", watch.onBlur);
    }
  };
  watch.recordTap = () => {
    watch.tapCount += 1;
  };
  activeWatch = watch;

  watch.onBlur = (event: FocusEvent) => {
    if (event.target !== browserWindow || activeWatch !== watch) {
      return;
    }
    const elapsedMs = Date.now() - startedAt;
    const { tapCount } = watch;
    stop();
    onUiShown?.({ outcome: "shown", elapsedMs, tapCount });
  };

  watch.shownTimer = browserWindow.setTimeout(() => {
    if (activeWatch !== watch) {
      return;
    }
    const { tapCount } = watch;
    stop();
    onUiShown?.({ outcome: "timeout", tapCount });
  }, uiShownTimeoutMs);

  browserWindow.addEventListener("blur", watch.onBlur);
}
