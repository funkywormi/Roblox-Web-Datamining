import React from 'react';
import { ProgressCircle } from '@rbx/foundation-ui';
import { renderToString } from 'react-dom/server';
import { formatNumber } from '@rbx/core-scripts/format/number';
import paymentFlowAnalyticsService from '@rbx/core-scripts/payments-flow';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import PriceLabel from './PriceLabel';
import PriceLabelText from './PriceLabelText';
import urlConstants from '../constants/urlConstants';
import { SelfProvidedTranslate } from '../SelfProvidedTranslate';
import { itemModelNamespaces, useItemModelTranslate, type PurchaseTranslate } from '../useTranslate';

const { resources, errorMessages } = itemPurchaseConstants;
const { getPremiumConversionUrl } = urlConstants;

interface PriceContainerTextProps {
  translate?: PurchaseTranslate;
  price?: number | null;
  itemType: string;
  itemDetailItemId: number;
  premiumPriceInRobux: number | null;
  premiumDiscountPercentage: number | null;
  userQualifiesForPremiumPrices: boolean;
  isOwned: boolean;
  loading: boolean;
  loadFailure: boolean;
  unitsAvailableForConsumption: number;
  isLimited: boolean;
  resellerAvailable: boolean;
  priceStatus: string;
  offSaleDeadline: string | null;
  isMarketPlaceEnabled?: boolean;
}

function PriceContainerText({
  translate,
  price,
  itemType,
  itemDetailItemId,
  premiumPriceInRobux,
  premiumDiscountPercentage,
  userQualifiesForPremiumPrices,
  isOwned,
  loading,
  loadFailure,
  unitsAvailableForConsumption,
  isLimited,
  resellerAvailable,
  priceStatus,
  offSaleDeadline,
  isMarketPlaceEnabled
}: PriceContainerTextProps & { translate: PurchaseTranslate }) {
  const showRenderRobuxIcon = premiumPriceInRobux == null && price == null;
  let itemFirstLineDisplayEnabled = true;
  let firstLineText = '';

  const sendPaymentFlowEvent = (event: React.MouseEvent<HTMLAnchorElement>) => {
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_PREMIUM_PURCHASE,
      false,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.PREMIUM_UPSELL,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
      (event.target as HTMLElement).innerText
    );
  };
  const renderPremiumPrice = () => {
    if (premiumPriceInRobux == null || isOwned) {
      return null;
    }
    if (price == null) {
      if (userQualifiesForPremiumPrices) {
        return (
          <span className='small text field-content empty-label wait-for-i18n-format-render'>
            {translate(resources.premiumExclusiveEligiblePromptLabel)}
          </span>
        );
      }
      return (
        <span className='small text field-content empty-label wait-for-i18n-format-render'>
          {translate(resources.premiumExclusiveIneligiblePromptLabel)}
        </span>
      );
    }
    const assetInfo = {
      originalPrice: renderToString(<PriceLabel {...{ price }} />),
      discountPercentage: premiumDiscountPercentage,
      premiumDiscountedPrice: renderToString(<PriceLabel {...{ price: premiumPriceInRobux }} />)
    };
    return (
      <React.Fragment>
        <div className='text-label field-label empty-label'>&nbsp;</div>
        <span className='premium-prompt small text field-content empty-label wait-for-i18n-format-render'>
          {userQualifiesForPremiumPrices ? (
            <a
              aria-label=' '
              href={getPremiumConversionUrl(itemDetailItemId, itemType)}
              dangerouslySetInnerHTML={{
                __html: translate(resources.premiumDiscountSavingsLabel, assetInfo)
              }}
              onClick={event => {
                sendPaymentFlowEvent(event);
                window.open(getPremiumConversionUrl(itemDetailItemId, itemType));
              }}
            />
          ) : (
            <a
              aria-label=' '
              href={getPremiumConversionUrl(itemDetailItemId, itemType)}
              dangerouslySetInnerHTML={{
                __html: translate(resources.premiumDiscountOpportunityPromptLabel, assetInfo)
              }}
              onClick={event => {
                sendPaymentFlowEvent(event);
                window.open(getPremiumConversionUrl(itemDetailItemId, itemType));
              }}
            />
          )}
        </span>
      </React.Fragment>
    );
  };

  if (loading) {
    return <ProgressCircle variant="Indeterminate" size="Medium" ariaLabel="Loading" />;
  }

  if (!loading && loadFailure) {
    firstLineText = errorMessages.retryErrorMessage;
    // TODO(WEB-3440): `resources.offSale` has never existed on itemPurchaseConstants, so this
    // branch is dead (unchanged from the legacy .jsx). Point it at the real price-status constant
    // in a follow-up rather than reviving it silently here.
  } else if (priceStatus === (resources as { offSale?: string }).offSale && offSaleDeadline === null) {
    firstLineText = translate(resources.itemNoLongerForSaleLabel);
  } else if (!isMarketPlaceEnabled && !isOwned) {
    firstLineText = translate(resources.purchasingTemporarilyUnavailableLabel);
  } else if (isOwned && !isLimited) {
    firstLineText = translate(resources.itemAvailableInventoryLabel);
  } else if (isLimited && unitsAvailableForConsumption === 0 && !resellerAvailable) {
    firstLineText = translate(resources.noOneCurrentlySellingLabel);
  } else {
    itemFirstLineDisplayEnabled = false;
  }

  if (price === 0) {
    return null;
  }

  // checks if item is owned: owned item displays both itemFirstLine message
  if (itemFirstLineDisplayEnabled && !isOwned) {
    return (
      <div className='price-container-text'>
        <div className='item-first-line'> {firstLineText} </div>
      </div>
    );
  }

  return (
    <div className='price-container-text'>
        {itemFirstLineDisplayEnabled ? (
          <div className='item-first-line'> {firstLineText} </div>
        ) : null}
        {/* PriceLabelText self-sources its own (itemResources) namespaces; forwarding this
            component's itemModelResources translate would look its keys up in the wrong
            namespace. This mirrors the legacy HOC, which re-sourced per component. */}
        <PriceLabelText {...{ isLimited, resellerAvailable }} />
        <div className='price-info'>
          <div className='icon-text-wrapper clearfix icon-robux-price-container'>
            {showRenderRobuxIcon ? (
              <span className='icon-robux-16x16 icon-robux-gray-16x16 wait-for-i18n-format-render' />
            ) : (
              <span className='icon-robux-16x16 wait-for-i18n-format-render' />
            )}
            <span className='text-robux-lg wait-for-i18n-format-render'>
              {userQualifiesForPremiumPrices && premiumPriceInRobux != null
                ? formatNumber(premiumPriceInRobux)
                : formatNumber(price ?? 0)}
            </span>
          </div>
        </div>
        {renderPremiumPrice()}
      </div>
  );
}


export default function PriceContainerTextWithTranslations({
  translate,
  ...props
}: PriceContainerTextProps) {
  return (
    <SelfProvidedTranslate
      translate={translate}
      namespaces={itemModelNamespaces}
      useTranslate={useItemModelTranslate}
      render={t => <PriceContainerText {...props} translate={t} />}
    />
  );
}
