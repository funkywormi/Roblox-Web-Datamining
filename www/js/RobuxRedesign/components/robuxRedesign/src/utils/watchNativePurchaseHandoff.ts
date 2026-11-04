import { document, window } from "@rbx/core-lib/browser";

/** `blur` means the native sheet took over. `none` means the webview is still focused. */
export type NativePurchaseHandoffSignal = "blur" | "none" | "noFocus";

const DEFAULT_TIMEOUT_MS = 5000;

let watchInFlight = false;

/**
 * Watches whether a native purchase sheet takes over after a purchase click.
 * A window blur means the sheet opened. If the timeout elapses first, `none`
 * means the document is still focused and the purchase did not take over.
 * Clicks while a watch is already running are ignored so only one listener
 * and timer are active.
 */
export function watchNativePurchaseHandoff(
  onResult: (signal: NativePurchaseHandoffSignal) => void,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): void {
  const browserWindow = window;
  const browserDocument = document;
  if (browserWindow === undefined || browserDocument === undefined || watchInFlight) {
    return;
  }

  watchInFlight = true;

  const watch: { timer?: number; onBlur?: (event: FocusEvent) => void } = {};

  const finish = (signal: NativePurchaseHandoffSignal) => {
    if (!watchInFlight) {
      return;
    }
    watchInFlight = false;
    if (watch.timer !== undefined) {
      browserWindow.clearTimeout(watch.timer);
    }
    if (watch.onBlur !== undefined) {
      browserWindow.removeEventListener("blur", watch.onBlur);
    }
    onResult(signal);
  };

  watch.onBlur = (event: FocusEvent) => {
    if (event.target !== browserWindow) {
      return;
    }
    finish("blur");
  };

  watch.timer = browserWindow.setTimeout(() => {
    finish(browserDocument.hasFocus() ? "none" : "noFocus");
  }, timeoutMs);

  browserWindow.addEventListener("blur", watch.onBlur);
}
