import dataStore from "@rbx/core-scripts/data-store";
import { Asset } from "@rbx/profile-platform";
import { CatalogApiResponse } from "../types/apiResponseTypes";

export interface HydratedAsset extends Asset {
  name?: string;
  price?: number;
  creatorName?: string;
  creatorType?: string;
  creatorTargetId?: number;
  lowestPrice?: number;
  priceStatus?: string;
  premiumPricing?: number;
  unitsAvailableForConsumption?: number;
  itemStatus?: string[];
  itemRestrictions?: string[];
  isHydrated?: boolean;
}

const hasIdProperty = (obj: object): obj is { id: unknown } => "id" in obj;

const isCatalogApiResponse = (obj: unknown): obj is CatalogApiResponse => {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  return hasIdProperty(obj) && typeof obj.id === "number";
};

export const fetchMultipleItemDetails = async (items: Asset[]): Promise<HydratedAsset[]> => {
  if (items.length === 0) {
    return [];
  }

  const hydratedItems: HydratedAsset[] = items.map(item => ({
    ...item,
    isHydrated: false,
  }));

  try {
    const requestItems = items.map(item => ({
      itemType: item.itemType,
      id: item.assetId,
    }));

    const requestModel = {
      items: requestItems,
    };

    // @ts-expect-error: The enum types aren't properly exported, but the strings work at runtime
    const response = await dataStore.catalogDataStore.postItemDetails(requestModel);

    if (typeof response.data === "object" && "data" in response.data) {
      const responseData = response.data.data;

      if (Array.isArray(responseData)) {
        responseData.forEach((itemData: unknown) => {
          if (isCatalogApiResponse(itemData)) {
            const itemIndex = hydratedItems.findIndex(item => item.assetId === itemData.id);
            if (itemIndex !== -1 && hydratedItems[itemIndex]) {
              const hydratedItem = hydratedItems[itemIndex];
              hydratedItem.isHydrated = true;
              if (itemData.name !== undefined) {
                hydratedItem.name = itemData.name;
              }
              if (itemData.price !== undefined) {
                hydratedItem.price = itemData.price;
              }
              if (itemData.creatorName !== undefined) {
                hydratedItem.creatorName = itemData.creatorName;
              }
              if (itemData.creatorType !== undefined) {
                hydratedItem.creatorType = itemData.creatorType;
              }
              if (itemData.creatorTargetId !== undefined) {
                hydratedItem.creatorTargetId = itemData.creatorTargetId;
              }
              if (itemData.lowestPrice !== undefined) {
                hydratedItem.lowestPrice = itemData.lowestPrice;
              }
              if (itemData.priceStatus !== undefined) {
                hydratedItem.priceStatus = itemData.priceStatus;
              }
              if (itemData.unitsAvailableForConsumption !== undefined) {
                hydratedItem.unitsAvailableForConsumption = itemData.unitsAvailableForConsumption;
              }
              if (itemData.itemStatus !== undefined) {
                hydratedItem.itemStatus = itemData.itemStatus;
              }
              if (itemData.itemRestrictions !== undefined) {
                hydratedItem.itemRestrictions = itemData.itemRestrictions;
              }
            }
          }
        });
      }
    }
  } catch (error) {
    console.error(error);
  }

  return hydratedItems;
};
