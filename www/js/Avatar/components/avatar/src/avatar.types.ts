import type { ItemCardRestrictions } from "@rbx/www-common/components/itemCard";

type AssetType = {
  id: number;
  name?: string;
};

type Thumbnail = {
  Final: boolean;
  Url: string;
};

/**
 * Item-level availability surfaced by `/v1/avatar-inventory`.
 *
 * Mirrors the `AvatarItemStatus` enum from avatar-core (see
 * `Roblox.Api.Avatar.Common.Utils.ConvertAvatarItemStatusToString`).
 * - `Available`: item can be equipped / clicked through normally.
 * - `Unavailable`: linked entity (Look / Bundle) is moderated, suppressed,
 *   or otherwise no longer wearable. Render the disabled placeholder.
 * - `PendingReview`: linked entity is awaiting moderation; treat as
 *   unavailable in the editor.
 * - `Expired`: subscription asset whose entitlement has lapsed; already
 *   routed through the existing expired-asset dialog flow.
 */
export type AvatarItemAvailabilityStatus =
  | "Available"
  | "Unavailable"
  | "PendingReview"
  | "Expired";

/**
 * Whether an item is Roblox-owned or licensed from an external rights holder.
 * - `FirstParty`: Roblox-owned IP, badged as "Official".
 * - `ThirdParty`: licensed external IP, badged as "Licensed".
 */
export type ItemLicenseType = "FirstParty" | "ThirdParty";

/**
 * Per-item licensing metadata surfaced by `/v1/avatar-inventory`. Present only
 * on items that carry a license; absent for ordinary UGC / catalog items.
 *
 * `badgeAssetId`, `name`, and `licenseDisplayName` are returned by the API but
 * not yet rendered — their treatment is pending design.
 */
export type ItemLicense = {
  id: string;
  licenseType: ItemLicenseType;
  badgeAssetId?: string;
  name?: string;
  licenseDisplayName?: string;
};

export type CatalogItemBase = {
  id: number;
  itemRestrictions?: ItemCardRestrictions;
  name: string;
  thumbnail?: Thumbnail;
  thumbnailType: "Asset" | "Outfit";
  type: "Asset" | "Outfit";
  itemType: "Asset" | "Bundle";
  count?: number;
  expirationTime?: string;
  availabilityStatus?: AvatarItemAvailabilityStatus;
  license?: ItemLicense;
};

export type CatalogAssetItem = CatalogItemBase & {
  assetType: AssetType;
  itemType: "Asset";
  link: string;
  thumbnailType: "Asset";
  type: "Asset";
  selected?: boolean;
};

export type Asset = {
  id: number;
  name: string;
  assetType: AssetType;
  currentVersionId: number;
  expirationTime?: string;
  availabilityStatus?: AvatarItemAvailabilityStatus;
};

export type CatalogOutfitItem = CatalogItemBase & {
  itemType: "Bundle";
  thumbnailType: "Outfit";
  type: "Outfit";
  link: string | undefined;
  isEditable?: boolean;
  outfitType: "Avatar" | "DynamicHead" | "Shoes" | "Makeup";
  assets: Asset[];
  selected?: boolean;
  version?: number;
  supportsHeadShapes?: boolean;
  expiredAssets?: Asset[];
  linkedEntityId?: string;
  linkedEntityType?: "Look" | "Bundle";
  // Profile background asset id saved with the outfit (from outfit details). `0` means "no
  // background"; undefined for outfits saved before background support.
  backgroundAssetId?: number;
};

export type CatalogItem = CatalogAssetItem | CatalogOutfitItem;

export function isCatalogItemAsset(item: CatalogItem): item is CatalogAssetItem {
  return item.type === "Asset";
}

export function isCatalogItemOutfit(item: CatalogItem): item is CatalogOutfitItem {
  return item.type === "Outfit";
}

export type CatalogItemWithSelection = CatalogItem & {
  selected: boolean;
};
