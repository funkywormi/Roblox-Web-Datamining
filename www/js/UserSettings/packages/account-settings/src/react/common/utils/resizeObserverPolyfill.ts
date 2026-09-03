import ResizeObserverPolyfill from "resize-observer-polyfill";

/**
 * Polyfills ResizeObserver for environments that don't support it (specifically UWP webviews).
 * This ensures that components using ResizeObserver (like MUI components)
 * work correctly in all environments.
 */
export const setupResizeObserverPolyfill = (): void => {
  // Only polyfill if ResizeObserver is not natively supported
  if (typeof window !== "undefined" && !window.ResizeObserver) {
    window.ResizeObserver = ResizeObserverPolyfill;
  }
};

export default setupResizeObserverPolyfill;
