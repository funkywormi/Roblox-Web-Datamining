import assetsConstants from "../constants/assetsConstants";
import type { CatalogItemDetail } from "../mappers/itemCardMappers";
import { getJson, postJson } from "./request";

export type CatalogMetadata = {
  isDynamicHeadsEnabled?: boolean;
  isPremiumIconOnItemTilesEnabled?: boolean;
  isPremiumPriceOnItemTilesEnabled?: boolean;
};

export type AssetToCategoryMappings = Record<string, number | undefined>;

export const getCatalogMetadata = (): Promise<CatalogMetadata> =>
  getJson<CatalogMetadata>(assetsConstants.endpoints.getCatalogMetadata, {});

/* Used for asset to catalog mappings */

export const getAssetToCategoryMappings = (): Promise<AssetToCategoryMappings> =>
  getJson<AssetToCategoryMappings>(assetsConstants.endpoints.getAssetToCatalogCategory, {});

export const getAssetToSubcategoryMappings = (): Promise<AssetToCategoryMappings> =>
  getJson<AssetToCategoryMappings>(assetsConstants.endpoints.getAssetToCatalogSubcategory, {});
/* Used for asset to catalog mappings */

export const postItemDetails = (
  items: { id: number | undefined; itemType: string | undefined }[],
): Promise<{ data: (CatalogItemDetail & { itemType: string })[] }> =>
  postJson(assetsConstants.endpoints.postItemDetails, { items });
