import type { AssetItem } from "../constants/types";

export type LayoutData = {
  isPremiumIconOnItemTilesEnabled?: boolean;
  isPremiumPriceOnItemTilesEnabled?: boolean;
};

export type ItemPriceDisplay =
  | "privateServerPrice"
  | "noPriceText"
  | "priceStatus"
  | "free"
  | "price"
  | "offsale";

export const shouldShowPremiumIcon = (item: AssetItem, layoutData: LayoutData): boolean => {
  if (!layoutData.isPremiumIconOnItemTilesEnabled) {
    return false;
  }

  if (!item.Product?.PremiumPriceInRobux) {
    return false;
  }

  return true;
};

export const getDisplayPrice = (
  item: AssetItem,
  layoutData: LayoutData,
): number | null | undefined => {
  if (!item.Product) {
    return undefined;
  }

  if (layoutData.isPremiumPriceOnItemTilesEnabled && item.Product.PremiumPriceInRobux) {
    return item.Product.PremiumPriceInRobux;
  }

  return item.Product.PriceInRobux;
};

export const doesItemHavePrice = (item: AssetItem, layoutData: LayoutData): boolean => {
  if (!item.Product) {
    return false;
  }

  if (
    !item.Product.PriceInRobux &&
    (!item.Product.PremiumPriceInRobux || !layoutData.isPremiumPriceOnItemTilesEnabled)
  ) {
    return false;
  }

  return true;
};

// Picks a single price label so two never render into the fixed-width, ellipsis-truncated
// price line at once. Order matches the historical DOM order (first-rendered label wins).
export const getItemPriceDisplay = (item: AssetItem, layoutData: LayoutData): ItemPriceDisplay => {
  if (item.privateServerPriceLine) {
    return "privateServerPrice";
  }
  const product = item.Product;
  if (product?.NoPriceText) {
    return "noPriceText";
  }
  if (item.priceStatus) {
    return "priceStatus";
  }
  if (product?.TranslateFree) {
    return "free";
  }
  if (doesItemHavePrice(item, layoutData)) {
    return "price";
  }
  return "offsale";
};
