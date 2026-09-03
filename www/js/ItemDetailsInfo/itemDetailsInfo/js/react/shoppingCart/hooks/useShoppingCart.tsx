import { useState, useEffect, useCallback } from 'react';
import { createCartService, fetchCartItemDetails } from '../services/cartService';
import { refreshCartAction } from '../utils/actions';
import { TCartState, TItemDetails, TCartItem, TCartDispatcher } from '../constants/types';

const { getCartState, onCartStateChange, dispatch, getLatestCachedState } = createCartService();

// // We create a hash so any other hooks downstream can use it for memoization and
// // don't have to keep fetching item details for other state changes.
// //
// // `btoa`` converts string to base64.
// //   See: https://developer.mozilla.org/en-US/docs/Web/API/btoa
// function genItemDetailsHash(itemIds = []) {
//   if (!itemIds || !itemIds?.length) {
//     return btoa('');
//   }
//   return btoa(itemIds.sort().join(','));
// }

export function useCartItemDetails(
  items: TCartItem[]
): {
  itemDetails: Record<string, TItemDetails>;
} {
  const [itemDetails, setItemDetails] = useState<Record<string, TItemDetails>>({});
  const itemIds = items?.map?.(item => item.itemId)?.sort?.() || [];

  useEffect(() => {
    (async () => {
      if (!itemIds.length) return;

      const unfetchedItems = items.filter(item => !itemDetails[item.itemId]);
      if (!unfetchedItems?.length) {
        return;
      }

      const tempItemDetails = {};
      const itemDetailsRes = await fetchCartItemDetails(unfetchedItems);
      const itemDetailsKeys = Object.keys(itemDetailsRes);

      itemDetailsKeys.forEach(k => {
        tempItemDetails[k] = itemDetailsRes[k];
      });

      const newItemDetails = {
        ...itemDetails,
        ...tempItemDetails
      };

      setItemDetails(newItemDetails);
    })().catch(() => {
      console.error('could not refresh cart state');
    });
  }, [itemIds.join(',')]);

  return { itemDetails };
}

export default function useShoppingCart(): {
  dispatch: TCartDispatcher;
  cart: TCartState;
  isItemInCart: (itemId: number) => boolean;
  addItemToCart: (item: TCartItem, displaySystemFeedback?: boolean) => Promise<void>;
  addItemsToCart: (items: Array<TCartItem>, displaySystemFeedback?: boolean) => Promise<void>;
  removeItemFromCart: (
    itemId: number,
    itemType: string,
    displaySystemFeedback?: boolean
  ) => Promise<void>;
  removeItemsFromCart: (items: Array<TCartItem>, displaySystemFeedback?: boolean) => Promise<void>;
} {
  const [cart, setCartState] = useState<TCartState>(getLatestCachedState());
  const itemIds = cart.items.map(i => i.itemId).sort();

  useEffect(() => {
    const freshCartState = getCartState();
    setCartState(freshCartState);
    dispatch(refreshCartAction()).catch(() => {
      console.error('could not refresh cart state');
    });
  }, []);

  useEffect(() => {
    const listener = onCartStateChange(s => setCartState(s));
    return () => listener?.remove?.();
  }, []);

  const isItemInCart = useCallback(
    (itemId: number) => {
      return itemIds.includes(itemId);
    },
    [JSON.stringify(itemIds)]
  );

  const addItemToCart = async (item: TCartItem, displaySystemFeedback?: boolean) => {
    await dispatch({ type: 'ADD_ITEM', item, displaySystemFeedback });
    return dispatch(refreshCartAction());
  };

  const addItemsToCart = async (items: Array<TCartItem>, displaySystemFeedback?: boolean) => {
    await dispatch({ type: 'ADD_ITEMS', items, displaySystemFeedback });
    return dispatch(refreshCartAction());
  };

  const removeItemFromCart = async (
    itemId: number,
    itemType: string,
    displaySystemFeedback?: boolean
  ) => {
    await dispatch({ type: 'REMOVE_ITEM', item: { itemId, itemType }, displaySystemFeedback });
    return dispatch(refreshCartAction());
  };

  const removeItemsFromCart = async (items: Array<TCartItem>, displaySystemFeedback?: boolean) => {
    await dispatch({ type: 'REMOVE_ITEMS', items, displaySystemFeedback });
    return dispatch(refreshCartAction());
  };

  return {
    dispatch,
    cart,
    isItemInCart,
    addItemToCart,
    addItemsToCart,
    removeItemFromCart,
    removeItemsFromCart
  };
}
