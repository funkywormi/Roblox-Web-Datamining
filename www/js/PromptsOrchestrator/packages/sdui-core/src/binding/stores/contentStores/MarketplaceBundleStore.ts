import { EntityStore } from "../EntityStore";
import type {
  MarketplaceCatalogBundledItem,
  MarketplaceCatalogItemData,
} from "./MarketplaceCatalogItemData";

export const MARKETPLACE_BUNDLE_CONTENT_TYPE = "marketplaceBundle";

export const MARKETPLACE_BUNDLE_DEFAULT_PATHS: readonly string[] = ["item_id", "itemId"];

/** Camel-cased wire fields from marketplace_bundle_data.proto. */
export interface MarketplaceBundleData extends MarketplaceCatalogItemData {
  bundleType?: string;
  bundledItems?: MarketplaceCatalogBundledItem[];
  isRecolorable?: boolean;
}

export class MarketplaceBundleStore extends EntityStore<MarketplaceBundleData> {}
