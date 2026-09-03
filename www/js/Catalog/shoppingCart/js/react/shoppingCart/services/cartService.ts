import { CurrentUser, ItemDetailsHydrationService, EnvironmentUrls } from 'Roblox';
import { httpService } from 'core-utilities';
import actionReducer from '../utils/actionReducer';
import {
  rand,
  fetchCartState,
  standardizeItemDetailsFromHydratedItemDetails,
  extractLimiteds
} from '../utils/cartUtils';
import {
  TCartState,
  TCartItem,
  TCartDispatcher,
  TCartAddItemAction,
  TCartAddItemsAction,
  TCartRemoveItemAction,
  TCartRefreshAction,
  TCartUpdateTimedOptionsAction,
  TCollectibleResellers,
  TCollectibleResellerItem,
  TResellerItem,
  TItemDetails,
  TCartRemoveItemsAction
} from '../constants/types';

const { economyApi } = EnvironmentUrls;

type TCartStateEventListener = {
  subscriptionId: string;
  handler: (cartState: TCartState) => any;
};
type TCartStateEventSubscription = {
  listeners: TCartStateEventListener[];
  listener: TCartStateEventListener;
  subscriptionId: string;
};

let stateChangeListeners: TCartStateEventListener[] = [];

function addStateChangeListener(
  handler: (cartState: TCartState) => any
): TCartStateEventSubscription {
  const subId = `s_${rand(8)}${Date.now()}`;
  const evtObj: TCartStateEventListener = { subscriptionId: subId, handler };
  stateChangeListeners.push(evtObj);
  return {
    listeners: stateChangeListeners,
    listener: evtObj,
    subscriptionId: subId
  };
}

function removeStateChangeListener(subId: string) {
  stateChangeListeners = stateChangeListeners.filter(
    ({ subscriptionId }) => !(subscriptionId && subscriptionId === subId)
  );
  return stateChangeListeners;
}

function emitStateChange(cartState: TCartState) {
  stateChangeListeners.forEach(({ subscriptionId, handler }) => {
    try {
      handler?.(cartState);
    } catch (err) {
      console.error('emitStateChange err:', err);
    }
  });
}

async function fetchItemDetails(items: TCartItem[] = []): Promise<TItemDetails[]> {
  const itemsBody = items.map(i => ({
    id: i.itemId,
    itemType: i.itemType
  }));

  const res = await ItemDetailsHydrationService.getItemDetails(itemsBody, false, true);
  if (res) {
    return res.map(standardizeItemDetailsFromHydratedItemDetails);
  }

  return [];
}

export async function fetchCartItemDetails(
  items: TCartItem[] = []
): Promise<Record<string, TItemDetails>> {
  const resByItemId: Record<string, TItemDetails> = {};

  if (!items?.length) {
    return resByItemId;
  }

  // Fetch each item's details independently rather than as a single batch.
  // The hydration service only returns a batch when the backend returns every
  // requested item (`resultArray.length === items.length`); a single item the
  // backend omits (e.g. an off-sale/limited item) makes the whole batch resolve
  // empty. That would leave the other items un-rehydrated, so their stale
  // cart-cached timedOptions are never overridden by fresh backend data.
  const perItemDetails = await Promise.all(
    items.map(async item => {
      try {
        return await fetchItemDetails([item]);
      } catch {
        return [] as TItemDetails[];
      }
    })
  );

  perItemDetails.forEach(details => {
    details.forEach(element => {
      resByItemId[element.id] = element;
    });
  });

  return resByItemId;
}

export async function getCollectibleResellers(
  itemId: string | number,
  collectibleItemId: string
): Promise<{
  itemId: string | number;
  collectibleItemId: string;
  resellers: TCollectibleResellerItem[];
}> {
  if (!itemId || !collectibleItemId) return { itemId, collectibleItemId, resellers: [] };
  const result = await httpService.get<TCollectibleResellers>({
    url: `${EnvironmentUrls.apiGatewayUrl}/marketplace-sales/v1/item/${collectibleItemId}/resellers?limit=30`,
    retryable: true,
    withCredentials: true
  });
  const items = (result.data?.data || []).filter(
    // remove current user's resale items
    item => item.seller?.sellerId?.toString() !== CurrentUser.userId
  );
  return { itemId, collectibleItemId, resellers: items };
}

export async function fetchLimitedItemResellers(
  itemId: number
): Promise<{ itemId: number; resellers: TResellerItem[] }> {
  if (!itemId) {
    return { itemId, resellers: [] };
  }
  const urlConf = {
    url: `${economyApi}/v1/assets/${itemId}/resellers?cursor=&limit=100`,
    withCredentials: true
  };
  const res = await httpService.get<{ data: TResellerItem[] }>(urlConf);
  if (res.status === 200 && res.data?.data) {
    return { itemId, resellers: res.data.data || [] };
  }
  return { itemId, resellers: [] };
}

export async function fetchCartItemsResellers(
  cartState: TCartState
): Promise<Record<string, Array<TResellerItem | TCollectibleResellerItem>>> {
  const resByItemId: Record<string, Array<TResellerItem | TCollectibleResellerItem>> = {};
  const { items, itemDetails } = cartState;
  const { limited1, limited2 } = extractLimiteds(cartState);

  if (!limited1.length && !limited2.length) return resByItemId;

  const limited1Resellers = limited1.length
    ? await Promise.all(limited1.map(item => fetchLimitedItemResellers(item.itemId)))
    : [];
  const limited2Resellers = limited2.length
    ? await Promise.all(
        limited2.map(item => getCollectibleResellers(item.itemId, item.collectibleItemId))
      )
    : [];

  limited1Resellers.forEach(item => {
    if (item.itemId) {
      resByItemId[item.itemId] = item.resellers;
    }
  });
  limited2Resellers.forEach(item => {
    if (item.itemId) {
      resByItemId[item.itemId] = item.resellers;
    }
  });
  return resByItemId;
}

export async function fetchCurrentUserBalance(): Promise<number | null> {
  const urlConf = {
    url: `${economyApi}/v1/users/${CurrentUser.userId}/currency`,
    withCredentials: true
  };
  const res = await httpService.get<{ robux?: number }>(urlConf);

  if (res.status === 200) {
    return res?.data?.robux ?? null;
  }
  return null;
}

export const createCartService = (() => {
  const latestCachedState: { state: TCartState } = {
    state: {
      items: [],
      selectedItems: {},
      totalPrice: null,
      currentUserBalance: null,
      resellers: {},
      itemDetails: {}
    }
  };
  function onCartStateChange(handler: (cartState: TCartState) => any) {
    const sub = addStateChangeListener(handler);
    return {
      remove: () => {
        removeStateChangeListener(sub.subscriptionId);
      }
    };
  }

  const dispatch: TCartDispatcher = async (
    evt:
      | TCartAddItemAction
      | TCartAddItemsAction
      | TCartRemoveItemAction
      | TCartRemoveItemsAction
      | TCartRefreshAction
      | TCartUpdateTimedOptionsAction
  ) => {
    const newState = await actionReducer(evt);
    if (newState) {
      latestCachedState.state = newState;
      emitStateChange(newState);
    }
  };

  return () => {
    return {
      getCartState: fetchCartState,
      onCartStateChange,
      dispatch,
      getLatestCachedState: () => latestCachedState.state
    };
  };
})();
