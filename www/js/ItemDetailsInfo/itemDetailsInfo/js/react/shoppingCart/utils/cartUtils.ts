import { CurrentUser, TDetailEntry, EnvironmentUrls, TDiscountInformation } from 'Roblox';
import { localStorageService } from 'core-roblox-utilities';
import { seoName } from 'core-utilities';
import {
  TCartState,
  TCartItem,
  TItemDetails,
  TUnsanitizedItemDetails,
  TTimedOption
} from '../constants/types';
import { urlConfigs, itemTypes } from '../constants/shoppingCartConstants';

export const rand = (() => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return (size = 12) => {
    let randomChars = '';

    for (let i = 0; i < size; i++)
      randomChars += chars.charAt(Math.floor(Math.random() * chars.length));

    return randomChars;
  };
})();

function getCartStorageKey() {
  const userId = CurrentUser.isAuthenticated && CurrentUser.userId;
  return `Roblox.AvatarMarketplace.Cart:${userId || ''}`;
}

export function fetchCartState(): TCartState {
  const key = getCartStorageKey();
  return {
    totalPrice: null,
    currentUserBalance: null,
    items: [],
    selectedItems: {},
    resellers: {},
    purchaseParams: {},
    itemDetails: {},
    ...localStorageService.getLocalStorage(key)
  } as TCartState;
}

export function setCartState(obj: TCartState): void {
  const key = getCartStorageKey();
  localStorageService.setLocalStorage(key, obj);
}

/**
 * Processes timed options to ensure the permanent option is included.
 * Similar to getTimedOptions from itemDetailsHydrationServiceUtils.
 */
export function processTimedOptionsForCart(
  timedOptions: TTimedOption[] | undefined,
  itemPrice: number,
  permanentPriceDiscountInformation?: TDiscountInformation
): TTimedOption[] | undefined {
  if (timedOptions === undefined || timedOptions === null || timedOptions.length === 0) {
    return undefined;
  }

  // Create a copy to avoid mutating the original array
  const processedOptions = [...timedOptions];

  // Check if permanent option (days: 0) already exists
  const hasPermanentOption = processedOptions.some(option => option.days === 0);

  if (!hasPermanentOption) {
    const timedOptionSelected = processedOptions.find(option => option.selected);

    // Add permanent option at the beginning
    processedOptions.unshift({
      days: 0,
      price: itemPrice ?? 0,
      selected: !timedOptionSelected,
      discountInformation: permanentPriceDiscountInformation
    });
  }

  return processedOptions;
}

export function getItemPrice(itemDetail: TItemDetails, timedOptions?: TTimedOption[]): number {
  let expectedPrice = itemDetail.lowestPrice;

  if (
    itemDetail.collectibleItemId !== undefined &&
    itemDetail.collectibleItemDetails?.saleLocationType === 'ExperiencesDevApiOnly'
  ) {
    expectedPrice = itemDetail.collectibleItemDetails.lowestResalePrice;
  } else if (
    CurrentUser.isPremiumUser &&
    itemDetail.premiumPricing !== undefined &&
    itemDetail.premiumPricing?.premiumPriceInRobux !== undefined
  ) {
    expectedPrice = itemDetail.premiumPricing?.premiumPriceInRobux;
  } else if (expectedPrice === undefined) {
    expectedPrice = itemDetail.price;
  }

  // Handle timed options - always price against the latest item details.
  // A creator can remove an item's timed options (or a specific duration) after
  // it was added to the cart, which leaves stale timedOptions persisted in cart
  // state. Only honor a persisted selection when the current item details still
  // offer that duration; otherwise fall back to the base price computed above
  // (the permanent/lowest price) instead of trusting the stale persisted price.
  if (timedOptions && timedOptions.length > 0 && itemDetail.timedOptions?.length) {
    const selectedOption = timedOptions.find(option => option.selected) ?? timedOptions[0];
    const matchingTimedOption = itemDetail.timedOptions.find(
      opt => opt.days === selectedOption?.days
    );
    if (matchingTimedOption) {
      expectedPrice = matchingTimedOption.price;
    }
  }

  return expectedPrice || 0;
}

/**
 * Compares two sets of timed options by their backend-owned data (duration,
 * price and discount original price), ignoring the user-owned `selected` flag.
 * Used to detect when persisted cart data has drifted from what the backend
 * currently returns.
 */
function timedOptionsDataMatches(
  a: TTimedOption[] | undefined,
  b: TTimedOption[] | undefined
): boolean {
  const optionsA = a ?? [];
  const optionsB = b ?? [];
  if (optionsA.length !== optionsB.length) {
    return false;
  }
  const toKey = (option: TTimedOption) =>
    `${option.days}:${option.price}:${option.discountInformation?.originalPrice ?? ''}`;
  const keysA = optionsA.map(toKey).sort();
  const keysB = optionsB.map(toKey).sort();
  return keysA.every((key, index) => key === keysB[index]);
}

/**
 * Reconciles a cart item's persisted timed options against the latest item
 * details returned from the backend. If the cached timed-option data no longer
 * matches the backend (durations added/removed, or price/discount changes) the
 * cache is overridden with the backend data. The user's previously selected
 * duration is preserved when it still exists; otherwise the selection falls
 * back to the permanent option.
 */
export function reconcileTimedOptions(
  cachedTimedOptions: TTimedOption[] | undefined,
  itemDetail: TItemDetails | undefined
): TTimedOption[] | undefined {
  const backendTimedOptions = itemDetail?.timedOptions;

  // Backend no longer offers timed options for this item -> drop the cache.
  if (!itemDetail || !backendTimedOptions || backendTimedOptions.length === 0) {
    return undefined;
  }

  // Build the authoritative option set from backend data (includes permanent).
  const freshOptions = processTimedOptionsForCart(
    backendTimedOptions,
    getItemPrice(itemDetail),
    itemDetail.discountInformation
  );
  if (!freshOptions || freshOptions.length === 0) {
    return undefined;
  }

  // Cache already matches the backend data -> keep it (preserves selection).
  if (timedOptionsDataMatches(cachedTimedOptions, freshOptions)) {
    return cachedTimedOptions;
  }

  // Data drifted -> override cache, preserving the selected duration when it
  // still exists, otherwise defaulting to the permanent option (days: 0).
  const previouslySelectedDays = cachedTimedOptions?.find(option => option.selected)?.days ?? null;
  const selectedDaysStillExists =
    previouslySelectedDays !== null &&
    freshOptions.some(option => option.days === previouslySelectedDays);
  const selectedDays = selectedDaysStillExists ? previouslySelectedDays : 0;

  return freshOptions.map(option => ({
    ...option,
    selected: option.days === selectedDays
  }));
}

export function recalculateCartTotal(cartState: TCartState): TCartState {
  const { items, itemDetails } = cartState;
  const totalPrice = items.reduce((acc, item) => {
    const itemDetail = itemDetails[item.itemId];
    if (itemDetail === undefined) {
      return acc;
    }
    let expectedPrice = getItemPrice(itemDetail, item.timedOptions);
    if (expectedPrice < 0) {
      expectedPrice = 0;
    }
    return acc + (expectedPrice || 0);
  }, 0);
  return { ...cartState, totalPrice };
}

export function recalculateCartTotalFromSelectedItems(
  cartState: TCartState,
  items: TCartItem[]
): number {
  const { itemDetails } = cartState;
  const totalPrice = items.reduce((acc, item) => {
    const itemDetail = itemDetails[item.itemId];
    if (itemDetail === undefined) {
      return acc;
    }
    let expectedPrice = getItemPrice(itemDetails[item.itemId], item.timedOptions);
    if (expectedPrice < 0) {
      expectedPrice = 0;
    }
    return acc + (expectedPrice || 0);
  }, 0);
  return totalPrice;
}

export function calculateOriginalPrice(cartState: TCartState, items: TCartItem[]): number {
  const { itemDetails } = cartState;
  const totalPrice = items.reduce((acc, item) => {
    const itemDetail = itemDetails[item.itemId];
    if (!itemDetail) return acc;

    let discountInfo = itemDetail.discountInformation;

    // When the user has selected a timed option, use that option's discount info (not the base)
    const selectedTimedOption = item.timedOptions?.find(option => option.selected);
    if (selectedTimedOption && itemDetail.timedOptions) {
      const matchingTimedOption = itemDetail.timedOptions.find(
        opt => opt.days === selectedTimedOption.days
      );
      if (matchingTimedOption) {
        discountInfo = matchingTimedOption.discountInformation;
      }
    }

    // Use originalPrice from discountInformation, fallback to regular price
    const originalPrice =
      discountInfo?.originalPrice ?? itemDetail.lowestPrice ?? itemDetail.price ?? 0;

    return acc + Math.max(originalPrice, 0);
  }, 0);
  return totalPrice;
}

export const isBundle = (item: TCartItem): boolean => item.itemType?.toLowerCase() === 'bundle';

export function standardizeCartItem(item: TUnsanitizedItemDetails): TCartItem {
  return {
    ...item,
    itemId: item.itemId || item.id || item.itemTargetId,
    itemName: item.name ?? item.itemName
  };
}

export function standardizeItemDetails(item: TUnsanitizedItemDetails): TItemDetails {
  return {
    ...item,
    id: item.itemId || item.id || item.itemTargetId
  };
}

export function standardizeItemDetailsFromHydratedItemDetails(item: TDetailEntry): TItemDetails {
  return {
    ...item,
    creatorType: item.creatorType === 'Group' ? 'Group' : 'User',
    itemType: item.itemType === 'Bundle' ? 'Bundle' : 'Asset',
    price: item.price === undefined ? -1 : item.price,
    bundledItems: []
  };
}

// splits an array of items into 2 arrays, grouped by whether it is a collectible item or not
export function splitItemsByCollectible(items: TCartItem[] = []): TCartItem[][] {
  const itemTypeCategorizer = ([legacyItems, collectibleItems]: TCartItem[][], item: TCartItem) =>
    item.collectibleItemId
      ? [legacyItems, [...collectibleItems, item]]
      : [[...legacyItems, item], collectibleItems];

  return items.reduce(itemTypeCategorizer, [[], []]);
}

type TExtractedLimited2Item = TCartItem & {
  collectibleItemId: string;
};

type TExtractedLimiteds = {
  limited1: TCartItem[];
  limited2: TExtractedLimited2Item[];
};
export function extractLimiteds(cartState: TCartState): TExtractedLimiteds {
  const { items, itemDetails } = cartState;
  const itemTypeCategorizer = ({ limited1, limited2 }: TExtractedLimiteds, item: TCartItem) => {
    const details = itemDetails[item.itemId];
    const collectibleItemId = item.collectibleItemId || details.collectibleItemId;
    if (collectibleItemId) {
      const l2Item: TExtractedLimited2Item = { ...item, collectibleItemId };
      return { limited1, limited2: [...limited2, l2Item] };
    }
    if (
      details?.itemRestrictions.includes('Limited') ||
      details?.itemRestrictions.includes('LimitedUnique')
    ) {
      return { limited1: [...limited1, item], limited2 };
    }
    return { limited1, limited2 };
  };

  return items.reduce(itemTypeCategorizer, { limited1: [], limited2: [] });
}

function doesDomElementContainQuerySelector(target: Element, selector: string): boolean {
  const elms = document.querySelectorAll(selector);
  if (elms?.length) {
    for (let i = 0; i < elms.length; i++) {
      const elm = elms[i];
      if (elm.contains?.(target)) {
        return true;
      }
    }
  }
  return false;
}

export function isDomElementInShoppingCart(target: Element): boolean {
  const checks = {
    cartBtn: doesDomElementContainQuerySelector(target, '.shopping-cart-btn'),
    modalBackdrop: doesDomElementContainQuerySelector(target, '.modal-backdrop.in'),
    modal: doesDomElementContainQuerySelector(target, '.in.modal'),
    addRemoveBtn: doesDomElementContainQuerySelector(target, '.add-to-cart-btn-container'),
    modalContainer: doesDomElementContainQuerySelector(target, '.shopping-cart-modal-container'),
    timedOptionsDropdown: doesDomElementContainQuerySelector(
      target,
      '.shopping-cart-timed-options-dropdown'
    ),
    roleMenu: target.closest('[role="menu"]') !== null,
    roleMenuItem: target.closest('[role="menuitem"]') !== null,
    floatingPortal: target.closest('[data-floating-ui-portal]') !== null,
    rbxDropdown: target.classList.contains('rbx-dropdown'),
    rbxMenu: target.classList.contains('rbx-menu'),
    rbxMenuItem: target.classList.contains('rbx-menu-item'),
    closestRbxDropdown: target.closest('.rbx-dropdown') !== null,
    closestRbxMenu: target.closest('.rbx-menu') !== null,
    closestRbxMenuItem: target.closest('.rbx-menu-item') !== null,
    closestTimedOptions: target.closest('.shopping-cart-timed-options-dropdown') !== null
  };

  return (
    checks.cartBtn ||
    checks.modalBackdrop ||
    checks.modal ||
    checks.addRemoveBtn ||
    checks.modalContainer ||
    checks.timedOptionsDropdown ||
    checks.roleMenu ||
    checks.roleMenuItem ||
    checks.floatingPortal ||
    checks.rbxDropdown ||
    checks.rbxMenu ||
    checks.rbxMenuItem ||
    checks.closestRbxDropdown ||
    checks.closestRbxMenu ||
    checks.closestRbxMenuItem ||
    checks.closestTimedOptions
  );
}

export const checkIfBundle = (itemType: string): boolean => {
  const simplifiedType = itemType.toLowerCase();

  return simplifiedType.includes(itemTypes.bundle);
};

export const getItemLink = (itemId: number, itemName: string, itemType: string): string => {
  let urlType = urlConfigs.assetRootUrlTemplate;
  if (checkIfBundle(itemType)) {
    urlType = urlConfigs.bundleRootUrlTemplate;
  }
  return `${EnvironmentUrls.websiteUrl}/${urlType}/${itemId}/${seoName.formatSeoName(itemName)}`;
};
