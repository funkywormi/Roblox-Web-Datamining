import React, { useEffect, useState } from 'react';
import { Button, ProgressCircle } from '@rbx/foundation-ui';
import { getUrlWithQueries } from '@rbx/core-scripts/util/url';
import { formatNumber } from '@rbx/core-scripts/format/number';
import * as httpService from '@rbx/core-scripts/http';
import { isAuthenticated, isPremiumUser } from '@rbx/core-scripts/meta/user';
import createMultiItemPurchaseModal from '../factories/createMultiItemPurchaseModal';
import { InsufficientFundsModal } from '../factories/createInsufficientFundsModal';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import createLeaveRobloxWarningModal from '../factories/createLeaveRobloxWarningModal';
import urlConstants from '../constants/urlConstants';
import universalAppConfigurationService from '../services/universalAppConfigurationService';
import { type PurchaseTranslate } from '../useTranslate';
import type { ParsedItemDetail } from '../types/itemDetails';
import type {
  BatchPurchaseItem,
  BatchPurchaseItemResult,
  MarketplaceOfferPricing,
  SystemFeedbackService
} from '../types/batchPurchase';

const { resources } = itemPurchaseConstants;

const MultiItemPurchaseModal = createMultiItemPurchaseModal();
const LeaveRobloxWarningModal = createLeaveRobloxWarningModal();

export type TButtonVariant = React.ComponentProps<typeof Button>['variant'];
export type TButtonSize = React.ComponentProps<typeof Button>['size'];

interface BatchBuyItemsProps {
  currentUserBalance: number | undefined;
  items: BatchPurchaseItem[];
  itemDetails: ParsedItemDetail[];
  purchaseMetadata: Map<string, string | undefined>;
  marketplaceOfferPricing?: MarketplaceOfferPricing;
  onBuyButtonClick: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  onTransactionComplete: (results: BatchPurchaseItemResult[]) => void;
  productSurface: string;
  displayPriceOnButton: boolean;
  systemFeedbackService: SystemFeedbackService;
  translate: PurchaseTranslate;
  variant?: TButtonVariant;
  size?: TButtonSize;
}

export function BatchBuyItems({
  currentUserBalance,
  items,
  itemDetails,
  purchaseMetadata,
  marketplaceOfferPricing,
  onBuyButtonClick,
  onConfirm,
  onCancel,
  onTransactionComplete,
  productSurface,
  displayPriceOnButton,
  systemFeedbackService,
  translate,
  variant = 'Emphasis',
  size = 'Large'
}: BatchBuyItemsProps) {
  let shouldDisplayBuyButton = false;
  let price = 0;
  let premiumPrice = 0;
  const [purchasePending, setPurchasePending] = useState(false);
  const [shouldRedirectToVng, setShouldRedirectToVng] = useState(false);
  const [isMultiItemModalOpen, setIsMultiItemModalOpen] = useState(false);
  const [isLeaveRobloxModalOpen, setIsLeaveRobloxModalOpen] = useState(false);
  // Keep the multi-item modal mounted once opened so its sibling 2SV modal survives
  // a confirm while the bulk purchase is still in flight (a 2SV challenge can come back
  // in the purchase response).
  const [hasMultiItemModalMounted, setHasMultiItemModalMounted] = useState(false);
  const [isInsufficientFundsOpen, setIsInsufficientFundsOpen] = useState(false);

  const getLoginUrl = () => {
    const parsedParams = {
      ReturnUrl: window.location.pathname
    };
    const loginRedirUrl = getUrlWithQueries('/login', parsedParams);
    return loginRedirUrl;
  };

  useEffect(() => {
    universalAppConfigurationService
      .getVngBuyRobuxBehavior()
      .then(({ shouldShowVng }) => {
        setShouldRedirectToVng(shouldShowVng);
      })
      .catch((errorRes: unknown) => {
        console.debug(errorRes);
        setShouldRedirectToVng(false);
      });
  }, []);

  const isItemPurchasable = (item: ParsedItemDetail) => {
    if (item.collectibleItemId !== undefined) {
      return (item.isMarketPlaceEnabled && item.isPurchasable) || item.resellerAvailable;
    }
    return item.isMarketPlaceEnabled && (item.resellerAvailable || item.isPurchasable);
  };

  if (!isAuthenticated()) {
    return (
      <div className='sign-in'>
        <Button
          className='action-button batch-buy-purchase-button sign-in-button'
          variant={variant}
          size={size}
          onClick={() => {
            window.location.href = getLoginUrl();
          }}>
          {translate(resources.buyAction)}
        </Button>
      </div>
    );
  }

  if (
    itemDetails === undefined ||
    (itemDetails.length > 0 && itemDetails[0] && itemDetails[0].loading) ||
    currentUserBalance === undefined
  ) {
    return (
      <div className='loading'>
        <Button
          className='action-button batch-buy-purchase-button'
          variant={variant}
          size={size}
          isDisabled>
          <ProgressCircle variant="Indeterminate" size="Small" ariaLabel="Loading" />
        </Button>
      </div>
    );
  }

  if (itemDetails.length === 0 || (itemDetails[0] && itemDetails[0].loadFailure)) {
    return (
      <Button
        className='action-button batch-buy-purchase-button'
        variant={variant}
        size={size}
        isDisabled>
        {displayPriceOnButton ? (
          <div className='purchase-price'>
            <span className='icon-robux-white-28x28' />
            <span className='purchase-price-text text-robux-lg'>
              {formatNumber(price)}
            </span>
          </div>
        ) : (
          <div>{translate(resources.buyAction)}</div>
        )}
      </Button>
    );
  }

  itemDetails.forEach(item => {
    if (isItemPurchasable(item)) {
      shouldDisplayBuyButton = true;
    }
    const itemPurchaseInfo = items.find(i => i.id === item.id && i.itemType === item.itemType);
    const marketplaceOfferPrice =
      item.collectibleItemId === undefined
        ? undefined
        : marketplaceOfferPricing?.[item.collectibleItemId]?.priceInRobux;
    if (marketplaceOfferPrice !== undefined) {
      price += marketplaceOfferPrice;
    } else if (itemPurchaseInfo?.timedOption) {
      price += itemPurchaseInfo.timedOption.price;
    } else if (item.collectibleItemDetails !== undefined) {
      if (item.collectibleItemDetails.lowestPrice) {
        price += item.collectibleItemDetails.lowestPrice;
      } else if (
        // TODO: never true (collectibleItemId is a string); likely meant collectibleItemDetails.price.
        (item.collectibleItemId as unknown as { price?: number }).price
      ) {
        price += item.collectibleItemDetails.price!;
      }
    } else if (item.premiumPriceInRobux && isPremiumUser()) {
      premiumPrice += item.premiumPriceInRobux;
    } else if (item.lowestPrice) {
      price += item.lowestPrice;
    } else if (item.price) {
      price += item.price;
    }
  });

  const robuxNeeded = price + premiumPrice - currentUserBalance;

  const getButtonType = () => {
    if (price === 0) {
      return translate(resources.getAction);
    }
    return translate(resources.buyAction);
  };

  const handleButtonClick = () => {
    if (robuxNeeded > 0) {
      setIsInsufficientFundsOpen(true);
    } else {
      setHasMultiItemModalMounted(true);
      setIsMultiItemModalOpen(true);
    }
    onBuyButtonClick();
  };

  let innerButton = <ProgressCircle variant="Indeterminate" size="Small" ariaLabel="Loading" />;
  if (!purchasePending) {
    innerButton = displayPriceOnButton ? (
      <div className='purchase-price'>
        <span className='icon-robux-white-28x28' />
        <span className='purchase-price-text text-robux-lg'>
          {formatNumber(price)}
        </span>
      </div>
    ) : (
      <div>{translate(resources.buyAction)}</div>
    );
  }
  const handleInsufficientFundsButtonClick = () => {
    if (shouldRedirectToVng) {
      setIsLeaveRobloxModalOpen(true);
    } else {
      window.location.href = urlConstants.getRobuxUpgradesUrl('');
    }
  };

  const handleLeaveRobloxWarningButtonClick = () => {
    const urlConfig = {
      url: urlConstants.getVngShopUrl(),
      withCredentials: true
    };

    httpService
      .get<{ vngShopRedirectUrl: string }>(urlConfig)
      .then(({ data: { vngShopRedirectUrl } }) => {
        window.open(vngShopRedirectUrl, '_blank')?.focus();
      })
      .catch(() => {
        window.open(urlConstants.getVngShopFallbackUrl(), '_blank')?.focus();
      });

    setIsLeaveRobloxModalOpen(false);
  };

  return (
    <React.Fragment>
      <div className='batch-buy-purchase-button-container'>
        <Button
          className='action-button batch-buy-purchase-button'
          variant={variant}
          size={size}
          onClick={handleButtonClick}
          isDisabled={!shouldDisplayBuyButton}>
          {innerButton}
        </Button>
      </div>
      {robuxNeeded > 0 && (
        <div id='insufficient-funds-modal'>
          <InsufficientFundsModal
            open={isInsufficientFundsOpen}
            robuxNeeded={robuxNeeded}
            onAccept={handleInsufficientFundsButtonClick}
            onClose={() => setIsInsufficientFundsOpen(false)}
          />
        </div>
      )}
      {shouldRedirectToVng && (
        <div id='leave-roblox-warning-modal'>
          <LeaveRobloxWarningModal
            open={isLeaveRobloxModalOpen}
            onContinueToPayment={handleLeaveRobloxWarningButtonClick}
            onClose={() => setIsLeaveRobloxModalOpen(false)}
          />
        </div>
      )}
      {hasMultiItemModalMounted && (
        <div id='multi-item-purchase-modal'>
          <MultiItemPurchaseModal
            open={isMultiItemModalOpen}
            title={translate(resources.buyNowAction)}
            expectedTotalPrice={price + premiumPrice}
            items={items}
            purchaseMetadata={purchaseMetadata}
            marketplaceOfferPricing={marketplaceOfferPricing}
            itemDetails={itemDetails}
            currentRobuxBalance={currentUserBalance}
            onCancel={() => {
              setIsMultiItemModalOpen(false);
              onCancel();
            }}
            onTransactionComplete={results => {
              setPurchasePending(false);
              onTransactionComplete(results);
            }}
            onAction={() => {
              setIsMultiItemModalOpen(false);
              setPurchasePending(true);
              onConfirm();
            }}
            loading={false}
            productSurface={productSurface}
            systemFeedbackService={systemFeedbackService}
          />
        </div>
      )}
    </React.Fragment>
  );
}



// BatchBuyPriceContainer always passes `translate` as a prop, so the withTranslations
// HOC is redundant here (and would clobber that prop on Next).
export const BatchBuyItemsButton = BatchBuyItems;
