//TODO: Extend to support SSR authentication here for SDUI SSR support
import { UnkeyedStore } from "../UnkeyedStore";

/** Content-type key under which auth state is registered on the data binder. */
export const AUTH_CONTENT_TYPE = "auth";

export interface AuthData {
  isAuthenticated: boolean;
  userId: string | null;
  displayName: string | null;
  [key: string]: unknown;
}

export interface RobloxCurrentUser {
  userId?: number | string;
  displayName?: string;
  name?: string;
}

// Read `window.Roblox.CurrentUser` without augmenting the global `Window`
// interface. sdui-core is the isomorphic engine and must not depend on
// core-scripts, which owns the canonical `Window.Roblox` typings — augmenting
// here would collide with that declaration (TS2687 / TS2717) for any consumer
// that pulls in both. Exported so tests can cast `window` through the same
// shape without re-declaring it.
export interface MaybeRobloxWindow {
  Roblox?: { CurrentUser?: RobloxCurrentUser };
}

const UNAUTHENTICATED_DEFAULTS: AuthData = {
  isAuthenticated: false,
  userId: null,
  displayName: null,
};

function readCurrentUser(): AuthData {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- `window.Roblox` is provided by the host page at runtime; sdui-core deliberately does not augment the global `Window` typing (see `MaybeRobloxWindow` comment above), so this is the documented boundary cast.
  const currentUser = (window as unknown as MaybeRobloxWindow).Roblox?.CurrentUser;
  if (!currentUser) return UNAUTHENTICATED_DEFAULTS;
  return {
    isAuthenticated: true,
    userId: currentUser.userId != null ? String(currentUser.userId) : null,
    displayName: currentUser.displayName ?? currentUser.name ?? null,
  };
}

/**
 * Auth store sourced from `window.Roblox.CurrentUser`. Access via
 * `AuthStore.getInstance()`.
 *
 * Browser: lazy process singleton — auth state is static per page load
 * (login/logout triggers a full navigation), so no listeners are attached
 * and there is nothing to leak. Tests reset with `__resetForTesting()`.
 *
 * SSR (no `window`): fresh per-request instance, seeded with
 * unauthenticated defaults. The fresh-instance lifecycle is what will make
 * per-request session plumbing safe once SDUI SSR adds it (see TODO above).
 */
export class AuthStore extends UnkeyedStore<AuthData> {
  constructor() {
    // Re-seed on `clear()`: this store is a process singleton and attaches
    // no listeners, so without a reseed the base zero-out would leave auth
    // permanently empty after page disposal until full reload.
    const isBrowser = typeof window !== "undefined";
    const reseed = (): AuthData => (isBrowser ? readCurrentUser() : UNAUTHENTICATED_DEFAULTS);
    super({ initial: reseed(), reseed });
  }
}
