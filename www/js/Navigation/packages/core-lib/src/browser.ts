/* eslint-disable @rbx/browser/no-browser-globals -- This is the guarded boundary for browser globals. */

/**
 * Browser globals that exist only when this code is running in a browser.
 *
 * Shared modules are imported during Next.js server rendering, where these globals do not exist.
 * Callers must handle `undefined` before reading them. Once this value is defined, `window` is the
 * remaining browser surface (`location`, `history`, `matchMedia`, and so on).
 */
export type BrowserEnvironment = {
  readonly window: Window;
  readonly document: Document;
  readonly navigator: Navigator;
};

/**
 * Returns the browser globals, or `undefined` during server rendering and other non-browser runtimes.
 *
 * ```
 * const browser = getBrowserEnvironment();
 * if (browser === undefined) {
 *   return;
 * }
 *
 * browser.document.documentElement.style.getPropertyValue("--container-main-margin-top");
 * ```
 */
export const getBrowserEnvironment = (): BrowserEnvironment | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  return {
    window,
    document: window.document,
    navigator: window.navigator,
  };
};
