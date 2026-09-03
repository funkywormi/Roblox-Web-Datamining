import { AXAnalyticsService, AXSendTrackingActionType } from 'Roblox';

const { AXAnalyticsConstants } = AXAnalyticsService;

/**
 * Where an item card was rendered when it was clicked. Sent as `source` in the
 * ItemCardClick telemetry metadata so a single counter can be sliced by origin.
 */
export enum TItemCardSource {
  Catalog = 'Catalog',
  ItemDetailsRecommendations = 'ItemDetailsRecommendations',
  ItemDetailsBundleContents = 'ItemDetailsBundleContents',
  ComplimentaryItemRecommendations = 'ComplimentaryItemRecommendations',
  LookDetailsContents = 'LookDetailsContents'
}

/** Where a cart add/remove interaction was triggered from. */
export enum TCartActionSource {
  CatalogItemCard = 'CatalogItemCard',
  ItemDetailsPage = 'ItemDetailsPage',
  LookDetails = 'LookDetails',
  ShoppingCartModal = 'ShoppingCartModal',
  PostPurchase = 'PostPurchase'
}

/** How the next page of catalog results was requested. */
export enum TPaginationMode {
  InfiniteScroll = 'InfiniteScroll',
  LoadMore = 'LoadMore'
}

/** How the shopping cart was closed. */
export enum TCartCloseReason {
  ToggleButton = 'ToggleButton',
  ClickOutside = 'ClickOutside'
}

/** Which purchase surface a buy button belongs to. */
export enum TPurchaseSource {
  ItemDetailsPage = 'ItemDetailsPage',
  ShoppingCart = 'ShoppingCart',
  LookDetails = 'LookDetails',
  CurrentWearing = 'CurrentWearing',
  DirectResale = 'DirectResale'
}

type TTrackedItem = {
  itemId?: number;
  itemType?: string;
};

// The AX telemetry schema only exposes `totalValue` and `metaData` columns, so
// all custom dimensions are packed into `metaData` as a JSON string. This
// mirrors how the existing purchase-success events send their params.
const sendClickEvent = (
  itemName: string,
  metaData?: Record<string, string | number | boolean | undefined>
): void => {
  if (!itemName) {
    return;
  }
  AXAnalyticsService.sendAXTracking({
    itemName,
    actionType: AXSendTrackingActionType.Click,
    metaData: metaData ? { metaData: JSON.stringify(metaData) } : undefined
  });
};

export const trackItemCardClick = (source: TItemCardSource, item: TTrackedItem): void => {
  sendClickEvent(AXAnalyticsConstants.ItemCardClick, {
    source,
    itemId: item.itemId,
    itemType: item.itemType
  });
};

export const trackCatalogFilterClick = (
  filterType: string,
  value?: string | number | boolean,
  isSearch = false
): void => {
  sendClickEvent(AXAnalyticsConstants.CatalogFilterClick, {
    filterType,
    value,
    isSearch
  });
};

export const trackCatalogSearchClick = (keyword: string): void => {
  sendClickEvent(AXAnalyticsConstants.CatalogSearchClick, {
    keyword
  });
};

export const trackCatalogPaginationClick = (mode: TPaginationMode): void => {
  sendClickEvent(AXAnalyticsConstants.CatalogPaginationClick, {
    mode
  });
};

export const trackShoppingCartAddClick = (source: TCartActionSource, item: TTrackedItem): void => {
  sendClickEvent(AXAnalyticsConstants.ShoppingCartAddClick, {
    source,
    itemId: item.itemId,
    itemType: item.itemType
  });
};

export const trackShoppingCartRemoveClick = (
  source: TCartActionSource,
  item: TTrackedItem
): void => {
  sendClickEvent(AXAnalyticsConstants.ShoppingCartRemoveClick, {
    source,
    itemId: item.itemId,
    itemType: item.itemType
  });
};

export const trackShoppingCartOpenClick = (): void => {
  sendClickEvent(AXAnalyticsConstants.ShoppingCartOpenClick);
};

export const trackShoppingCartCloseClick = (reason: TCartCloseReason): void => {
  sendClickEvent(AXAnalyticsConstants.ShoppingCartCloseClick, { reason });
};

// Mirrors the params sent by the purchase-success events so the click carries
// the same item and user metadata. `transactionItems` is a JSON string of the
// per-item details (itemType, subType, itemId, isLimited, ...).
type TPurchaseMeta = {
  totalTransactionValue?: number;
  transactionItems?: string;
  purchaseType?: string;
  userId?: number;
};

export const trackPurchaseButtonClick = (source: TPurchaseSource, meta?: TPurchaseMeta): void => {
  sendClickEvent(AXAnalyticsConstants.PurchaseButtonClick, { source, ...meta });
};
