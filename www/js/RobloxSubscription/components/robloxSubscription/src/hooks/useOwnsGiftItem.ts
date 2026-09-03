import { userId } from "@rbx/core-scripts/meta/user";
import { useQuery } from "@tanstack/react-query";

import { getIsItemOwned } from "../clients/inventory";
import { GIFT_ITEM } from "../utils/giftItemNavigation";

export const useOwnsGiftItem = () => {
  const currentUserId = userId();

  return useQuery({
    queryKey: ["owns-gift-item", currentUserId, GIFT_ITEM.itemId, GIFT_ITEM.itemType],
    queryFn: () => {
      if (currentUserId == null) {
        throw new Error("Cannot check gift item ownership without a user id");
      }

      return getIsItemOwned(currentUserId, GIFT_ITEM);
    },
    enabled: currentUserId != null,
  });
};
