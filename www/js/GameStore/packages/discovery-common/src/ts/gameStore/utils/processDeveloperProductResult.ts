import { TDeveloperProduct, TDeveloperProductResponseObject } from "../types/developerProductTypes";

export default function processDeveloperProductResult(
  item: TDeveloperProductResponseObject,
): TDeveloperProduct | null {
  if (
    !item?.ProductId ||
    item.PriceInRobux === null ||
    item.PriceInRobux === undefined ||
    !item.Name ||
    !item.DeveloperProductId
  ) {
    return null;
  }
  return {
    targetId: item.DeveloperProductId,
    productId: item.ProductId,
    name: item.displayName || item.Name,
    priceInRobux: item.PriceInRobux,
    Description: item.displayDescription || item.Description,
    iconImageAssetId: item.IconImageAssetId,
    priceDiscountDetails: item.PriceDiscountDetails ?? null,
  };
}
