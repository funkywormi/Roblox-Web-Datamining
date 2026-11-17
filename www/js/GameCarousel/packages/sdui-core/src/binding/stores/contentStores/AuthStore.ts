//TODO: Extend to support SSR authentication here for SDUI SSR support
import { getCurrentUser } from "@rbx/www-common/user";
import { UnkeyedStore } from "../UnkeyedStore";

/** Content-type key under which auth state is registered on the data binder. */
export const AUTH_CONTENT_TYPE = "auth";

export interface AuthData {
  isAuthenticated: boolean;
  userId: string | null;
  displayName: string | null;
  [key: string]: unknown;
}

const UNAUTHENTICATED_DEFAULTS: AuthData = {
  isAuthenticated: false,
  userId: null,
  displayName: null,
};

/**
 * Reads the signed-in user from `<meta name="user-data">`, or from the
 * document element dataset on Next.js. `getCurrentUser` returns `undefined`
 * when the visitor is logged out and during SSR, where `document` is absent.
 * A returned user always has a validated id, so presence is authentication.
 */
function readCurrentUser(): AuthData {
  const currentUser = getCurrentUser();
  if (!currentUser) return UNAUTHENTICATED_DEFAULTS;

  return {
    isAuthenticated: true,
    userId: currentUser.id,
    displayName: currentUser.displayName ?? currentUser.userName ?? null,
  };
}

/**
 * Auth store sourced from `getCurrentUser()`. Access via
 * `AuthStore.getInstance()`.
 *
 * Browser: lazy process singleton — auth state is static per page load
 * (login/logout triggers a full navigation), so no listeners are attached
 * and there is nothing to leak. Tests reset with `__resetForTesting()`.
 *
 * SSR (no `window`): fresh per-request instance, seeded with
 * unauthenticated defaults because `getCurrentUser` finds no document.
 * The fresh-instance lifecycle is what will make per-request session
 * plumbing safe once SDUI SSR adds it (see TODO above).
 */
export class AuthStore extends UnkeyedStore<AuthData> {
  constructor() {
    // Re-seed on `clear()`: this store is a process singleton and attaches
    // no listeners, so without a reseed the base zero-out would leave auth
    // permanently empty after page disposal until full reload.
    super({ initial: readCurrentUser(), reseed: readCurrentUser });
  }

  public syncFromCurrentUser(): void {
    this.applyUpdate(readCurrentUser());
  }
}
