/* eslint-disable react/jsx-no-literals */
import { CurrentUser, AXAnalyticsService, AXSendTrackingActionType, Intl } from 'Roblox';
import React, { Fragment, useState } from 'react';
import * as itemPurchase from 'roblox-item-purchase';
import { numberFormat } from 'core-utilities';
import { eventStreamService } from 'core-roblox-utilities';
import { Tooltip } from 'react-style-guide';
import {
  TItemPricing,
  TItemPurchaseParams,
  TPriceDisplayMode,
  TTimedOption
} from '../constants/types';
import ItemFirstLine from './ItemFirstLine';
import { useItemPricing } from '../utils/hooks';
import { TItemPriceContainerProps } from './ItemDetailsInfoBody';
import {
  catalogTranslations,
  itemTranslations,
  itemModelTranslations
} from '../services/translationService';
import {
  regularPriceDisplayModes,
  nonPurchasableDisplayModes,
  consumableDisplayModes
} from '../constants/pricingConstants';
import PurchaseButton, {
  UnathentictedPurchaseButton,
  FacialAuthVerifyButton
} from './PurchaseButton';
import PriceSubText from './PriceSubText';
import { isLimited, isCollectible, isFae } from '../utils/itemDetailUtils';
import OwnedItemButton from './OwnedItemButton';
import { genPurchaseParams } from '../utils/purchaseUtils';
// import AddToCartButton from './AddToCartButton';
import AddToCartButton from '../../shoppingCart/components/AddToCartButton';
import { ResaleRestriction } from '../constants/resaleRestrictionConstants';
import { trackPurchaseButtonClick, TPurchaseSource } from '../../analytics/axTrackingEvents';

const { AXAnalyticsConstants } = AXAnalyticsService;
const [ItemPurchase, itemPurchaseService] = itemPurchase.createItemPurchase();
const formatNumber = numberFormat.getNumberFormat;

function ItemPrice({
  expectedPrice,
  selectedTimedOption,
  itemPurchaseParams,
  priceDisplayMode,
  renderPurchaseLink,
  resaleRestriction,
  isInExperienceOnly,
  isCollectibleAndOffSale,
  discountInformation,
  isResalePurchase
}: {
  expectedPrice: number | null;
  selectedTimedOption: TTimedOption | null;
  itemPurchaseParams: TItemPurchaseParams | null;
  priceDisplayMode: TPriceDisplayMode | null;
  renderPurchaseLink: boolean | undefined;
  resaleRestriction: ResaleRestriction;
  isInExperienceOnly: boolean;
  isCollectibleAndOffSale: boolean;
  discountInformation?: { originalPrice?: number } | null;
  isResalePurchase?: boolean;
}) {
  if (typeof expectedPrice === 'number') {
    let price = expectedPrice;
    let originalPrice: number | null = null;

    // Don't show strikethrough for resale purchases
    if (!isResalePurchase) {
      if (selectedTimedOption) {
        price = selectedTimedOption.price;
        originalPrice = selectedTimedOption.discountInformation?.originalPrice ?? null;
      } else if (discountInformation?.originalPrice) {
        originalPrice = discountInformation.originalPrice;
      }
    } else if (selectedTimedOption) {
      price = selectedTimedOption.price;
    }

    if (price === 0) {
      return (
        <div className='item-price-value'>
          <span className='text'>{itemTranslations.labelFree()}</span>
        </div>
      );
    }

    const priceVisible =
      priceDisplayMode === 'COLLECTIBLE_ONLY_ORIGINAL' &&
      resaleRestriction === ResaleRestriction.DISABLED;

    // Gray out price text if original copy cannot be obtained due to various reasons
    const priceClassName = `text-robux-lg ${
      itemPurchaseParams ||
      priceDisplayMode !== 'COLLECTIBLE_ONLY_ORIGINAL' ||
      priceVisible ||
      !renderPurchaseLink
        ? ''
        : 'disabled'
    }`;

    return (
      <div className='item-price-value icon-text-wrapper clearfix icon-robux-price-container'>
        <span className='icon-robux-16x16' />
        <span className={priceClassName}>{formatNumber(price)}</span>
        {originalPrice !== null && originalPrice !== price && (
          <span className='original-price'>
            <span className='icon-robux-16x16' />
            <span>{formatNumber(originalPrice)}</span>
          </span>
        )}
        {!!itemPurchaseParams && !isInExperienceOnly && !isCollectibleAndOffSale && (
          <div className='item-purchase-link-container'>
            <span
              className='see-all-link-icon'
              onClick={() => {
                itemPurchaseService.start();
              }}
              aria-hidden='true'
            />
            <ItemPurchase {...itemPurchaseParams} />
          </div>
        )}
      </div>
    );
  }
  return null;
}

function TimedOption({
  timedOption,
  selected,
  onTimedOptionSelected
}: {
  timedOption: TTimedOption;
  selected: boolean;
  onTimedOptionSelected: (timedOption: TTimedOption) => void;
}) {
  const { days, price } = timedOption;
  const timedOptionDurationText =
    days === 0
      ? catalogTranslations.labelPermanent()
      : catalogTranslations.labelTimedOptionDays(days);
  const timedOptionContainerClassName = `timed-option-container ${selected ? 'selected' : ''}`;
  return (
    <button
      type='button'
      className={timedOptionContainerClassName}
      onClick={() => onTimedOptionSelected(timedOption)}>
      <span className='timed-option-days text'>{timedOptionDurationText}</span>
      <span className='timed-option-price-container icon-text-wrapper clearfix icon-robux-price-container'>
        <span className='icon-robux-16x16' />
        <span className='timed-option-price text'>{formatNumber(price)}</span>
      </span>
    </button>
  );
}

function TimedOptionPurchaseLabel({ label, price }: { label: string; price: number }): JSX.Element {
  return (
    <span className='timed-option-purchase-label'>
      <span className='timed-option-purchase-label-text'>{label}</span>
      <span className='timed-option-purchase-label-price icon-text-wrapper clearfix icon-robux-price-container'>
        <span className='icon-robux-16x16' />
        <span>{formatNumber(price)}</span>
      </span>
    </span>
  );
}

function getExpectedPrice(itemPricingInfo: TItemPricing): number | null {
  const { priceDisplayMode, premiumPrice, price, lowestPrice, lowestResalePrice } = itemPricingInfo;
  const defaultPrice = price;
  if (price === 0 && (lowestPrice === undefined || lowestPrice === null)) {
    return 0;
  }
  if (priceDisplayMode === 'PREMIUM_USER_PREMIUM_ITEM') {
    return premiumPrice ?? defaultPrice;
  }
  if (priceDisplayMode === 'COLLECTIBLE_ONLY_RESELLERS_QUANTITY_LIMIT_REACHED') {
    return lowestResalePrice ?? defaultPrice;
  }
  if (priceDisplayMode === 'COLLECTIBLE_ONLY_RESELLERS') {
    const isOnlyInExperience = itemPricingInfo.saleLocationType === 'ExperiencesDevApiOnly';
    if (isOnlyInExperience) {
      return lowestResalePrice ?? defaultPrice;
    }
    return lowestPrice ?? defaultPrice;
  }
  if (priceDisplayMode === 'LIMITED_WITH_RESELLERS') {
    return lowestPrice ?? defaultPrice;
  }
  if (regularPriceDisplayModes.includes(priceDisplayMode)) {
    return price;
  }
  if (consumableDisplayModes.includes(priceDisplayMode)) {
    return price;
  }
  return defaultPrice;
}

function FacialAuthPriceDisplay({ price }: { price: number }): JSX.Element {
  if (price === 0) {
    return (
      <span className='facial-auth-price-value font-header-1'>{itemTranslations.labelFree()}</span>
    );
  }
  return (
    <span className='facial-auth-price-value font-header-1 icon-text-wrapper icon-robux-price-container'>
      <span className='icon-robux-16x16' />
      <span>{formatNumber(price)}</span>
    </span>
  );
}

function FacialAuthPriceContainer({
  priceLabel,
  expectedPrice,
  itemName
}: {
  priceLabel: string;
  expectedPrice: number;
  itemName: string;
}): JSX.Element {
  return (
    <div className='price-row-container facial-auth-price-row-container'>
      <div className='price-container-text'>
        <div className='item-info-row-container'>
          <div className='text-label row-label price-label'>{priceLabel}</div>
          <div className='price-info row-content facial-auth-price-info'>
            <FacialAuthPriceDisplay price={expectedPrice} />
            <div
              className='facial-auth-price-subtitle font-body text'
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: catalogTranslations.labelFreeItemWithAnAgeCheck()
              }}
            />
            <div className='facial-auth-buy-button-container'>
              <FacialAuthVerifyButton
                label={catalogTranslations.actionUnlock()}
                itemName={itemName}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Rendered when the viewer is neither already FAE-verified nor eligible to
// see the FAE upsell. We mirror the offsale visual treatment: greyed-out
// price, "currently unavailable" message, no action button.
function FaeUnavailablePriceContainer({
  priceLabel,
  expectedPrice
}: {
  priceLabel: string;
  expectedPrice: number;
}): JSX.Element {
  return (
    <div className='price-row-container facial-auth-price-row-container'>
      <div className='price-container-text'>
        <div className='item-info-row-container'>
          <div className='text-label row-label price-label'>{priceLabel}</div>
          <div className='price-info row-content facial-auth-price-info facial-auth-price-info-unavailable'>
            <FacialAuthPriceDisplay price={expectedPrice} />
            <div className='facial-auth-price-subtitle font-body text'>
              {catalogTranslations.labelOriginalUnavailable()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ItemPriceContainer = (props: TItemPriceContainerProps): JSX.Element | null => {
  const {
    itemDetails,
    collectibleItemDetails,
    permissions,
    ownedItemInstances,
    resellers,
    reachedQuantityLimit,
    originalItemDetails,
    purchaseButtonLoaded,
    faeFeatureGranted,
    faeUpsellGranted
  } = props;
  const dateTimeFormatter = new Intl().getDateTimeFormatter();
  const isExperienceLinkEnabled = !!collectibleItemDetails?.experiences?.length;

  const itemPricingInfo = useItemPricing(
    itemDetails,
    collectibleItemDetails,
    permissions,
    ownedItemInstances,
    !!originalItemDetails,
    isExperienceLinkEnabled
  );
  const expectedPrice = getExpectedPrice(itemPricingInfo);

  const getInitialTimedOptionIndex = (): number => {
    const options = itemDetails.timedOptions || [];
    if (options.length === 0) {
      return 0;
    }
    const preselectedIndex = options.findIndex(option => option.selected);
    if (preselectedIndex !== -1) {
      return preselectedIndex + 1;
    }
    return 0;
  };

  const [selectedTimedOptionIndex, setSelectedTimedOptionIndex] = useState<number>(
    getInitialTimedOptionIndex
  );

  const timedOptions = React.useMemo(() => {
    const options = itemDetails.timedOptions || [];
    if (options.length === 0) {
      return [];
    }
    const permanentTimedOption: TTimedOption = {
      days: 0,
      price: expectedPrice ?? 0,
      selected: false,
      discountInformation: itemDetails.discountInformation
    };
    return [permanentTimedOption, ...options];
  }, [itemDetails.timedOptions, expectedPrice, itemDetails.discountInformation]);

  // FAE-gated items the viewer doesn't already own go through one of three
  // layouts based on the two access-management feature flags:
  //   - faeFeatureGranted (AllowFaeItemToBeClaimed) → user already verified;
  //     keep the normal purchase logic but relabel the button ("Unlock"),
  //     hide the add-to-cart shortcut, and show an "Age Check Complete"
  //     subtitle (see isFaeUnlockReady below).
  //   - !faeFeatureGranted, faeUpsellGranted (ShowFaeUpsell) → render the
  //     FAE upsell flow.
  //   - neither granted → render the "unavailable" (offsale-style) layout.
  const isFaeItem = isFae(itemDetails);
  const isFaeFlowEligible = isFaeItem && CurrentUser.isAuthenticated && !itemDetails.owned;

  if (isFaeFlowEligible && !faeFeatureGranted) {
    // ItemDetailsInfoBody renders this container twice for items that need a
    // separate "original copy" row (Limited 2.0 + resellers). For the FAE
    // flow we only want a single price container, so skip the
    // originalItemDetails variant and let the main one render the FAE layout.
    if (originalItemDetails) {
      return null;
    }
    if (faeUpsellGranted) {
      return (
        <FacialAuthPriceContainer
          priceLabel={itemTranslations.labelPrice()}
          expectedPrice={expectedPrice ?? 0}
          itemName={itemDetails.name}
        />
      );
    }
    return (
      <FaeUnavailablePriceContainer
        priceLabel={itemTranslations.labelPrice()}
        expectedPrice={expectedPrice ?? 0}
      />
    );
  }

  const isFaeUnlockReady = isFaeFlowEligible && !!faeFeatureGranted;

  const isItemLimited = isLimited(itemDetails.itemRestrictions);
  const isItemCollectible = isCollectible(itemDetails.itemRestrictions);
  // Analytics "limited" must include Limited 2.0 (Collectible) items, whose
  // itemRestrictions carry 'Collectible' rather than 'Limited'/'LimitedUnique'.
  const isItemLimitedForEvents = isItemLimited || isItemCollectible;
  const isCollectibleAndOffSale = isItemCollectible && itemDetails.isOffSale === true;
  const resaleRestriction = collectibleItemDetails
    ? collectibleItemDetails.resaleRestriction
    : ResaleRestriction.NONE;
  const isInExperienceOnly = itemPricingInfo.saleLocationType === 'ExperiencesDevApiOnly';
  const isIEPWithHyperLinks = isInExperienceOnly && !!collectibleItemDetails?.experiences?.length;

  const onlyFromReseller =
    itemPricingInfo.priceDisplayMode === 'COLLECTIBLE_ONLY_RESELLERS_QUANTITY_LIMIT_REACHED';
  const hasResellers = !!itemDetails.hasResellers;

  // Determine if the best price being displayed is from resale (not original stock)
  // This includes: no original copies available, or resale price is lower than original
  const noOriginalCopiesAvailable =
    collectibleItemDetails?.unitsAvailableForConsumption === 0 ||
    itemDetails.unitsAvailableForConsumption === 0;
  const resalePriceIsLower =
    collectibleItemDetails?.lowestResalePrice !== undefined &&
    collectibleItemDetails.lowestResalePrice > 0 &&
    collectibleItemDetails.lowestResalePrice < (collectibleItemDetails.price ?? Infinity);

  const isResalePurchase =
    itemPricingInfo.priceDisplayMode === 'COLLECTIBLE_ONLY_RESELLERS_QUANTITY_LIMIT_REACHED' ||
    (itemPricingInfo.priceDisplayMode === 'COLLECTIBLE_ONLY_RESELLERS' &&
      (isInExperienceOnly || noOriginalCopiesAvailable || resalePriceIsLower)) ||
    (itemPricingInfo.priceDisplayMode === 'LIMITED_WITH_RESELLERS' &&
      (noOriginalCopiesAvailable || resalePriceIsLower));

  const checkIfItemShouldPurchaseFromReseller = () => {
    if (
      itemDetails.itemRestrictions.includes('LimitedUnique') ||
      itemDetails.itemRestrictions.includes('Limited')
    ) {
      return true;
    }
    if (itemDetails.collectibleItemId !== undefined && collectibleItemDetails !== undefined) {
      if (
        collectibleItemDetails.unitsAvailableForConsumption !== undefined &&
        collectibleItemDetails.unitsAvailableForConsumption > 0
      ) {
        if (
          (collectibleItemDetails.lowestResalePrice !== undefined &&
            collectibleItemDetails.lowestResalePrice > collectibleItemDetails?.price) ||
          collectibleItemDetails.saleLocationType === 'ExperiencesDevApiOnly'
        ) {
          return true;
        }
      } else {
        return true;
      }
    }
    return false;
  };

  // Attaches the purchase-success analytics for a specific timed option. Split
  // out of the single-Buy-button flow so it can be reused for the standalone
  // "Buy" (permanent) and "Rent" (single rental option) buttons.
  const attachPurchaseSuccessAnalytics = (
    params: TItemPurchaseParams | null,
    selectedTimedOption: TTimedOption | null | undefined
  ): TItemPurchaseParams | null => {
    if (!params) {
      return params;
    }
    const onPurchaseSuccess = () => {
      const isTimedOptionPurchase = !!selectedTimedOption && selectedTimedOption.days > 0;
      const analyticsParams = {
        totalTransactionValue: params.expectedPrice,
        transactionItems: JSON.stringify([
          {
            itemType: itemDetails.itemType,
            subType:
              itemDetails.itemType === 'Bundle' ? itemDetails.bundleType : itemDetails.assetType,
            itemId: itemDetails.id,
            resalePurchase: checkIfItemShouldPurchaseFromReseller(),
            isLimited: isItemLimitedForEvents,
            isTimedOptionPurchase
          }
        ]),
        purchaseType: 'item-details-page-purchase',
        userId: CurrentUser.userId
      };

      const itemName =
        itemDetails?.itemType === 'Bundle'
          ? AXAnalyticsConstants.PurchaseSuccessBundle
          : AXAnalyticsConstants.PurchaseSuccessAsset;

      AXAnalyticsService.sendAXTracking({
        itemName: AXAnalyticsConstants.PurchaseSuccess,
        counterName: itemName,
        metaData: {
          metaData: JSON.stringify(analyticsParams),
          totalValue: params.expectedPrice
        },
        actionType: AXSendTrackingActionType.Click
      });

      // Timed-option repurchase: the user bought a timed option (days > 0) for
      // an item they already own or already have (expiring) timed access to.
      // The timed-options UI only renders when owned || expirationTime, so a
      // timed-option purchase here is effectively a repurchase/renewal.
      const isTimedOptionRepurchase =
        isTimedOptionPurchase && (itemDetails.owned === true || !!itemDetails.expirationTime);

      if (isTimedOptionRepurchase && selectedTimedOption) {
        AXAnalyticsService.sendAXTracking({
          itemName: AXAnalyticsConstants.PurchaseSuccessTimedOptionRepurchase,
          metaData: {
            metaData: JSON.stringify({
              itemId: itemDetails.id,
              itemType: itemDetails.itemType,
              subType:
                itemDetails.itemType === 'Bundle' ? itemDetails.bundleType : itemDetails.assetType,
              isLimited: isItemLimitedForEvents,
              isTimedOptionPurchase,
              rentalOptionDays: selectedTimedOption.days
            }),
            totalValue: selectedTimedOption.price
          },
          actionType: AXSendTrackingActionType.Click
        });
      }

      eventStreamService.sendEvent(
        {
          name: 'marketplaceWebPurchaseSuccess',
          type: 'marketplaceWebPurchaseSuccess',
          context: 'marketplaceWebPurchase'
        },
        analyticsParams
      );
    };
    return { ...params, onPurchaseSuccess };
  };

  const genTimedOptionPurchaseParams = (
    selectedTimedOption: TTimedOption | null | undefined
  ): TItemPurchaseParams | null =>
    attachPurchaseSuccessAnalytics(
      genPurchaseParams({
        itemDetails,
        expectedPrice,
        resellers,
        collectibleItemDetails,
        onlyFromReseller,
        timedOption: selectedTimedOption
      }),
      selectedTimedOption
    );

  const trackTimedOptionPurchaseClick = (
    selectedTimedOption: TTimedOption | null | undefined
  ): void => {
    trackPurchaseButtonClick(TPurchaseSource.ItemDetailsPage, {
      totalTransactionValue: selectedTimedOption?.price ?? expectedPrice ?? 0,
      transactionItems: JSON.stringify([
        {
          itemType: itemDetails.itemType,
          subType:
            itemDetails.itemType === 'Bundle' ? itemDetails.bundleType : itemDetails.assetType,
          itemId: itemDetails.id,
          resalePurchase: checkIfItemShouldPurchaseFromReseller(),
          isLimited: isItemLimitedForEvents,
          isTimedOptionPurchase: !!selectedTimedOption && selectedTimedOption.days > 0
        }
      ]),
      purchaseType: 'item-details-page-purchase',
      userId: CurrentUser.userId
    });
  };

  const itemPurchaseBestParams = genTimedOptionPurchaseParams(
    timedOptions[selectedTimedOptionIndex]
  );

  // An optional purchase link on original copy even if it's not the best price
  const renderPurchaseLink =
    itemPricingInfo.priceDisplayMode === 'COLLECTIBLE_ONLY_ORIGINAL' &&
    !!itemDetails.hasResellers &&
    resaleRestriction !== ResaleRestriction.DISABLED;
  const itemPurchaseLinkParams =
    renderPurchaseLink && itemPricingInfo.unitsAvailableForConsumption && !reachedQuantityLimit
      ? genPurchaseParams({
          itemDetails,
          expectedPrice,
          resellers: [],
          collectibleItemDetails,
          onlyFromReseller: false
        })
      : null;

  let priceLabel = itemTranslations.labelPrice();
  if (
    itemPricingInfo.priceDisplayMode === 'COLLECTIBLE_ONLY_RESELLERS' &&
    ((isInExperienceOnly && isExperienceLinkEnabled) || isCollectibleAndOffSale)
  ) {
    priceLabel = itemModelTranslations.labelResellers();
  } else if (
    itemPricingInfo.priceDisplayMode === 'LIMITED_WITH_RESELLERS' ||
    itemPricingInfo.priceDisplayMode === 'COLLECTIBLE_ONLY_RESELLERS'
  ) {
    priceLabel = itemTranslations.labelBestPrice();
  } else if (
    itemPricingInfo.priceDisplayMode === 'COLLECTIBLE_ONLY_ORIGINAL' &&
    resaleRestriction !== ResaleRestriction.DISABLED
  ) {
    priceLabel = catalogTranslations.labelOriginalPrice();
  }

  const isPurchaseButtonSuppressed =
    renderPurchaseLink ||
    itemPricingInfo.priceDisplayMode === 'COLLECTIBLE_IN_EXPERIENCE_ONLY_ORIGINAL' ||
    (isIEPWithHyperLinks &&
      !!collectibleItemDetails?.unitsAvailableForConsumption &&
      (itemPricingInfo?.lowestResalePrice ?? 0) > (itemPricingInfo.price ?? 0)) ||
    (isCollectibleAndOffSale && itemPricingInfo.priceDisplayMode === 'COLLECTIBLE_ONLY_ORIGINAL') ||
    !purchaseButtonLoaded;

  const isUnauthenticatedPurchaser =
    itemPricingInfo.priceDisplayMode === 'UNAUTHENTICATED_USER_PREMIUM_ITEM' ||
    !CurrentUser.isAuthenticated;

  const addToCartButton = !isFaeUnlockReady && (
    <AddToCartButton
      permanentPriceDiscountInformation={itemDetails.discountInformation}
      itemId={itemDetails.id}
      itemType={itemDetails.itemType}
      itemName={itemDetails.name}
      collectibleItemId={itemDetails.collectibleItemId}
      itemPrice={expectedPrice || 0}
      timedOptions={
        timedOptions.length > 0
          ? timedOptions.map((option, index) => ({
              ...option,
              selected: index === selectedTimedOptionIndex
            }))
          : undefined
      }
    />
  );

  const purchaseButton = isPurchaseButtonSuppressed ? (
    <React.Fragment />
  ) : (
    <div className='shopping-cart-buy-button item-purchase-btns-container'>
      {isUnauthenticatedPurchaser ? (
        <UnathentictedPurchaseButton {...props} itemPricingInfo={itemPricingInfo} />
      ) : (
        <PurchaseButton
          itemPurchaseParams={itemPurchaseBestParams}
          label={isFaeUnlockReady ? catalogTranslations.actionUnlock() : undefined}
          onBuyButtonClick={() =>
            trackTimedOptionPurchaseClick(timedOptions[selectedTimedOptionIndex])
          }
        />
      )}
      {addToCartButton}
    </div>
  );

  // When the item offers exactly one rental (timed) option alongside the
  // permanent option, replace the option selection chips with two dedicated
  // purchase buttons: a primary "Buy" (permanent) and a secondary "Rent" (the
  // single rental option), each priced for its own option. `timedOptions` here
  // always has the permanent option prepended, so "1 timed option" means one
  // entry with days > 0. Multiple rental options keep the chip selector.
  const permanentTimedOption = timedOptions.find(option => option.days === 0) ?? null;
  const rentalTimedOptions = timedOptions.filter(option => option.days > 0);
  const singleRentalTimedOption = rentalTimedOptions.length === 1 ? rentalTimedOptions[0] : null;
  const showTwoButtonTimedOptions =
    !!singleRentalTimedOption &&
    !!permanentTimedOption &&
    !isPurchaseButtonSuppressed &&
    !isUnauthenticatedPurchaser &&
    (!itemDetails.owned || !!itemDetails.expirationTime);

  const twoButtonTimedOptions = showTwoButtonTimedOptions ? (
    <div className='shopping-cart-buy-button item-purchase-btns-container timed-options-two-button-container'>
      <PurchaseButton
        itemPurchaseParams={genTimedOptionPurchaseParams(permanentTimedOption)}
        label={
          <TimedOptionPurchaseLabel
            label={
              isFaeUnlockReady
                ? catalogTranslations.actionUnlock()
                : catalogTranslations.actionBuy()
            }
            price={permanentTimedOption?.price ?? expectedPrice ?? 0}
          />
        }
        onBuyButtonClick={() => trackTimedOptionPurchaseClick(permanentTimedOption)}
      />
      <PurchaseButton
        itemPurchaseParams={genTimedOptionPurchaseParams(singleRentalTimedOption)}
        buttonClassName='btn-secondary-lg'
        label={
          <TimedOptionPurchaseLabel
            label={catalogTranslations.actionRent()}
            price={singleRentalTimedOption?.price ?? 0}
          />
        }
        onBuyButtonClick={() => trackTimedOptionPurchaseClick(singleRentalTimedOption)}
      />
      {addToCartButton && <div className='timed-options-buttons-divider' />}
      {addToCartButton}
    </div>
  ) : null;

  return (
    <div className='price-row-container'>
      <div className='price-container-text'>
        <ItemFirstLine
          itemOwned={itemDetails.owned}
          itemPricingInfo={itemPricingInfo}
          reachedQuantityLimit={reachedQuantityLimit}
          resaleRestriction={resaleRestriction}
          unitsAvailableForConsumption={itemPricingInfo.unitsAvailableForConsumption}
          experienceLinkEnabled={isExperienceLinkEnabled}
          isCollectibleAndOffSale={isCollectibleAndOffSale}
          hasResellers={hasResellers}
        />
        {itemDetails.expirationTime && (
          <div className='timed-option-expiration-time'>
            {catalogTranslations.messageTimedOptionsInYourInventoryUntil(
              dateTimeFormatter.getCustomDateTime(itemDetails.expirationTime, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })
            )}
            <div className='timed-option-expiration-time-avatar-container'>
              <OwnedItemButton
                assetType={(itemDetails?.itemType === 'Asset' && itemDetails?.assetType) || null}
                isBundle={itemDetails?.itemType === 'Bundle'}
              />
            </div>
          </div>
        )}
        {typeof expectedPrice === 'number' &&
          !nonPurchasableDisplayModes.includes(itemPricingInfo.priceDisplayMode) &&
          !showTwoButtonTimedOptions && (
            <div className='item-info-row-container'>
              <div className='text-label row-label price-label'>{priceLabel}</div>
              <div className='price-info row-content'>
                <Fragment>
                  <ItemPrice
                    expectedPrice={expectedPrice}
                    selectedTimedOption={
                      timedOptions.length > 0 ? timedOptions[selectedTimedOptionIndex] : null
                    }
                    itemPurchaseParams={itemPurchaseLinkParams}
                    priceDisplayMode={itemPricingInfo.priceDisplayMode}
                    renderPurchaseLink={renderPurchaseLink}
                    resaleRestriction={resaleRestriction}
                    isInExperienceOnly={isInExperienceOnly}
                    isCollectibleAndOffSale={isCollectibleAndOffSale}
                    discountInformation={itemDetails.discountInformation}
                    isResalePurchase={isResalePurchase}
                  />
                  <PriceSubText
                    {...props}
                    expectedPrice={expectedPrice}
                    itemPricingInfo={itemPricingInfo}
                    isIEPWithHyperLinks={isIEPWithHyperLinks}
                  />
                  {isFaeUnlockReady && (
                    <div className='facial-auth-price-subtitle font-body text'>
                      {catalogTranslations.labelAgeCheckComplete()}
                    </div>
                  )}
                  {timedOptions.length === 0 && purchaseButton}
                </Fragment>
              </div>
            </div>
          )}
        {timedOptions.length > 0 && (!itemDetails.owned || !!itemDetails.expirationTime) && (
          <div className='clearfix item-info-row-container timed-options-row-container'>
            <div className='font-header-1 text-subheader text-label text-overflow row-label'>
              <Tooltip
                placement='right'
                id='hold-tooltip'
                content={
                  <div>
                    <div className='font-caption-body text resellable-tooltip-body-text tooltip-title-bold'>
                      {catalogTranslations.labelTimedOptionsTooltipTitle()}
                    </div>
                    <div className='holding-tooltip-body'>
                      <div className='font-caption-body text resellable-tooltip-body-text'>
                        {catalogTranslations.labelTimedOptionsTooltipBody()}
                      </div>
                    </div>
                  </div>
                }
                containerClassName='item-details-info-tooltip-container'>
                <span className='item-hold-tooltip'>
                  <span className='font-body text'>{catalogTranslations.labelOptions()}</span>
                  <span className='icon-actions-info-sm item-hold-icon' />
                </span>
              </Tooltip>
            </div>
            <span className='font-body text wait-for-i18n-format-render timed-options-content'>
              {showTwoButtonTimedOptions ? (
                twoButtonTimedOptions
              ) : (
                <Fragment>
                  <div className='timed-options-container'>
                    {timedOptions.map(timedOption => (
                      <TimedOption
                        key={timedOption.days}
                        timedOption={timedOption}
                        selected={selectedTimedOptionIndex === timedOptions.indexOf(timedOption)}
                        onTimedOptionSelected={() =>
                          setSelectedTimedOptionIndex(timedOptions.indexOf(timedOption))
                        }
                      />
                    ))}
                  </div>
                  {purchaseButton}
                </Fragment>
              )}
            </span>
          </div>
        )}
        {showTwoButtonTimedOptions && singleRentalTimedOption && (
          <div className='clearfix item-info-row-container rent-option-row-container'>
            <div className='font-header-1 text-subheader text-label text-overflow row-label'>
              <span className='font-body text'>{catalogTranslations.labelRentOption()}</span>
            </div>
            <span className='font-body text row-content'>
              {catalogTranslations.labelTimedOptionDays(singleRentalTimedOption.days)}
            </span>
          </div>
        )}
      </div>
      {itemDetails.owned && !isItemLimited && !isItemCollectible && !itemDetails.expirationTime && (
        <OwnedItemButton
          assetType={(itemDetails?.itemType === 'Asset' && itemDetails?.assetType) || null}
          isBundle={itemDetails?.itemType === 'Bundle'}
        />
      )}
    </div>
  );
};
export default ItemPriceContainer;
