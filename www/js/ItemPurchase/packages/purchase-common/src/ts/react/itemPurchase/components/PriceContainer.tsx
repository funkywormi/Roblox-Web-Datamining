import React from 'react';
import { isAuthenticated, isPremiumUser } from '@rbx/core-scripts/meta/user';
import loadItemDetails from '../factories/loadItemDetails';
import itemDetailsService from '../services/itemDetailsService';
import itemDetailData from '../util/itemDetailData';
import BuyItem from './BuyItem';
import PriceContainerText from './PriceContainerText';
import Timer from './Timer';
import OwnedItemButton from './OwnedItemButton';

const { getCurrentitemDetail } = itemDetailData;

// Each child is a dual-path translation boundary: on .NET it self-wraps a TranslationProviderSCC
// for its own namespaces; a Next.js host would pass `translate` to each child directly. So this
// container threads no `translate` — matching the legacy HOC, where each child re-sourced its own
// namespaces regardless of any injected value.
function PriceContainer() {
  const { itemDetailItemId, itemDetailItemType } =
    getCurrentitemDetail() ?? { itemDetailItemId: 0, itemDetailItemType: null };
  const { itemDetail } = loadItemDetails(
    itemDetailsService.getItemDetails,
    itemDetailItemId,
    itemDetailItemType ?? ''
  );

  const renderPurchaseButton = () => {
    if (
      itemDetail.owned &&
      (!itemDetail.isLimited || itemDetail.unitsAvailableForConsumption > 0)
    ) {
      return (
        <div className='action-button'>
          <OwnedItemButton
            {...{
              assetType: itemDetail.assetType
            }}
          />
        </div>
      );
    }
    return (
      <div className='action-button'>
        <BuyItem
          {...{
            productId: itemDetail.productId,
            price: itemDetail.price,
            itemType: itemDetail.itemType,
            assetTypeDisplayName: itemDetail.assetTypeDisplayName,
            itemName: itemDetail.name,
            sellerName: itemDetail.creatorName,
            expectedSellerId: itemDetail.expectedSellerId,
            isPurchasable: itemDetail.isPurchasable,
            itemDetailItemId,
            loading: itemDetail.loading,
            hasLimitedPrivateSales: itemDetail.hasLimitedPrivateSales,
            userQualifiesForPremiumPrices: isPremiumUser(),
            premiumPriceInRobux: itemDetail.premiumPriceInRobux,
            isAuthenticated: isAuthenticated(),
            unitsAvailableForConsumption: itemDetail.unitsAvailableForConsumption,
            isLimited: itemDetail.isLimited,
            resellerAvailable: itemDetail.resellerAvailable,
            firstReseller: itemDetail.firstReseller,
            isMarketPlaceEnabled: itemDetail.isMarketPlaceEnabled
          }}
        />
        {itemDetail.offSaleDeadline !== null && (
          <Timer {...{ offSaleDeadline: itemDetail.offSaleDeadline }} />
        )}
      </div>
    );
  };

  return (
    <React.Fragment>
      <PriceContainerText
        {...{
          price: itemDetail.price,
          itemType: itemDetail.itemType,
          itemDetailItemId,
          premiumPriceInRobux: itemDetail.premiumPriceInRobux,
          premiumDiscountPercentage: itemDetail.premiumDiscountPercentage,
          userQualifiesForPremiumPrices: isPremiumUser(),
          isOwned: itemDetail.owned,
          loading: itemDetail.loading,
          loadFailure: itemDetail.loadFailure,
          unitsAvailableForConsumption: itemDetail.unitsAvailableForConsumption,
          isLimited: itemDetail.isLimited,
          resellerAvailable: itemDetail.resellerAvailable,
          priceStatus: itemDetail.priceStatus,
          offSaleDeadline: itemDetail.offSaleDeadline,
          isMarketPlaceEnabled: itemDetail.isMarketPlaceEnabled
        }}
      />
      {!itemDetail.loadFailure && renderPurchaseButton()}
    </React.Fragment>
  );
}

export default PriceContainer;
