/**
 * Subscribes to browser URL changes, invoking {@link onUrlChange} whenever the
 * current history entry changes.
 *
 * Uses the Navigation API when available, otherwise falls back to the History
 * API `popstate`/`pushstate`/`replacestate` events (the latter two require the
 * history polyfill added in workspace/components/polyfill).
 *
 * @returns A function that removes the registered listeners.
 */
export const subscribeToUrlChange = (onUrlChange: () => void): (() => void) => {
  // Note: The workspace typescript version does not have the Navigation API type
  // so we use unknown then check if it is an EventTarget (sufficient for our use
  // case which only needs to use addEventListener)
  const navigation: unknown = Reflect.get(window, "navigation");
  const isNavigationSupported = navigation instanceof EventTarget;

  if (isNavigationSupported) {
    navigation.addEventListener("currententrychange", onUrlChange);
  } else {
    // Fallback for browsers without the Navigation API. Polyfill added in workspace/components/polyfill
    window.addEventListener("popstate", onUrlChange);
    window.addEventListener("pushstate", onUrlChange);
    window.addEventListener("replacestate", onUrlChange);
  }

  return () => {
    if (isNavigationSupported) {
      navigation.removeEventListener("currententrychange", onUrlChange);
    } else {
      window.removeEventListener("popstate", onUrlChange);
      window.removeEventListener("pushstate", onUrlChange);
      window.removeEventListener("replacestate", onUrlChange);
    }
  };
};
