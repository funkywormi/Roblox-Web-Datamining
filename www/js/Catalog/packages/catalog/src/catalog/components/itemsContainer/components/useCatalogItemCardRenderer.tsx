import { useCallback, useEffect, type JSX } from "react";
import { ShoppingCardProps } from "react-style-guide";
import { ItemWithDetails } from "../../../constants/types";
import useShoppingCart from "../../../../shoppingCart/hooks/useShoppingCart";
import {
  trackShoppingCartAddClick,
  trackShoppingCartRemoveClick,
  TCartActionSource,
} from "../../../../analytics/axTrackingEvents";
import { prefetchAnimationItemCardHoverPreviewIxp } from "../../../hooks/useAnimationItemCardHoverPreviewIxp";
import CatalogItemCard from "./CatalogItemCard";

export type CatalogItemCardRendererOptions = {
  enableThumbnailPrice?: boolean;
  enableCatalogRevampExperiment?: boolean;
};

/**
 * Returns a renderer for the catalog item card so cart, pricing, and click tracking stay
 * identical wherever search results are rendered.
 */
const useCatalogItemCardRenderer = ({
  enableThumbnailPrice,
  enableCatalogRevampExperiment,
}: CatalogItemCardRendererOptions): ((item: ItemWithDetails) => JSX.Element) => {
  const { isItemInCart, addItemToCart, removeItemFromCart } = useShoppingCart();

  // Warm IXP before cards mount so the first hover is not racing enrollment.
  useEffect(() => {
    // eslint-disable-next-line @rbx/promises/prefer-query-mutation, no-void -- fire-and-forget warm
    void prefetchAnimationItemCardHoverPreviewIxp();
  }, []);

  return useCallback(
    (item: ItemWithDetails) => {
      const shoppingCartProps: ShoppingCardProps = {
        isItemInCart: isItemInCart(item.id),
        addItemToCart: (itemInfo, displaySystemFeedback) => {
          trackShoppingCartAddClick(TCartActionSource.CatalogItemCard, {
            itemId: itemInfo.itemId,
            itemType: itemInfo.itemType,
          });
          return addItemToCart(itemInfo, displaySystemFeedback);
        },
        removeItemFromCart: (itemId, itemType, displaySystemFeedback) => {
          trackShoppingCartRemoveClick(TCartActionSource.CatalogItemCard, { itemId, itemType });
          return removeItemFromCart(itemId, itemType, displaySystemFeedback);
        },
      };

      return (
        <CatalogItemCard
          key={`${item.itemType}_${item.id}`}
          item={item}
          shoppingCartProps={shoppingCartProps}
          enableThumbnailPrice={enableThumbnailPrice}
          enableCatalogRevampExperiment={enableCatalogRevampExperiment}
        />
      );
    },
    [
      addItemToCart,
      enableCatalogRevampExperiment,
      enableThumbnailPrice,
      isItemInCart,
      removeItemFromCart,
    ],
  );
};

export default useCatalogItemCardRenderer;
