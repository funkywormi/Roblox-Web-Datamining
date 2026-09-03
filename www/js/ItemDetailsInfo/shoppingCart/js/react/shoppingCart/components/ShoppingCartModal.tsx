/* eslint-disable jsx-a11y/control-has-associated-label */
// For passing SystemFeedbackService
/* eslint-disable react/destructuring-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// For checkbox not working with its label
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import * as Thumbnails from 'roblox-thumbnails';
import { numberFormat, escapeHtml } from 'core-utilities';
import { BatchBuyPriceContainer } from 'roblox-item-purchase';
import { CurrentUser, TDetailEntry, AXAnalyticsService, AXSendTrackingActionType } from 'Roblox';
import { Button, ScrollBar } from 'react-style-guide';
import { eventStreamService, paymentFlowAnalyticsService } from 'core-roblox-utilities';
import { Dropdown, Menu, MenuSection, MenuItem, Icon } from '@rbx/foundation-ui';
import useShoppingCart from '../hooks/useShoppingCart';
import useSubscriptionStatus from '../hooks/useSubscriptionStatus';
import { removeItemAction } from '../utils/actions';
import {
  TItemDetails,
  TCartDispatcher,
  TCartItem,
  TTimedOption,
  TSubscriptionStatus
} from '../constants/types';
import { catalogTranslations, itemTranslations } from '../services/translationService';
import '../../../../css/shoppingCart/shoppingCart.scss';
import {
  isDomElementInShoppingCart,
  recalculateCartTotalFromSelectedItems,
  calculateOriginalPrice,
  setCartState,
  fetchCartState,
  getItemLink,
  getItemPrice
} from '../utils/cartUtils';
import shoppingCartConstants from '../constants/shoppingCartConstants';
import SubscribeUpsellContainer from './SubscribeUpsellContainer';
import {
  trackShoppingCartRemoveClick,
  trackShoppingCartCloseClick,
  trackPurchaseButtonClick,
  TCartActionSource,
  TCartCloseReason,
  TPurchaseSource
} from '../../analytics/axTrackingEvents';

const { AXAnalyticsConstants } = AXAnalyticsService;
const { Thumbnail2d, DefaultThumbnailSize, ThumbnailTypes, ThumbnailFormat } = Thumbnails;
type TPurchaseDataResult = {
  itemData: {
    assetId: number;
    bundleId: number;
  };
  reason: string;
};
type TBatchPurchaseItem = {
  id: number;
  itemType: string;
  timedOption?: TTimedOption;
};
type TPurchaseEventItem = {
  itemType: string;
  subType: number;
  itemId: number;
  price: number;
  resalePurchase: boolean;
  isLimited: boolean;
  isTimedOptionPurchase: boolean;
};

function ItemPrice({ item, itemDetails }: { item: TCartItem; itemDetails: TItemDetails }) {
  let expectedPrice = getItemPrice(itemDetails);
  let originalPrice: number | null = null;
  let discountInfo = itemDetails.discountInformation;

  // Check if this is a timed option item. A creator can remove an item's timed
  // options after it was added to the cart, so only trust a persisted
  // selection when the latest item details still offer that duration. When the
  // item no longer has timed options, keep the base price computed above rather
  // than displaying the stale persisted timed-option price.
  if (item.timedOptions && item.timedOptions.length > 0 && itemDetails.timedOptions?.length) {
    const selectedTimedOption = item.timedOptions.find(opt => opt.selected);
    const selectedDays = selectedTimedOption?.days ?? item.timedOptions[0]?.days;

    const matchingTimedOption = itemDetails.timedOptions.find(opt => opt.days === selectedDays);
    if (matchingTimedOption) {
      // Use the discounted price from API if available
      expectedPrice = matchingTimedOption.price;
      discountInfo = matchingTimedOption.discountInformation;
    }
  }

  // Determine if this is a resale purchase (no original stock or resale price is lower)
  // For collectibles, purchaseInfo may not be set, so we check manually
  const collectible = itemDetails.collectibleItemDetails;
  const noOriginalCopiesAvailable =
    collectible?.unitsAvailableForConsumption === 0 ||
    itemDetails.unitsAvailableForConsumption === 0;
  const resalePriceIsLower =
    collectible?.lowestResalePrice !== undefined &&
    collectible.lowestResalePrice > 0 &&
    collectible.lowestResalePrice < (collectible.price ?? Infinity);
  const isResalePurchase =
    itemDetails.purchaseInfo?.purchaseFromReseller === true ||
    (itemDetails.collectibleItemId !== undefined &&
      itemDetails.hasResellers &&
      (noOriginalCopiesAvailable ||
        resalePriceIsLower ||
        itemDetails.saleLocationType === 'ExperiencesDevApiOnly'));

  // Get original price before discount (but not for resale purchases)
  if (discountInfo?.originalPrice && !isResalePurchase) {
    originalPrice = discountInfo.originalPrice;
  }

  if (itemDetails.collectibleItemId !== undefined) {
    const isMarketPlaceEnabled =
      itemDetails.saleLocationType === 'ShopAndAllExperiences' ||
      itemDetails.saleLocationType === 'ShopAndExperiencesById' ||
      itemDetails.saleLocationType === 'ShopOnly';
    const { hasResellers } = itemDetails;

    if (!isMarketPlaceEnabled && !hasResellers) {
      return (
        <div className='item-price'>
          <span className='price-text text-alert'>{itemTranslations.labelItemNotForSale()}</span>
        </div>
      );
    }
  }

  if (typeof expectedPrice === 'number' && expectedPrice > 0) {
    return (
      <div className='item-price'>
        <span className='icon-robux-16x16' />
        <span className='price-text text'>{numberFormat.getNumberFormat(expectedPrice)}</span>
        {originalPrice !== null && (
          <span className='original-price'>
            <span className='icon-robux-16x16' />
            <span>{numberFormat.getNumberFormat(originalPrice)}</span>
          </span>
        )}
      </div>
    );
  }

  if (typeof expectedPrice === 'number' && expectedPrice < 0) {
    return (
      <div className='item-price'>
        <span className='price-text text'>{itemDetails.priceStatus}</span>
      </div>
    );
  }

  if (typeof expectedPrice === 'number' && expectedPrice === 0) {
    return (
      <div className='item-price'>
        <span className='price-text text'>{itemTranslations.labelFree()}</span>
      </div>
    );
  }

  const itemRestrictions = itemDetails?.itemRestrictions || [];
  const isLimited = itemRestrictions.some(
    r => r === 'Limited' || r === 'LimitedUnique' || r === 'Collectible'
  );
  if (isLimited) {
    const limitedUnavailable =
      isLimited && !!itemDetails?.lowestPrice && typeof itemDetails?.lowestPrice !== 'number';
    if (limitedUnavailable) {
      return (
        <div className='item-price'>
          <span className='price-text text-alert'>{catalogTranslations.labelNoResellers()}</span>
        </div>
      );
    }
  } else if (typeof expectedPrice !== 'number') {
    return (
      <div className='item-price'>
        <span className='price-text text-alert'>{itemTranslations.labelItemNotForSale()}</span>
      </div>
    );
  }

  return (
    <div className='item-price'>
      <span className='price-text' />
    </div>
  );
}

function ShoppingCartModalItem({
  item,
  itemDetails,
  dispatch,
  onCheckboxClicked,
  selectedItemsRecord
}: {
  item: TCartItem;
  itemDetails: TItemDetails;
  dispatch: TCartDispatcher;
  onCheckboxClicked: (item: TCartItem, overrideValue?: boolean) => void;
  selectedItemsRecord: Record<string, boolean>;
}) {
  const itemName = itemDetails?.name || item.itemName;
  const creatorName = itemDetails?.creatorName;
  // Only render the timed-options dropdown when the item still offers timed
  // options. A creator can remove them after the item was added to the cart,
  // leaving stale persisted timedOptions in cart state; in that case the item
  // is treated as a normal permanent item priced at its base price.
  const showTimedOptions = !!item.timedOptions?.length && !!itemDetails.timedOptions?.length;
  // Reconcile the persisted timed-option selection against the latest offered
  // options. A creator can shorten the list of timed options after the item was
  // added to the cart; if the previously selected duration is no longer offered,
  // display (and price) it as the permanent option so the dropdown label matches
  // the fallback price.
  const persistedSelectedOption =
    item.timedOptions?.find(option => option.selected) ?? item.timedOptions?.[0];
  const isSelectedDurationStillOffered =
    !!persistedSelectedOption &&
    (persistedSelectedOption.days === 0 ||
      !!itemDetails.timedOptions?.some(option => option.days === persistedSelectedOption.days));
  const effectiveSelectedDays = isSelectedDurationStillOffered ? persistedSelectedOption.days : 0;

  // When the item offers exactly one rental (timed) option, replace the
  // dropdown with two toggle buttons: "Buy" (permanent) and "Rent" (the single
  // rental option). Multiple rental options keep the dropdown.
  const offeredTimedOptions = itemDetails.timedOptions ?? item.timedOptions ?? [];
  const permanentTimedOption = offeredTimedOptions.find(option => option.days === 0);
  const rentalTimedOptions = offeredTimedOptions.filter(option => option.days > 0);
  const singleRentalTimedOption = rentalTimedOptions.length === 1 ? rentalTimedOptions[0] : null;
  const showTwoButtonTimedOptions = showTimedOptions && !!singleRentalTimedOption;

  const dispatchTimedOptionSelection = (selectedDays: number) => {
    dispatch({
      type: 'UPDATE_TIMED_OPTIONS',
      itemId: item.itemId,
      itemType: item.itemType,
      selectedDays
      // eslint-disable-next-line @typescript-eslint/no-empty-function
    }).catch(() => {});
  };
  return (
    <div className='cart-item-container'>
      <div className='cart-item'>
        <div
          className='thumbnail-container'
          onClick={() => onCheckboxClicked(item)}
          aria-hidden='true'>
          <Thumbnail2d
            type={
              item.itemType?.toLowerCase() === 'bundle'
                ? ThumbnailTypes.bundleThumbnail
                : ThumbnailTypes.assetThumbnail
            }
            size={DefaultThumbnailSize}
            targetId={item.itemId}
            containerClass='cart-item-thumb'
            format={ThumbnailFormat.webp}
            altName={(itemName || 'Cart Item') + (creatorName ? ` by ${creatorName}` : '')}
          />
        </div>

        <div className='checkbox purchase-checkbox-container'>
          <input
            className='input-checkbox'
            id={`checkbox-${item.itemId}`}
            type='checkbox'
            checked={selectedItemsRecord[`${item.itemType.toLowerCase()}${item.itemId}`]}
            onChange={() => {
              onCheckboxClicked(item);
            }}
            disabled={false}
          />
          <label htmlFor={`checkbox-${item.itemId}`} />
        </div>
        <div className='item-details-container'>
          <a
            href={getItemLink(item.itemId, itemName, item.itemType)}
            target='_self'
            className='item-name'>
            {itemName}
          </a>
          {showTwoButtonTimedOptions && singleRentalTimedOption && (
            <div className='shopping-cart-timed-options-toggle'>
              <button
                type='button'
                className={`timed-option-toggle-btn ${
                  effectiveSelectedDays === 0 ? 'selected' : ''
                }`}
                aria-pressed={effectiveSelectedDays === 0}
                onClick={() => dispatchTimedOptionSelection(0)}>
                <span className='timed-option-toggle-label'>{catalogTranslations.actionBuy()}</span>
                <span className='timed-option-toggle-price'>
                  <Icon name='icon-filled-robux' size='Small' />
                  <span className='timed-option-toggle-price-text'>
                    {numberFormat.getNumberFormat(permanentTimedOption?.price ?? 0)}
                  </span>
                </span>
              </button>
              <button
                type='button'
                className={`timed-option-toggle-btn ${
                  effectiveSelectedDays === singleRentalTimedOption.days ? 'selected' : ''
                }`}
                aria-pressed={effectiveSelectedDays === singleRentalTimedOption.days}
                onClick={() => dispatchTimedOptionSelection(singleRentalTimedOption.days)}>
                <span className='timed-option-toggle-label'>
                  {catalogTranslations.actionRent()}
                </span>
                <span className='timed-option-toggle-price'>
                  <Icon name='icon-filled-robux' size='Small' />
                  <span className='timed-option-toggle-price-text'>
                    {numberFormat.getNumberFormat(singleRentalTimedOption.price)}
                  </span>
                </span>
              </button>
            </div>
          )}
          {showTimedOptions && !showTwoButtonTimedOptions && item.timedOptions && (
            <Dropdown
              size='Small'
              className='shopping-cart-timed-options-dropdown'
              value={effectiveSelectedDays.toString()}
              placeholder={
                effectiveSelectedDays === 0
                  ? catalogTranslations.labelPermanent()
                  : catalogTranslations.labelTimedOptionDays(effectiveSelectedDays)
              }
              onValueChange={value => {
                dispatchTimedOptionSelection(parseInt(value, 10));
              }}>
              <Menu className='timed-options-dropdown-menu'>
                <MenuSection className='timed-options-dropdown-menu-section'>
                  {(itemDetails.timedOptions || item.timedOptions)?.map(timedOption => (
                    <MenuItem
                      key={timedOption.days}
                      value={timedOption.days.toString()}
                      title={
                        timedOption.days === 0
                          ? catalogTranslations.labelPermanent()
                          : catalogTranslations.labelTimedOptionDays(timedOption.days)
                      }
                      trailing={
                        <span className='dropdown-robux-container'>
                          <Icon name='icon-filled-robux' size='Small' />
                          <span className='dropdown-robux-text'>
                            {numberFormat.getNumberFormat(timedOption.price)}
                          </span>
                        </span>
                      }
                    />
                  ))}
                </MenuSection>
              </Menu>
            </Dropdown>
          )}
          <ItemPrice item={item} itemDetails={itemDetails} />
        </div>
      </div>
      <div className='rm-item-btn-container icon-actions-clear-sm'>
        <button
          type='button'
          onClick={() => {
            trackShoppingCartRemoveClick(TCartActionSource.ShoppingCartModal, {
              itemId: item.itemId,
              itemType: item.itemType
            });
            dispatch(removeItemAction(item, true)).catch(() => {
              console.error('Failed to remove item');
            });
          }}
        />
      </div>
    </div>
  );
}

function ShoppingCartModalFooter({
  totalPrice,
  subtotal,
  remainingBalance,
  items,
  selectedItemsList,
  systemFeedbackService,
  totalCartValue,
  itemDetails,
  dispatch,
  subscriptionStatus
}: {
  totalPrice: number;
  subtotal: number;
  remainingBalance: number;
  items: TCartItem[];
  selectedItemsList: TCartItem[];
  systemFeedbackService: any;
  totalCartValue: number;
  itemDetails: Record<string, TDetailEntry>;
  dispatch: TCartDispatcher;
  subscriptionStatus: TSubscriptionStatus;
}) {
  const checkIfItemShouldPurchaseFromReseller = (itemDetail: TDetailEntry) => {
    if (
      itemDetail.itemRestrictions.includes('LimitedUnique') ||
      itemDetail.itemRestrictions.includes('Limited')
    ) {
      return true;
    }
    if (
      itemDetail.collectibleItemId !== undefined &&
      itemDetail.collectibleItemDetails !== undefined &&
      itemDetail.itemRestrictions.includes('Collectible')
    ) {
      if (
        itemDetail.collectibleItemDetails.unitsAvailableForConsumption !== undefined &&
        itemDetail.collectibleItemDetails.unitsAvailableForConsumption > 0
      ) {
        if (
          (itemDetail.collectibleItemDetails.lowestResalePrice !== undefined &&
            itemDetail.collectibleItemDetails.lowestResalePrice >
              itemDetail.collectibleItemDetails?.price) ||
          itemDetail.collectibleItemDetails.saleLocationType === 'ExperiencesDevApiOnly'
        ) {
          return true;
        }
      } else {
        return true;
      }
    }
    return false;
  };
  // "Limited" for analytics includes Limited 2.0 (Collectible) items, whose
  // itemRestrictions carry 'Collectible' rather than 'Limited'/'LimitedUnique'.
  const isItemLimited = (itemDetail: TDetailEntry) =>
    itemDetail.itemRestrictions.includes('LimitedUnique') ||
    itemDetail.itemRestrictions.includes('Limited') ||
    itemDetail.itemRestrictions.includes('Collectible');
  // The per-item amount charged, mirroring how totalTransactionValue is summed:
  // reseller purchases use the lowest resale/original price, otherwise the
  // catalog price.
  const getTransactionItemPrice = (itemDetail: TDetailEntry): number => {
    if (checkIfItemShouldPurchaseFromReseller(itemDetail)) {
      if (
        itemDetail.collectibleItemId !== undefined &&
        itemDetail.collectibleItemDetails?.lowestResalePrice !== undefined
      ) {
        return itemDetail.collectibleItemDetails.lowestResalePrice;
      }
      return itemDetail.lowestPrice ?? 0;
    }
    return itemDetail.price ?? 0;
  };
  // A timed-option purchase means the user checked out with a non-permanent
  // (days > 0) option selected. Mirror getSelectedItems: fall back to the first
  // option when none is explicitly flagged as selected.
  const wasTimedOptionPurchased = useCallback(
    (itemDetail: TDetailEntry) => {
      const cartItem = selectedItemsList.find(
        item =>
          item.itemId === itemDetail.id &&
          item.itemType.toLowerCase() === itemDetail.itemType.toLowerCase()
      );
      if (!cartItem?.timedOptions?.length) {
        return false;
      }
      const selectedIndex = cartItem.timedOptions.findIndex(option => option.selected);
      const selectedOption = cartItem.timedOptions[selectedIndex === -1 ? 0 : selectedIndex];
      // Guard against stale persisted timed-option data: if the item no longer
      // offers this duration, it was effectively purchased as a permanent item.
      return (
        !!selectedOption &&
        selectedOption.days > 0 &&
        !!itemDetail.timedOptions?.some(opt => opt.days === selectedOption.days)
      );
    },
    [selectedItemsList]
  );
  // The dependency array must include everything this callback reads, otherwise
  // it captures stale first-render values. In particular selectedItemsList,
  // itemDetails, and items are populated by a parent useEffect after the first
  // render; an empty array would make wasTimedOptionPurchased search an empty
  // list (isTimedOptionPurchase always false) and break resale/value metadata.
  const onTransactionComplete = useCallback(
    (
      results: Array<Record<string, TPurchaseDataResult>>,
      attemptedPurchaseCount: number,
      attemptedPurchaseValue: number
    ) => {
      const params = {
        totalNumberOfItemsInCart: items.length,
        totalValueOfItemsInCart: totalCartValue,
        totalNumberOfSelectedItemsInCheckout: attemptedPurchaseCount,
        totalValueOfSelectedItemsInCheckout: attemptedPurchaseValue,
        purchaseData: JSON.stringify(results),
        userId: CurrentUser.userId
      };
      eventStreamService.sendEvent(
        {
          name: 'shoppingCartPurchaseResult',
          type: 'shoppingCartPurchaseResult',
          context: 'shoppingCart'
        },
        params
      );
      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_CATALOG_CART_ROBUX_UPSELL,
        true,
        paymentFlowAnalyticsService.ENUM_VIEW_NAME.ROBUX_UPSELL,
        paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
        paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.BUY_ROBUX
      );

      let totalTransactionValue = 0;
      const purchasedItems = [] as Array<TPurchaseEventItem>;
      let successOccurred = false;
      let errorOccurred = false;
      results.forEach(result => {
        if (result.data.reason === 'Success') {
          successOccurred = true;
          let itemDetail: TDetailEntry;
          if (result.data.itemData.assetId !== undefined) {
            itemDetail = itemDetails[result.data.itemData.assetId];
            const itemPrice = getTransactionItemPrice(itemDetail);
            totalTransactionValue += itemPrice;
            purchasedItems.push({
              itemType: itemDetail.itemType,
              subType:
                itemDetail.itemType === 'Bundle' ? itemDetail.bundleType : itemDetail.assetType,
              itemId: itemDetail.id,
              price: itemPrice,
              resalePurchase: checkIfItemShouldPurchaseFromReseller(itemDetail),
              isLimited: isItemLimited(itemDetail),
              isTimedOptionPurchase: wasTimedOptionPurchased(itemDetail)
            });

            dispatch(
              removeItemAction({ itemId: result.data.itemData.assetId, itemType: 'Asset' })
            ).catch(() => {
              console.error('Failed to remove item');
            });
          } else if (result.data.itemData.bundleId !== undefined) {
            itemDetail = itemDetails[result.data.itemData.bundleId];
            const itemPrice = getTransactionItemPrice(itemDetail);
            totalTransactionValue += itemPrice;
            purchasedItems.push({
              itemType: itemDetail.itemType,
              subType:
                itemDetail.itemType === 'Bundle' ? itemDetail.bundleType : itemDetail.assetType,
              itemId: itemDetail.id,
              price: itemPrice,
              resalePurchase: checkIfItemShouldPurchaseFromReseller(itemDetail),
              isLimited: isItemLimited(itemDetail),
              isTimedOptionPurchase: wasTimedOptionPurchased(itemDetail)
            });

            dispatch(
              removeItemAction({ itemId: result.data.itemData.bundleId, itemType: 'Bundle' })
            ).catch(() => {
              console.error('Failed to remove item');
            });
          }
        } else {
          errorOccurred = true;
        }
      });

      const eventParams = {
        totalTransactionValue,
        transactionItems: JSON.stringify(purchasedItems),
        purchaseType: 'shopping-cart',
        userId: CurrentUser.userId
      };
      if (successOccurred) {
        window.dispatchEvent(new CustomEvent(`navigation-update-user-currency`));
        // Sending 2 events - one for metadata and one for counters
        AXAnalyticsService.sendAXTracking({
          itemName: AXAnalyticsConstants.PurchaseSuccessShoppingCart,
          excludeTelemetry: true
        });

        AXAnalyticsService.sendAXTracking({
          itemName: AXAnalyticsConstants.PurchaseSuccess,
          counterName: AXAnalyticsConstants.PurchaseSuccessShoppingCart,
          metaData: {
            metaData: JSON.stringify(eventParams),
            totalValue: totalTransactionValue
          },
          actionType: AXSendTrackingActionType.Click
        });
        eventStreamService.sendEvent(
          {
            name: 'marketplaceWebPurchaseSuccess',
            type: 'marketplaceWebPurchaseSuccess',
            context: 'marketplaceWebPurchase'
          },
          eventParams
        );
      }
      if (errorOccurred) {
        AXAnalyticsService.sendAXTracking({
          itemName: AXAnalyticsConstants.PurchaseErrorShoppingCart,
          excludeTelemetry: true
        });
      }
    },
    // wasTimedOptionPurchased closes over selectedItemsList and is re-created each
    // render, so listing it here keeps this callback in sync with the latest cart
    // selection (fixing the stale-closure isTimedOptionPurchase bug).
    [dispatch, itemDetails, items, totalCartValue, wasTimedOptionPurchased]
  );
  const parseItems = () => {
    const selectedItems = [] as TBatchPurchaseItem[];
    selectedItemsList.forEach(item => {
      let timedOptionIndex = 0;
      if (item.timedOptions && item.timedOptions.length > 0) {
        timedOptionIndex = item.timedOptions.findIndex(option => option.selected);
      }
      const selectedTimedOption = item.timedOptions?.[timedOptionIndex];
      // Don't pass timedOption for permanent purchases (days === 0) to avoid
      // showing clock icon. Also guard against stale persisted timed options: a
      // creator may have removed the item's timed options after it was added to
      // the cart, so only send an option the item still offers. Otherwise fall
      // back to a permanent purchase at the base price.
      const itemDetail = itemDetails[item.itemId];
      const itemStillOffersTimedOption =
        !!selectedTimedOption &&
        selectedTimedOption.days !== 0 &&
        !!itemDetail?.timedOptions?.some(opt => opt.days === selectedTimedOption.days);
      const timedOptionToPass = itemStillOffersTimedOption ? selectedTimedOption : undefined;
      selectedItems.push({
        id: item.itemId,
        itemType: item.itemType,
        timedOption: timedOptionToPass
      });
    });
    return selectedItems;
  };

  const onTooManyItemsButtonClick = () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    systemFeedbackService.warning(
      catalogTranslations.messagePurchaseLimit({
        purchaseLimit: `${shoppingCartConstants.maxSelectedItems}`
      }),
      0,
      2000
    );
  };

  const purchaseMetadata = new Map<string, string | undefined>();

  return (
    <div className='shopping-cart-footer'>
      <SubscribeUpsellContainer
        subtotal={subtotal}
        itemCount={selectedItemsList.length}
        selectedItems={selectedItemsList}
        itemDetails={itemDetails}
        subscriptionStatus={subscriptionStatus}
      />
      <div className='cart-total-section-container'>
        <div className='total-label'>
          {catalogTranslations.labelTotalItems({ itemCount: `${selectedItemsList.length}` })}
        </div>
        <div className='total-price-container'>
          <span className='icon-robux-16x16' />
          <span className='price-text'>{totalPrice.toLocaleString()}</span>
        </div>
      </div>
      {selectedItemsList.length > shoppingCartConstants.maxSelectedItems && (
        <Button
          className='action-button batch-buy-purchase-button'
          variant={Button.variants.growth}
          size={Button.sizes.large}
          onClick={onTooManyItemsButtonClick}>
          {catalogTranslations.actionBuy()}
        </Button>
      )}
      {selectedItemsList.length <= shoppingCartConstants.maxSelectedItems && (
        <BatchBuyPriceContainer
          items={parseItems()}
          purchaseMetadata={purchaseMetadata}
          onBuyButtonClick={() => {
            const transactionItems = selectedItemsList
              .map(item => itemDetails[item.itemId])
              .filter((itemDetail): itemDetail is TDetailEntry => itemDetail !== undefined)
              .map(itemDetail => ({
                itemType: itemDetail.itemType,
                subType:
                  itemDetail.itemType === 'Bundle' ? itemDetail.bundleType : itemDetail.assetType,
                itemId: itemDetail.id,
                price: getTransactionItemPrice(itemDetail),
                resalePurchase: checkIfItemShouldPurchaseFromReseller(itemDetail),
                isLimited: isItemLimited(itemDetail),
                isTimedOptionPurchase: wasTimedOptionPurchased(itemDetail)
              }));
            trackPurchaseButtonClick(TPurchaseSource.ShoppingCart, {
              totalTransactionValue: totalPrice,
              transactionItems: JSON.stringify(transactionItems),
              purchaseType: 'shopping-cart',
              userId: CurrentUser.userId
            });
          }}
          onTransactionComplete={(results: Array<Record<string, TPurchaseDataResult>>) => {
            onTransactionComplete(results, selectedItemsList.length, totalPrice);
          }}
          // using any as a type for systemFeedbackService because we don't have an exported type for ts
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          systemFeedbackService={systemFeedbackService}
        />
      )}

      <div className='balance-disclaimer-container'>
        {remainingBalance >= 0 ? (
          <div
            className='balance-disclaimer-text'
            dangerouslySetInnerHTML={{
              __html: catalogTranslations.messageRemainingBalance({
                remainingBalance: `<span class='icon-robux-16x16'></span><span class='text-robux'>${escapeHtml()(
                  remainingBalance.toLocaleString()
                )}</span>`
              })
            }}
          />
        ) : (
          <div className='balance-disclaimer-text'>
            {catalogTranslations.messageInsufficientFundsForTransaction()}
          </div>
        )}
      </div>
    </div>
  );
}

function ShoppingCartModal(props: {
  setIsCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
  systemFeedbackService: any;
}): JSX.Element {
  const { cart, dispatch } = useShoppingCart();
  const { subscriptionStatus } = useSubscriptionStatus();
  const { items, currentUserBalance, itemDetails } = cart;

  const currentBalance = Math.max(currentUserBalance ?? currentUserBalance ?? 0, 0);
  const ref = useRef<HTMLDivElement>(null);

  const [modalRect, setModalRect] = useState({
    windowHeight: window.innerHeight,
    width: null,
    height: null,
    top: null,
    left: null
  } as { windowHeight: number; width: number | null; height: number | null; top: number | null; left: number | null });
  const [totalPrice, setTotalPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [selectedItemsList, setSelectedItemsList] = useState([] as TCartItem[]);
  const [selectedItemsObject, setSelectedItemsObject] = useState({} as Record<string, boolean>);
  const [isScrollable, setIsScrollable] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const updateTotalPrice = useCallback(
    (itemList: TCartItem[]) => {
      const totalSelectedPrice = recalculateCartTotalFromSelectedItems(cart, itemList);
      const originalPriceValue = calculateOriginalPrice(cart, itemList);
      setTotalPrice(totalSelectedPrice);
      setOriginalPrice(originalPriceValue);
      setRemainingBalance(currentBalance - totalSelectedPrice);
    },
    [cart, currentBalance]
  );

  // Memoize item IDs to avoid unnecessary re-renders from array reference changes
  const itemIds = useMemo(() => items.map(i => i.itemId).join(','), [items]);

  useEffect(() => {
    const updatedCart = fetchCartState();
    setSelectedItemsObject(updatedCart.selectedItems);
  }, []);

  useEffect(() => {
    const updatedCart = fetchCartState();
    setSelectedItemsObject(updatedCart.selectedItems);
  }, [itemIds]);

  useEffect(() => {
    const updatedSelectedItemsList = [] as TCartItem[];
    items.forEach(item => {
      if (selectedItemsObject[`${item.itemType.toLowerCase()}${item.itemId}`]) {
        updatedSelectedItemsList.push(item);
      }
    });
    updateTotalPrice(updatedSelectedItemsList);
    setSelectedItemsList(updatedSelectedItemsList);
  }, [selectedItemsObject, itemIds, items, updateTotalPrice]);

  // Check if scroll container has scrollable content
  useEffect(() => {
    const checkScrollable = () => {
      const container = scrollContainerRef.current;
      if (container) {
        const scrollableElement = container.querySelector('.simplebar-content-wrapper');
        if (scrollableElement) {
          setIsScrollable(scrollableElement.scrollHeight > scrollableElement.clientHeight);
        }
      }
    };
    // Small delay to allow ScrollBar to render
    const timeoutId = setTimeout(checkScrollable, 100);
    window.addEventListener('resize', checkScrollable);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkScrollable);
    };
  }, [items.length, modalRect.height]);

  // close modal if clicking outside of modal
  const handleWindowClick = useCallback(
    (evt: MouseEvent) => {
      const target = evt?.target;
      const modalContainer = ref?.current;

      if (target instanceof Element) {
        // Special case: If click is on html/body, this is likely a dropdown interaction
        // that bubbled up due to pointer-events manipulation
        if (target.tagName === 'HTML' || target.tagName === 'BODY') {
          const { body } = document;
          const bodyStyle = window.getComputedStyle(body);

          // Check for pointer-events: none (dropdown opening)
          if (bodyStyle.pointerEvents === 'none') {
            return;
          }

          // Check for data-scroll-locked attribute (often used by modals/dropdowns)
          if (body.hasAttribute('data-scroll-locked')) {
            return;
          }

          // Check if there are any open Foundation UI dropdowns in the DOM
          const openDropdowns = document.querySelectorAll('[data-state="open"]');
          const foundationDropdowns = document.querySelectorAll(
            '.shopping-cart-timed-options-dropdown'
          );
          if (openDropdowns.length > 0 || foundationDropdowns.length > 0) {
            return;
          }
        }

        // First check if click is inside the modal container
        if (modalContainer && modalContainer.contains(target)) {
          return;
        }

        // Check if click is on shopping cart related elements
        if (isDomElementInShoppingCart(target)) {
          return;
        }

        // Additional check for Foundation UI dropdown portals
        // These are often rendered outside the modal but should not close it
        if (
          target.closest('[data-floating-ui-portal]') ||
          target.closest('[role="menu"]') ||
          target.closest('[role="menuitem"]')
        ) {
          return;
        }

        // Check if click is inside a purchase modal (batch purchase, insufficient funds, etc.)
        // These modals are rendered via portals outside the shopping cart DOM
        if (
          target.closest('.modal-window') ||
          target.closest('.modal-dialog') ||
          target.closest('[role="dialog"]')
        ) {
          return;
        }

        trackShoppingCartCloseClick(TCartCloseReason.ClickOutside);
        props?.setIsCartOpen?.(false);
      }
    },
    [props]
  );

  // save a ref to the modal for calculating the X, Y, width, height positioning
  const cartModalRef = useCallback(node => {
    if (!node || !(node instanceof HTMLElement)) return;

    const calculateContainerInnerRects = (n: HTMLElement) => {
      const clientRect = n?.getBoundingClientRect?.();
      if (clientRect && clientRect?.width && clientRect?.height) {
        const newContainerDimensions = {
          windowHeight: window.innerHeight,
          width: clientRect?.width,
          height: clientRect?.height,
          top: clientRect?.top ?? clientRect?.y,
          left: clientRect?.left ?? clientRect?.x
        };
        setModalRect(newContainerDimensions);
      }
    };

    calculateContainerInnerRects(node);

    const intObs = new IntersectionObserver(
      entries => {
        const entry = entries?.[0];
        if (!entry?.target) return;
        calculateContainerInnerRects(node);
      },
      { root: null, rootMargin: '0px', threshold: [0.9, 0.99, 1.0] }
    );

    const resizeObs = new ResizeObserver(() => {
      calculateContainerInnerRects(node);
    });
    intObs.observe(node);
    resizeObs.observe(document.body, { box: 'border-box' });
  }, []);

  const viewportEdgePadding = 20;

  // generates the modal height
  const modalHeight = useMemo(() => {
    const h = modalRect.height;
    const t = modalRect.top;
    if (typeof h !== 'number' || typeof t !== 'number') return 600;

    const bottomOffset = h + t;
    if (bottomOffset > modalRect.windowHeight) {
      const delta = bottomOffset - modalRect.windowHeight;
      return Math.max(460, h - delta - viewportEdgePadding);
    }

    if (bottomOffset < modalRect.windowHeight - viewportEdgePadding) {
      const expectedHeight = modalRect.windowHeight - viewportEdgePadding - t;
      if (expectedHeight >= 460) {
        return Math.min(600, expectedHeight);
      }
    }

    return modalRect.height ? modalRect.height : 0;
  }, [modalRect.windowHeight, modalRect.height, modalRect.top]);

  const onCheckboxClicked = (item: TCartItem, overrideValue?: boolean) => {
    const selectedItems = selectedItemsObject;
    const selectedItemKey = `${item.itemType.toLowerCase()}${item.itemId}`;
    let selectedValue = false;
    if (overrideValue === undefined) {
      if (selectedItems[selectedItemKey] !== undefined) {
        selectedValue = !selectedItems[selectedItemKey];
      } else {
        selectedValue = true;
      }
    } else {
      selectedValue = overrideValue;
    }
    if (selectedValue && selectedItemsList.length >= shoppingCartConstants.maxSelectedItems) {
      selectedValue = false;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      props.systemFeedbackService.warning(
        catalogTranslations.messagePurchaseLimit({
          purchaseLimit: `${shoppingCartConstants.maxSelectedItems}`
        }),
        0,
        2000
      );
    }
    selectedItems[selectedItemKey] = selectedValue;
    setSelectedItemsObject({ ...selectedItems });
    setCartState({ ...cart, selectedItems: selectedItemsObject });
  };

  //
  useEffect(() => {
    window.addEventListener('click', handleWindowClick, true);
    return () => {
      window.removeEventListener('click', handleWindowClick, true);
    };
  }, [handleWindowClick]);
  const itemCountFormatted = `(${items.length})`;
  return (
    <div ref={ref} className='shopping-cart-modal-container'>
      <div
        ref={cartModalRef}
        className='shopping-cart-modal'
        style={{ height: `${modalHeight}px` }}>
        <div className='shopping-cart-title-container'>
          <h2 className='shopping-cart-title'>
            <span className='shopping-cart-title-text'>
              {catalogTranslations.labelShoppingCart()}
            </span>{' '}
            <span className='shopping-cart-title-item-count'>{itemCountFormatted}</span>
          </h2>
        </div>
        <div ref={scrollContainerRef} className='scroll-container'>
          <ScrollBar className='rbx-scrollbar'>
            <div className='shopping-cart-items-list'>
              {items.map(item => (
                <ShoppingCartModalItem
                  key={item.itemId}
                  item={item}
                  itemDetails={itemDetails[item.itemId]}
                  dispatch={dispatch}
                  onCheckboxClicked={onCheckboxClicked}
                  selectedItemsRecord={selectedItemsObject}
                />
              ))}
            </div>
          </ScrollBar>
        </div>
        {isScrollable && <div className='footer-divider' />}
        <ShoppingCartModalFooter
          totalPrice={totalPrice}
          subtotal={originalPrice}
          totalCartValue={recalculateCartTotalFromSelectedItems(cart, cart.items)}
          remainingBalance={remainingBalance}
          items={items}
          selectedItemsList={selectedItemsList}
          systemFeedbackService={props.systemFeedbackService}
          itemDetails={itemDetails}
          dispatch={dispatch}
          subscriptionStatus={subscriptionStatus}
        />
      </div>
    </div>
  );
}

ShoppingCartModal.propTypes = {};

export default ShoppingCartModal;
