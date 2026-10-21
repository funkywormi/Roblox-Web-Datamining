import { EntityStore } from "../EntityStore";
import type { MarketplaceCatalogItemData } from "./MarketplaceCatalogItemData";

export const MARKETPLACE_ASSET_CONTENT_TYPE = "marketplaceAsset";

export const MARKETPLACE_ASSET_DEFAULT_PATHS: readonly string[] = ["item_id", "itemId"];

/** Camel-cased wire fields from marketplace_asset_data.proto. */
export interface MarketplaceAssetData extends MarketplaceCatalogItemData {
  assetType?: string;
}

export class MarketplaceAssetStore extends EntityStore<MarketplaceAssetData> {}
