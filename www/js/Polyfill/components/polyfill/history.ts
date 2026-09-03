type HistoryStateMethod = "pushState" | "replaceState";

function patchMethod(methodName: HistoryStateMethod, eventType: string): void {
  const original = window.history[methodName];

  window.history[methodName] = function patchedHistoryMethod(
    this: History,
    ...args: Parameters<History[HistoryStateMethod]>
  ): void {
    // Preserve native behavior first, then notify listeners.
    original.apply(this, args);
    window.dispatchEvent(new Event(eventType));
  };
}

/**
 * Polyfills `history.pushState` and `history.replaceState` so they dispatch
 * `pushstate` / `replacestate` events on `window` after delegating to the
 * original native method.
 */
export default function applyHistoryPolyfill(): void {
  patchMethod("pushState", "pushstate");
  patchMethod("replaceState", "replacestate");
}
