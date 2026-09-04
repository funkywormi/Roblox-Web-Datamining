import type { HydrationStore, TranslateFunction } from "../../types";
import { AUTH_CONTENT_TYPE, AuthStore } from "./contentStores/AuthStore";
import { BADGE_CONTENT_TYPE, BadgeStore } from "./contentStores/BadgeStore";
import { CREATOR_CONTENT_TYPE, CreatorStore } from "./contentStores/CreatorStore";
import {
  LOCALIZED_LITERALS_CONTENT_TYPE,
  LocalizedLiteralsStore,
} from "./contentStores/LocalizedLiteralsStore";
import { QUERY_PARAM_CONTENT_TYPE, QueryParamStore } from "./contentStores/QueryParamStore";
import { RESPONSIVE_CONTENT_TYPE, ResponsiveStore } from "./contentStores/ResponsiveStore";
import { SONG_CONTENT_TYPE, SongStore } from "./contentStores/SongStore";
import { UNIVERSE_CONTENT_TYPE, UniverseStore } from "./contentStores/UniverseStore";

/**
 * Canonical set of hydration stores registered with the data binder, wired
 * automatically by `createSduiServices`. This is the single auditable site
 * for every content type the binder resolves at runtime — feature code has
 * no escape hatch to register additional stores.
 *
 * Lifetime depends on the runtime (decided by each store's `getInstance()`):
 *
 * - **Browser:** every store is a lazy process singleton
 * - **SSR (no `window`):** each call returns fresh instances, scoped to
 *   the calling `createSduiServices()` request.
 *
 * To add a new content type:
 *   1. Add `XyzStore.ts` under `contentStores/` extending `EntityStore` or
 *      `UnkeyedStore`, exporting `XYZ_CONTENT_TYPE` and an optional
 *      `XYZ_DEFAULT_PATHS`.
 *   2. Register `XyzStore.getInstance()` here under `XYZ_CONTENT_TYPE` —
 *      the base-class `getInstance()` handles the CSR/SSR split.
 *   3. Wire its default paths in `defaultPathsByContentType.ts`.
 *
 * Tests needing a different set go through `createSduiServicesForTesting`,
 * which is not re-exported from any package index.
 */
export function createHydrationStores(
  translate?: TranslateFunction,
): Readonly<Record<string, HydrationStore>> {
  return {
    [BADGE_CONTENT_TYPE]: BadgeStore.getInstance(),
    [CREATOR_CONTENT_TYPE]: CreatorStore.getInstance(),
    [SONG_CONTENT_TYPE]: SongStore.getInstance(),
    [UNIVERSE_CONTENT_TYPE]: UniverseStore.getInstance(translate),
    [RESPONSIVE_CONTENT_TYPE]: ResponsiveStore.getInstance(),
    [AUTH_CONTENT_TYPE]: AuthStore.getInstance(),
    [LOCALIZED_LITERALS_CONTENT_TYPE]: LocalizedLiteralsStore.getInstance(),
    [QUERY_PARAM_CONTENT_TYPE]: QueryParamStore.getInstance(),
  };
}
