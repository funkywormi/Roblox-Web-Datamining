import { document, window } from "@rbx/core-lib/browser";

/**
 * `shown` is the time until the native sheet took over. `timeout` means it
 * never did within 30 seconds. `superseded` means a later purchase click
 * replaced this watch before either of those happened.
 */
export type NativePurchaseUiShownResult =
  | { outcome: "shown"; elapsedMs: number }
  | { outcome: "timeout" }
  | { outcome: "superseded" };

export const NATIVE_PURCHASE_UI_SHOWN_TIMEOUT_MS = 30000;

type ActiveWatch = {
  stop: () => void;
  supersede: () => void;
};

let activeWatch: ActiveWatch | null = null;

type WatchNativePurchaseHandoffOptions = {
  onUiShown?: (result: NativePurchaseUiShownResult) => void;
  uiShownTimeoutMs?: number;
};

/**
 * Measures how long a native purchase sheet takes to take over after a click.
 * A window blur means the sheet opened. If 30 seconds pass first, the watch
 * reports a timeout. A later click reports the current watch as superseded
 * and starts a new measurement from that click.
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

  activeWatch?.supersede();

  const startedAt = Date.now();
  const watch: ActiveWatch & {
    shownTimer?: number;
    onBlur?: (event: FocusEvent) => void;
  } = {
    stop: () => undefined,
    supersede: () => undefined,
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
  const supersede = () => {
    if (activeWatch !== watch) {
      return;
    }
    stop();
    onUiShown?.({ outcome: "superseded" });
  };
  watch.stop = stop;
  watch.supersede = supersede;
  activeWatch = watch;

  watch.onBlur = (event: FocusEvent) => {
    if (event.target !== browserWindow || activeWatch !== watch) {
      return;
    }
    const elapsedMs = Date.now() - startedAt;
    stop();
    onUiShown?.({ outcome: "shown", elapsedMs });
  };

  watch.shownTimer = browserWindow.setTimeout(() => {
    if (activeWatch !== watch) {
      return;
    }
    stop();
    onUiShown?.({ outcome: "timeout" });
  }, uiShownTimeoutMs);

  browserWindow.addEventListener("blur", watch.onBlur);
}
