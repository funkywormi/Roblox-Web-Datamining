import { TSystemFeedbackService } from 'react-style-guide';
import {
  fetchCartState,
  setCartState,
  recalculateCartTotal,
  reconcileTimedOptions
} from './cartUtils';
import {
  TCartItem,
  TCartState,
  TCartAddItemAction,
  TCartAddItemsAction,
  TCartRemoveItemAction,
  TCartRemoveItemsAction,
  TCartRefreshAction,
  TCartUpdateTimedOptionsAction
} from '../constants/types';
import {
  fetchCartItemDetails,
  fetchLimitedItemResellers,
  fetchCurrentUserBalance,
  fetchCartItemsResellers
} from '../services/cartService';
import { catalogTranslations, itemTranslations } from '../services/translationService';

let systemFeedbackService: TSystemFeedbackService;

export const setSystemFeedbackService = (systemFeedback: TSystemFeedbackService) => {
  systemFeedbackService = systemFeedback;
};

async function addCartItem(action: TCartAddItemAction): Promise<TCartState> {
  const cartState = fetchCartState();

  if (!action?.item) {
    return cartState;
  }

  const existingItem = cartState.items?.find(i => i.itemId && i.itemId === action.item.itemId);

  // item already is in cart, return the current cart cartState
  if (existingItem) {
    return cartState;
  }

  const newItem: TCartItem = {
    itemId: action.item.itemId,
    itemType: action.item.itemType,
    itemName: action.item.itemName,
    collectibleItemId: action.item.collectibleItemId,
    timedOptions: action.item.timedOptions,
    addedToCardAt: Date.now()
  };

  const itemDetails = await fetchCartItemDetails([newItem]);
  const newItemDetails = cartState.itemDetails;
  newItemDetails[newItem.itemId] = itemDetails[newItem.itemId];
  const { selectedItems } = cartState;
  selectedItems[`${action.item.itemType.toLowerCase()}${action.item.itemId}`] = true;

  const newState = recalculateCartTotal({
    ...cartState,
    itemDetails: newItemDetails,
    items: [...cartState.items, newItem],
    selectedItems
  });

  setCartState(newState);
  if (action.displaySystemFeedback && systemFeedbackService !== undefined) {
    systemFeedbackService.success(
      catalogTranslations.headingItemAddedToCart({
        itemName: newItem.itemName ? newItem.itemName : ''
      }),
      0,
      2000
    );
  }

  return newState;
}

async function addCartItems(action: TCartAddItemsAction): Promise<TCartState> {
  const cartState = fetchCartState();

  if (!action?.items) {
    return cartState;
  }

  const { selectedItems } = cartState;
  const newItemDetails = cartState.itemDetails;
  const newItems = action.items
    .map(item => {
      const existingItem = cartState.items?.find(
        i => i.itemId && i.itemId === item.itemId && i.itemType === item.itemType
      );

      // item already is in cart, return the current cart cartState
      if (existingItem) {
        return null;
      }

      const newItem: TCartItem = {
        itemId: item.itemId,
        itemType: item.itemType,
        itemName: item.itemName,
        collectibleItemId: item.collectibleItemId,
        timedOptions: item.timedOptions,
        addedToCardAt: Date.now()
      };
      selectedItems[`${item.itemType.toLowerCase()}${item.itemId}`] = true;
      return newItem;
    })
    .filter(item => item !== null) as TCartItem[];

  const itemDetailsArray = await Promise.all(
    newItems.map(newItem => fetchCartItemDetails([newItem]))
  );
  itemDetailsArray.forEach((itemDetails, index) => {
    newItemDetails[newItems[index].itemId] = itemDetails[newItems[index].itemId];
  });

  const newState = recalculateCartTotal({
    ...cartState,
    itemDetails: newItemDetails,
    items: [...cartState.items, ...newItems],
    selectedItems
  });

  setCartState(newState);
  if (action.displaySystemFeedback && systemFeedbackService !== undefined) {
    systemFeedbackService.success(
      catalogTranslations.headingItemsAddedToCart({
        itemCount: `${action.items.length}`
      }),
      0,
      2000
    );
  }

  return newState;
}

function removeCartItem(action: TCartRemoveItemAction): TCartState {
  const itemId = action?.item?.itemId;
  const itemType = action?.item?.itemType;
  const state = fetchCartState();
  let removedItem: TCartItem | null;
  let removedItemName = '';
  if (!itemId) {
    return state;
  }

  const newItems = (state?.items || [])?.filter(i => {
    if (!(i.itemId && i.itemId === itemId && i.itemType && i.itemType === itemType)) {
      return true;
    }
    removedItem = i;
    removedItemName = i.itemName ? i.itemName : '';
    return false;
  });
  const { selectedItems, resellers } = state;
  delete selectedItems[`${itemType.toLowerCase()}${itemId}`];
  delete resellers[itemId];
  const newState = recalculateCartTotal({
    ...state,
    selectedItems: { ...selectedItems },
    resellers: { ...resellers },
    items: newItems
  });

  setCartState(newState);

  if (action.displaySystemFeedback && systemFeedbackService !== undefined) {
    systemFeedbackService.success(
      catalogTranslations.headingItemRemovedFromCart({
        itemName: removedItemName
      }),
      0,
      2000
    );
  }

  return newState;
}

function removeCartItems(action: TCartRemoveItemsAction): TCartState {
  const state = fetchCartState();
  const { selectedItems, resellers } = state;
  let newItems = state.items;

  action.items.forEach(item => {
    const itemId = item?.itemId;
    const itemType = item?.itemType;

    let removedItem: TCartItem | null;
    let removedItemName = '';
    if (!itemId) {
      return false;
    }

    newItems = (newItems || [])?.filter(i => {
      if (!(i.itemId && i.itemId === itemId && i.itemType && i.itemType === itemType)) {
        return true;
      }
      removedItem = i;
      removedItemName = i.itemName ? i.itemName : '';
      return false;
    });

    delete selectedItems[`${itemType.toLowerCase()}${itemId}`];
    delete resellers[itemId];
    return true;
  });

  const newState = recalculateCartTotal({
    ...state,
    selectedItems: { ...selectedItems },
    resellers: { ...resellers },
    items: newItems
  });

  setCartState(newState);

  if (action.displaySystemFeedback && systemFeedbackService !== undefined) {
    systemFeedbackService.success(
      catalogTranslations.headingItemsRemovedFromCart({
        itemCount: `${action.items.length}`
      }),
      0,
      2000
    );
  }

  return newState;
}

export async function refreshCartState(): Promise<TCartState> {
  const initialCartState = fetchCartState();
  try {
    const state = {
      items: initialCartState.items,
      selectedItems: initialCartState.selectedItems,
      totalPrice: initialCartState.totalPrice,
      currentUserBalance: initialCartState.currentUserBalance,
      resellers: initialCartState.resellers,
      itemDetails: initialCartState.itemDetails
    };
    if (!state.items) {
      state.items = [];
    }

    if (state.items?.length) {
      const itemDetails = await fetchCartItemDetails(state.items);

      // Persist the fresh backend item details first. This is the source of
      // truth for the timed-option UI treatment, so it must survive even if a
      // later (supplementary) step throws and we fall back to `initialCartState`.
      if (Object.keys(itemDetails).length) {
        state.itemDetails = {
          ...state.itemDetails,
          ...itemDetails
        };
      }

      state.items = state.items.map(item => {
        const iDetails = itemDetails?.[item.itemId];
        if (!iDetails) return item;
        // Override any stale cached timed-option data when it no longer matches
        // what the backend returns. Reconciliation must never abort the whole
        // refresh (which would leave every item showing stale data), so failures
        // fall back to the item's persisted timed options.
        let { timedOptions } = item;
        try {
          timedOptions = reconcileTimedOptions(item.timedOptions, iDetails);
        } catch {
          // Keep the persisted timed options for this item.
        }
        const newItem: TCartItem = {
          ...item,
          itemName: iDetails.name,
          collectibleItemId: iDetails.collectibleItemId || null,
          timedOptions
        };
        return newItem;
      });

      // Resellers are supplementary. A failure here must not discard the
      // freshly fetched item details / reconciled timed options above,
      // otherwise items already in the cart keep rendering stale cached
      // timed-option data (e.g. a full dropdown after the backend has trimmed
      // the options down).
      try {
        const resellers = await fetchCartItemsResellers(state);
        if (Object.keys(resellers).length) {
          state.resellers = {
            ...state.resellers,
            ...resellers
          };
        }
      } catch {
        // Keep previously cached resellers.
      }
    }
    const itemIds = state.items.map(i => i.itemId.toString());
    const itemDetailsKeys = Object.keys(state.itemDetails);
    const resellersKeys = Object.keys(state.resellers);
    if (itemIds.length !== itemDetailsKeys.length) {
      itemDetailsKeys.forEach(k => {
        if (!itemIds.includes(k)) {
          delete state.itemDetails[k];
        }
      });
    }
    if (itemIds.length !== resellersKeys.length) {
      resellersKeys.forEach(k => {
        if (!itemIds.includes(k)) {
          delete state.resellers[k];
        }
      });
    }

    // Balance is supplementary too; don't let a balance fetch failure discard
    // the reconciled cart state (which would leave stale timed-option data in
    // the UI for items already in the cart).
    try {
      const currentBalance = await fetchCurrentUserBalance();
      state.currentUserBalance = currentBalance;
    } catch {
      // Keep previously cached balance.
    }

    let finalState: TCartState;
    try {
      finalState = recalculateCartTotal(state);
    } catch {
      // If total recalculation fails, still persist the refreshed item details
      // and reconciled items rather than reverting to the stale cached state.
      finalState = state as TCartState;
    }
    setCartState(finalState);
    return finalState;
  } catch {
    // If anything in the refresh fails unexpectedly, keep the last good state.
    return initialCartState;
  }
}

function updateTimedOptions(action: TCartUpdateTimedOptionsAction): TCartState {
  const cartState = fetchCartState();

  const updatedItems = cartState.items.map(item => {
    if (item.itemId === action.itemId && item.itemType === action.itemType) {
      const updatedTimedOptions = item.timedOptions?.map(option => ({
        ...option,
        selected: option.days === action.selectedDays
      }));

      return {
        ...item,
        timedOptions: updatedTimedOptions
      };
    }
    return item;
  });

  const newState = recalculateCartTotal({
    ...cartState,
    items: updatedItems
  });

  setCartState(newState);
  return newState;
}

export default async function actionReducer(
  action:
    | TCartAddItemAction
    | TCartRemoveItemAction
    | TCartRemoveItemsAction
    | TCartRefreshAction
    | TCartAddItemsAction
    | TCartUpdateTimedOptionsAction
): Promise<TCartState | void> {
  if (!action?.type) {
    return console.error(`reducer action missing a "type" property`, action);
  }
  if (action.type === 'ADD_ITEM') {
    return addCartItem(action);
  }
  if (action.type === 'ADD_ITEMS') {
    return addCartItems(action);
  }
  if (action.type === 'REMOVE_ITEM') {
    return removeCartItem(action);
  }
  if (action.type === 'REMOVE_ITEMS') {
    return removeCartItems(action);
  }
  if (action.type === 'REFRESH_CART') {
    return refreshCartState();
  }
  if (action.type === 'UPDATE_TIMED_OPTIONS') {
    return updateTimedOptions(action);
  }
  return console.error(`reducer action unknown a "type" property`, action);
}
