import { ItemType, navigateToDeepLink } from "@rbx/core-scripts/deep-link";

export type GiftItem = {
  itemId: number;
  itemType: ItemType;
};

export const GIFT_ITEM: GiftItem = {
  itemId: 82762961686618,
  itemType: ItemType.Asset,
};

export const getItemDetailsDeepLink = ({ itemId, itemType }: GiftItem) =>
  `roblox://navigation/item_details?itemId=${itemId}&itemType=${itemType}`;

export const navigateToGiftItemDetails = (item: GiftItem) => {
  return navigateToDeepLink(getItemDetailsDeepLink(item));
};

export const navigateToGiftItemAvatarEditor = () => {
  return navigateToDeepLink("roblox://navigation/avatar");
};
