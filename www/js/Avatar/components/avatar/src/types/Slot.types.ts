import type { AccoutrementAsset } from "@rbx/avatar-common";

type AssetType = {
  id: number;
  name: string;
};

type ItemStatus = string[];
type ItemRestrictions = string[];

type Thumbnail = {
  Final: boolean;
  Url: string;
};

export type EmptySlot = {
  empty: boolean;
};

export function isEmptySlot(
  slot: HatSlot | ClassicHeadSlot | LayeredClothingSlot,
): slot is EmptySlot {
  return (slot as EmptySlot).empty;
}

type HatAssetSlot = {
  type: string;
  id: number;
  name: string;
  assetType: AssetType;
  currentVersionId: number;
  thumbnail: Thumbnail;
  thumbnailType: string;
  link: string;
};

export type HatSlot = HatAssetSlot | EmptySlot;

export type AdvancedAccessoryAssetSlot = {
  type: string;
  id: number;
  name: string;
  assetType: AssetType;
  currentVersionId: number;
  thumbnail: Thumbnail;
  thumbnailType: string;
  link: string;
};

export type AdvancedAccessorySlot = AdvancedAccessoryAssetSlot | EmptySlot;

export type ClassicHeadAssetSlot = {
  id: number;
  itemType: string;
  assetType: AssetType;
  name: string;
  description: string;
  productId: number;
  itemStatus: ItemStatus;
  itemRestrictions: ItemRestrictions;
  creatorHasVerifiedBadge: boolean;
  creatorType: string;
  creatorTargetId: number;
  creatorName: string;
  price: number;
  priceStatus: string;
  purchaseCount: number;
  favoriteCount: number;
  offSaleDeadline: string | null;
  saleLocationType: string;
  thumbnailType: string;
};

export type ClassicHeadSlot = ClassicHeadAssetSlot | EmptySlot;

export type LayeredClothingAssetSlot = AccoutrementAsset & {
  type: string;
  thumbnailType: string;
  link: string;
  thumbnail: Thumbnail;
};

export type LayeredClothingSlot = LayeredClothingAssetSlot | EmptySlot;
