import { BADGE_CONTENT_TYPE, BADGE_DEFAULT_PATHS } from "./contentStores/BadgeStore";
import { CREATOR_CONTENT_TYPE, CREATOR_DEFAULT_PATHS } from "./contentStores/CreatorStore";
import {
  MARKETPLACE_ASSET_CONTENT_TYPE,
  MARKETPLACE_ASSET_DEFAULT_PATHS,
} from "./contentStores/MarketplaceAssetStore";
import {
  MARKETPLACE_BUNDLE_CONTENT_TYPE,
  MARKETPLACE_BUNDLE_DEFAULT_PATHS,
} from "./contentStores/MarketplaceBundleStore";
import { SONG_CONTENT_TYPE, SONG_DEFAULT_PATHS } from "./contentStores/SongStore";
import { UNIVERSE_CONTENT_TYPE, UNIVERSE_DEFAULT_PATHS } from "./contentStores/UniverseStore";
import {
  USER_PROFILE_CONTENT_TYPE,
  USER_PROFILE_DEFAULT_PATHS,
} from "./contentStores/UserProfileStore";

/**
 * Per-content-type fallback `inputData` keys used by
 * `buildDataBindingSources` when a `HydrationDataSpec` arrives without an
 * explicit `inputPath`. The first key whose lookup returns a defined value
 * wins.
 *
 * Composed from each store's own `*_DEFAULT_PATHS` export so the per-type
 * lookup order lives next to the store that owns it. To register a new
 * content type:
 *
 *   1. Export `XYZ_CONTENT_TYPE` and `XYZ_DEFAULT_PATHS` from
 *      `contentStores/XyzStore.ts`.
 *   2. Add an entry here.
 *   3. Register the store in `createHydrationStores`.
 */
export const DEFAULT_PATHS_BY_CONTENT_TYPE: Readonly<Record<string, readonly string[]>> = {
  [BADGE_CONTENT_TYPE]: BADGE_DEFAULT_PATHS,
  [CREATOR_CONTENT_TYPE]: CREATOR_DEFAULT_PATHS,
  [MARKETPLACE_ASSET_CONTENT_TYPE]: MARKETPLACE_ASSET_DEFAULT_PATHS,
  [MARKETPLACE_BUNDLE_CONTENT_TYPE]: MARKETPLACE_BUNDLE_DEFAULT_PATHS,
  [SONG_CONTENT_TYPE]: SONG_DEFAULT_PATHS,
  [UNIVERSE_CONTENT_TYPE]: UNIVERSE_DEFAULT_PATHS,
  [USER_PROFILE_CONTENT_TYPE]: USER_PROFILE_DEFAULT_PATHS,
};
