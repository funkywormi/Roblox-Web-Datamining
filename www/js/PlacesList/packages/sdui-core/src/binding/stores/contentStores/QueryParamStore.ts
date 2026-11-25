import { UnkeyedStore } from "../UnkeyedStore";

/** Content-type key under which URL query parameters are registered on the data binder. */
export const QUERY_PARAM_CONTENT_TYPE = "queryParam";

export type QueryParamData = Record<string, string>;

interface BrowserNavigation {
  addEventListener(type: "currententrychange", listener: EventListener): void;
}

// Read the Navigation API without augmenting the global `Window` interface.
// sdui-core is isomorphic and cannot assume every browser exposes this API.
export interface MaybeNavigationWindow {
  navigation?: BrowserNavigation;
}

function readQueryParams(): QueryParamData {
  if (typeof window === "undefined") return {};

  const result: QueryParamData = {};
  new URLSearchParams(window.location.search).forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * Query param store backed by `window.location.search`. Access via
 * `QueryParamStore.getInstance()`.
 *
 * Browser: lazy process singleton shared across services bundles for the tab.
 * Back/forward and supported same-document navigations update per-field
 * signals so bound template conditions can react when the URL changes.
 *
 * SSR: fresh instance per call, scoped to the calling `createSduiServices()`
 * request and seeded empty until request URL plumbing is available.
 */
export class QueryParamStore extends UnkeyedStore<QueryParamData> {
  constructor() {
    const isBrowser = typeof window !== "undefined";
    const reseed = (): QueryParamData => readQueryParams();
    super({ initial: reseed(), reseed });

    if (isBrowser) {
      const handleUrlChange: EventListener = () => {
        this.syncFromUrl();
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the Navigation API is browser-provided and not consistently present in the DOM typings consumed by sdui-core;
      const navigationWindow = window as unknown as MaybeNavigationWindow;
      if (navigationWindow.navigation) {
        // `currententrychange` fires *after* the navigation commits, so
        // `window.location.search` already reflects the new URL when we read
        // it. The `navigate` event fires pre-commit and would apply stale
        // params. This event is the documented replacement for `popstate`.
        navigationWindow.navigation.addEventListener("currententrychange", handleUrlChange);
      } else {
        // Fallback for browsers without the Navigation API:
        // `popstate` only catches back/forward, not pushState/replaceState navs.
        // TODO: If a surface needs to react to client-side navigation, patch
        // history.pushState/replaceState to emit a synthetic event and listen
        // for it here, or have the host feed router location changes into the
        // store. Not done yet as current params are set on load or back/forward.
        window.addEventListener("popstate", handleUrlChange);
      }
    }
  }

  syncFromUrl(): void {
    this.applyUpdate(readQueryParams());
  }
}
