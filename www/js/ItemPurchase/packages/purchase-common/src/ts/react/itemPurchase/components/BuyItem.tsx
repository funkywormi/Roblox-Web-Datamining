import React from 'react';
import { Button, ProgressCircle } from '@rbx/foundation-ui';
import { Thumbnail2d } from '@rbx/www-common/components/thumbnail';
import paymentFlowAnalyticsService from '@rbx/core-scripts/payments-flow';
import createItemPurchase from '../factories/createItemPurchase';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import urlConstants from '../constants/urlConstants';
import { SelfProvidedTranslate } from '../SelfProvidedTranslate';
import { itemNamespaces, useItemTranslate, type PurchaseTranslate } from '../useTranslate';
import type { Reseller } from '../types/itemDetails';

const [ItemPurchase, itemPurchaseService] = createItemPurchase();
const { resources } = itemPurchaseConstants;
const { getPremiumConversionUrl } = urlConstants;

interface BuyItemProps {
  translate?: PurchaseTranslate;
  productId: number;
  price?: number | null;
  itemName: string;
  itemType: string;
  assetTypeDisplayName: string;
  sellerName: string;
  expectedSellerId: number;
  isPurchasable: boolean;
  itemDetailItemId: number;
  loading: boolean;
  userQualifiesForPremiumPrices: boolean;
  premiumPriceInRobux: number | null;
  isAuthenticated: boolean;
  resellerAvailable: boolean;
  firstReseller?: Reseller;
  isMarketPlaceEnabled?: boolean;
}

function BuyItem({
  translate,
  productId,
  price,
  itemName,
  itemType,
  assetTypeDisplayName,
  sellerName,
  expectedSellerId,
  isPurchasable,
  itemDetailItemId,
  loading,
  userQualifiesForPremiumPrices,
  premiumPriceInRobux,
  isAuthenticated,
  resellerAvailable,
  firstReseller,
  isMarketPlaceEnabled
}: BuyItemProps & { translate: PurchaseTranslate }) {
  const shouldDisplayBuyButton = isMarketPlaceEnabled && (resellerAvailable || isPurchasable);
  const getButtonType = () => {
    if (price === 0) {
      return translate(resources.getAction);
    }
    return translate(resources.buyAction);
  };
  if (loading) {
    return <ProgressCircle variant="Indeterminate" size="Medium" ariaLabel={translate("Label.Loading")} />;
  }
  if (!isAuthenticated) {
    if (premiumPriceInRobux != null) {
      return (
        <Button
          id='upgrade-button'
          className='btn-fixed-width-lg btn-primary-lg'
          onClick={() => {
            paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
              paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_PREMIUM_PURCHASE,
              false,
              paymentFlowAnalyticsService.ENUM_VIEW_NAME.PREMIUM_UPSELL,
              paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
              paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.GET_PREMIUM
            );
            window.open(getPremiumConversionUrl(itemDetailItemId, itemType));
          }}>
          {translate(resources.getPremiumAction)}
        </Button>
      );
    }
    return (
      <Button
        className='btn-fixed-width-lg btn-growth-lg PurchaseButton'
        onClick={() => {
          window.location.href = '/login';
        }}>
        {getButtonType()}
      </Button>
    );
  }

  const thumbnail = (
    <Thumbnail2d
      type={itemType === 'bundle' ? 'BundleThumbnail' : 'Asset'}
      size='150x150'
      targetId={itemDetailItemId}
      format='webp'
      altName={itemName}
    />
  );

  return (
    <React.Fragment>
      <Button
        className='btn-fixed-width-lg btn-growth-lg PurchaseButton'
        onClick={itemPurchaseService.start}
        isDisabled={!shouldDisplayBuyButton}>
        {getButtonType()}
      </Button>
      <ItemPurchase
        {...{
          productId,
          expectedPrice:
            userQualifiesForPremiumPrices && premiumPriceInRobux != null
              ? premiumPriceInRobux
              : price,
          thumbnail,
          assetTypeDisplayName,
          assetName: itemName,
          sellerName: firstReseller ? firstReseller.seller.name : sellerName,
          expectedSellerId: firstReseller ? firstReseller.seller.id : expectedSellerId,
          userAssetId: firstReseller ? firstReseller.userAssetId : 0,
          showSuccessBanner: true
        }}
      />
    </React.Fragment>
  );
}


export default function BuyItemWithTranslations({ translate, ...props }: BuyItemProps) {
  return (
    <SelfProvidedTranslate
      translate={translate}
      namespaces={itemNamespaces}
      useTranslate={useItemTranslate}
      render={t => <BuyItem {...props} translate={t} />}
    />
  );
}
