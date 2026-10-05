import { UnkeyedStore } from "../UnkeyedStore";

/** Content-type key under which viewport state is registered on the data binder. */
export const RESPONSIVE_CONTENT_TYPE = "responsive";

export interface ResponsiveData {
  screenWidth: number;
  screenHeight: number;
  isPortrait: boolean;
  [key: string]: unknown;
}

// TODO(sdui-ssr): Replace these hard-coded fallbacks with per-request device
// metadata (User-Agent / Client Hints) so SSR renders match the requesting
// device's viewport instead of always assuming desktop. See class docstring.
const SSR_VIEWPORT_WIDTH = 1280;
const SSR_VIEWPORT_HEIGHT = 800;

const SSR_DEFAULTS: ResponsiveData = {
  screenWidth: SSR_VIEWPORT_WIDTH,
  screenHeight: SSR_VIEWPORT_HEIGHT,
  isPortrait: false,
};

function readViewport(): ResponsiveData {
  return {
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    isPortrait: window.innerHeight > window.innerWidth,
  };
}

/**
 * Responsive store backed by the window viewport. Access via
 * `ResponsiveStore.getInstance()`.
 *
 * Per-field signals (from `UnkeyedStore.applyUpdate`) mean a
 * horizontal-only resize wakes only `screenWidth` consumers, and
 * orientation consumers re-evaluate only when `isPortrait` actually flips.
 *
 *
 * Browser: lazy process singleton — shared across services bundles
 *
 * SSR: fresh instance per call, scoped to the calling
 * `createSduiServices()` request.
 *
 * The hard-coded SSR viewport is a temporary stub — full SDUI SSR support
 * requires plumbing per-request device metadata (User-Agent or Client
 * Hints) through the request context so the seeded viewport matches the
 * requesting device. Until that lands, mobile-first templates rendered on
 * SSR will hydrate against desktop dimensions and may flash on the first
 * client `resize`.
 */
export class ResponsiveStore extends UnkeyedStore<ResponsiveData> {
  constructor() {
    // Re-seed on `clear()`: this store is a process singleton. The resize
    // listener would eventually re-seed after the base zero-out, but
    // consumers would read `undefined` until the user resizes the window.
    const isBrowser = typeof window !== "undefined";
    const reseed = (): ResponsiveData => (isBrowser ? readViewport() : SSR_DEFAULTS);
    super({ initial: reseed(), reseed });
    if (isBrowser) {
      window.addEventListener("resize", () => {
        this.applyUpdate(readViewport());
      });
    }
  }
}
