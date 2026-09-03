import { BodyColorsState, BodyColorsStateV2 } from "../types/bodyColors.types";

// Import the outfit details BodyColorsV2 type (with Color3 format)
type OutfitBodyColorsV2 = {
  headColor3: string;
  torsoColor3: string;
  rightArmColor3: string;
  leftArmColor3: string;
  rightLegColor3: string;
  leftLegColor3: string;
};

export type TSetBodyColors = BodyColorsState | BodyColorsStateV2 | OutfitBodyColorsV2;

export type TAssetIds = any;

export type AvatarType = "R6" | "R15";

export type TPatchOutfitResponse = {
  id: number;
  isEditable: boolean;
  name: string;
  outfitType: string | null;
};

export type Scale = {
  label: string;
  min: number;
  max: number;
  value: number;
  increment: number;
  type: string;
};

export type Scales = {
  height: Scale;
  width: Scale;
  head: Scale;
  proportion?: Scale;
  bodyType?: Scale;
};

export type ScalesWithBodyTypeAndProportion = Required<Pick<Scales, "proportion" | "bodyType">> &
  Omit<Scales, "proportion" | "bodyType">;

export function isScalesWithBodyTypeAndProportion(
  scales: Scales,
): scales is ScalesWithBodyTypeAndProportion {
  return "proportion" in scales && "bodyType" in scales;
}

export type ScalesKeys = keyof Scales;

type TBaseItemDetails = {
  collectibleItemId?: string;
  collectibleProductId?: string;
  creatorHasVerifiedBadge: boolean;
  creatorId?: number;
  creatorName: string;
  creatorTargetId: number;
  description: string;
  expectedSellerId?: number;
  id: number;
  isPurchasable: boolean;
  itemRestrictions: string[];
  lowestPrice?: number;
  lowestResalePrice?: number;
  name: string;
  owned: boolean;
  price: number;
  productId: number;
  totalQuantity?: number;
  unitsAvailableForConsumption?: number;
  saleLocationType?: string;
  isOffSale?: boolean;
  hasResellers?: boolean;
  quantityLimitPerUser?: number;
  resaleRestriction: number;
  isLimited?: boolean;
  isLimitedUnique?: boolean;
  priceStatus?: string;
};
//   //
//   type: TItemType;
// } & TItemCardRestrictions & {
//     thumbnailType: ThumbnailTypes;
//     link: string;
//   };

export type TAssetItemDetails = TBaseItemDetails & {
  assetType: number;
  itemStatus: string[];
  itemType: "Asset";
  selected?: boolean;
};

export type TAvatarInventoryItem = {
  itemType: string;
  itemSubType: number;
};

export type TBundleItemDetails = TBaseItemDetails & {
  bundledItems: TBundledItem[];
  bundleType: number;
  items: TBundleItem[];
  itemType: "Bundle";
};

export type TBundleItem = {
  id: number;
  type: string;
};

export type TBundledItem = {
  id: number;
  name: string;
  owned: boolean;
  type: TItemType;
};

export type TItemType = "Asset" | "Bundle";

export type TItemCardRestrictions = {
  isLimited: boolean;
  isRthro: boolean;
  isThirteenPlus: boolean;
  isLimitedUnique: boolean;
  itemRestrictionIcon: string;
  isCollectible: boolean;
  isDynamicHead: boolean;
};

export type TGenericItemDetails = TAssetItemDetails & { key: string };
