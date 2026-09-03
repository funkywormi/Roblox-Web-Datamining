import {
  Configuration,
  InventoryApi,
  V1UsersUserIdItemsItemTypeItemTargetIdIsOwnedGetItemTypeEnum,
} from "@rbx/client-inventory/v1";
import { ItemType } from "@rbx/core-scripts/deep-link";

import { getBEDEV1ServiceBasePath } from "../utils/getBasePaths";
import { getDomainInfo } from "../utils/getDomainInfo";

import type { GiftItem } from "../utils/giftItemNavigation";

const domainInfo = getDomainInfo(window.location.hostname);
const configuration = new Configuration({
  robloxSiteDomain: domainInfo.rootDomain,
  basePath: getBEDEV1ServiceBasePath(domainInfo.rootDomain, "inventory"),
  credentials: "include",
});

const inventoryApi = new InventoryApi(configuration);

const toInventoryItemType = (itemType: ItemType) => {
  if (itemType === ItemType.Asset) {
    return V1UsersUserIdItemsItemTypeItemTargetIdIsOwnedGetItemTypeEnum.NUMBER_0;
  }

  throw new Error(`Unsupported gift item type: ${itemType}`);
};

export const getIsItemOwned = (ownerUserId: number, item: GiftItem): Promise<boolean> => {
  return inventoryApi.v1UsersUserIdItemsItemTypeItemTargetIdIsOwnedGet({
    userId: ownerUserId,
    itemType: toInventoryItemType(item.itemType),
    itemTargetId: item.itemId,
  });
};
