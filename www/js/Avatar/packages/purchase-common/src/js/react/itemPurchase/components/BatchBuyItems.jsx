import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, ProgressCircle } from '@rbx/foundation-ui';
import { getUrlWithQueries } from '@rbx/core-scripts/util/url';
import { formatNumber } from '@rbx/core-scripts/format/number';
import * as httpService from '@rbx/core-scripts/http';
import { isAuthenticated, isPremiumUser } from '@rbx/core-scripts/meta/user';
import createMultiItemPurchaseModal from '../factories/createMultiItemPurchaseModal';
import createInsufficientFundsModal from '../factories/createInsufficientFundsModal';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import createLeaveRobloxWarningModal from '../factories/createLeaveRobloxWarningModal';
import urlConstants from '../constants/urlConstants';
import universalAppConfigurationService from '../services/universalAppConfigurationService';

const { resources } = itemPurchaseConstants;

const [InsufficientFundsModal, InsufficientFundsModalService] = createInsufficientFundsModal();
const MultiItemPurchaseModal = createMultiItemPurchaseModal();
const LeaveRobloxWarningModal = createLeaveRobloxWarningModal();

export function BatchBuyItems({
  currentUserBalance,
  items,
  itemDetails,
  purchaseMetadata,
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
}) {
  let shouldDisplayBuyButton = false;
  let price = 0;
  let premiumPrice = 0;
  const resaleItems = [];
  const [purchasePending, setPurchasePending] = useState(false);
  const [shouldRedirectToVng, setShouldRedirectToVng] = useState(false);
  const [isMultiItemModalOpen, setIsMultiItemModalOpen] = useState(false);
  const [isLeaveRobloxModalOpen, setIsLeaveRobloxModalOpen] = useState(false);
  // Keep the multi-item modal mounted once opened so its sibling 2SV modal survives
  // a confirm while the bulk purchase is still in flight (a 2SV challenge can come back
  // in the purchase response).
  const [hasMultiItemModalMounted, setHasMultiItemModalMounted] = useState(false);
  const [insufficientFundsModal, setInsufficientFundsModal] = useState(null);

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
      .then(response => {
        const { shouldShowVng } = response;
        setShouldRedirectToVng(shouldShowVng);
      })
      .catch(errorRes => {
        console.debug(errorRes);
        setShouldRedirectToVng(false);
      });
  }, []);

  const isItemPurchasable = item => {
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
            window.location = getLoginUrl();
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
    if (itemPurchaseInfo?.timedOption) {
      price += itemPurchaseInfo.timedOption.price;
    } else if (item.collectibleItemDetails !== undefined) {
      if (item.collectibleItemDetails.lowestPrice) {
        price += item.collectibleItemDetails.lowestPrice;
      } else if (item.collectibleItemId.price) {
        price += item.collectibleItemDetails.price;
      }
    } else if (item.premiumPriceInRobux && isPremiumUser()) {
      premiumPrice += item.premiumPriceInRobux;
    } else if (item.lowestPrice) {
      price += item.lowestPrice;
    } else if (item.price) {
      price += item.price;
    }

    if (item.resellerAvailable) {
      resaleItems.push(item);
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
      const modal = (
        <InsufficientFundsModal
          robuxNeeded={robuxNeeded}
          onAccept={handleInsufficientFundsButtonClick}
        />
      );
      setInsufficientFundsModal(modal);
      InsufficientFundsModalService.open();
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
      window.location = urlConstants.getRobuxUpgradesUrl('');
    }
  };

  const handleLeaveRobloxWarningButtonClick = () => {
    const urlConfig = {
      url: urlConstants.getVngShopUrl(),
      withCredentials: true
    };

    httpService
      .get(urlConfig)
      .then(({ data: { vngShopRedirectUrl } }) => {
        window.open(vngShopRedirectUrl, '_blank').focus();
      })
      .catch(() => {
        window.open(urlConstants.getVngShopFallbackUrl, '_blank').focus();
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
      {robuxNeeded > 0 && <div id='insufficient-funds-modal'>{insufficientFundsModal}</div>}
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
            itemDetails={itemDetails}
            resaleItems={resaleItems}
            currentRobuxBalance={currentUserBalance}
            onCancel={() => {
              setIsMultiItemModalOpen(false);
              onCancel();
            }}
            onTransactionComplete={result => {
              setPurchasePending(false);
              onTransactionComplete(result);
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

BatchBuyItems.propTypes = {
  currentUserBalance: PropTypes.number.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      itemType: PropTypes.string.isRequired,
      timedOption: PropTypes.shape({
        days: PropTypes.number.isRequired,
        price: PropTypes.number.isRequired
      })
    })
  ).isRequired,
  purchaseMetadata: PropTypes.instanceOf(Map).isRequired,
  itemDetails: PropTypes.arrayOf(
    PropTypes.shape({
      productId: PropTypes.number.isRequired,
      price: PropTypes.number.isRequired,
      itemName: PropTypes.string.isRequired,
      itemType: PropTypes.string.isRequired,
      assetTypeDisplayName: PropTypes.string.isRequired,
      sellerName: PropTypes.string.isRequired,
      expectedSellerId: PropTypes.number.isRequired,
      isPurchasable: PropTypes.bool.isRequired,
      isOwned: PropTypes.bool.isRequired,
      isPlugin: PropTypes.bool.isRequired,
      itemDetailItemId: PropTypes.number.isRequired,
      loading: PropTypes.bool.isRequired,
      loadFailure: PropTypes.bool,
      userQualifiesForPremiumPrices: PropTypes.bool.isRequired,
      premiumPriceInRobux: PropTypes.number,
      isAuthenticated: PropTypes.bool.isRequired,
      resellerAvailable: PropTypes.bool.isRequired,
      firstReseller: PropTypes.shape({
        seller: {
          name: PropTypes.string.isRequired,
          id: PropTypes.number.isRequired
        },
        userAssetId: PropTypes.number.isRequired
      }),
      isMarketPlaceEnabled: PropTypes.bool.isRequired
    })
  ).isRequired,
  onBuyButtonClick: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onTransactionComplete: PropTypes.func.isRequired,
  productSurface: PropTypes.string.isRequired,
  displayPriceOnButton: PropTypes.bool.isRequired,
  systemFeedbackService: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
  variant: PropTypes.string,
  size: PropTypes.string
};

BatchBuyItems.defaultProps = {
  variant: 'Emphasis',
  size: 'Large'
};

// BatchBuyPriceContainer always passes `translate` as a prop, so the withTranslations
// HOC is redundant here (and would clobber that prop on Next).
export const BatchBuyItemsButton = BatchBuyItems;
