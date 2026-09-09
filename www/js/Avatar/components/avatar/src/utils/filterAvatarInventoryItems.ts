import type { AvatarInventoryItem } from "../services/avatarAPIService";

/**
 * Hides Plus-exclusive inventory items from users without a Roblox Plus subscription.
 * Items from older API responses that omit `isPlusExclusive` remain visible.
 */
export default function filterAvatarInventoryItems(
  items: AvatarInventoryItem[],
  isPlusSubscriber: boolean,
): AvatarInventoryItem[] {
  return isPlusSubscriber ? items : items.filter(item => item.isPlusExclusive !== true);
}
