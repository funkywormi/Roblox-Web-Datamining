/* eslint-disable react/jsx-no-literals */
import React, { Fragment } from 'react';
import { TItemPricing } from '../constants/types';
import { TItemDetailsInfoBodyProps } from './ItemDetailsInfoBody';
import {
  itemModelTranslations,
  catalogTranslations,
  itemTranslations
} from '../services/translationService';
import { hrefs } from '../constants/urlConfigs';
import { consumableDisplayModes } from '../constants/pricingConstants';
import { isCollectible, isLimited } from '../utils/itemDetailUtils';

type TItemPriceProps = TItemDetailsInfoBodyProps & {
  itemPricingInfo: TItemPricing;
  expectedPrice: number | null; // eslint-disable-line react/no-unused-prop-types
  isIEPWithHyperLinks: boolean;
};

export default function PriceSubText({
  itemPricingInfo,
  itemDetails,
  collectibleItemDetails,
  isIEPWithHyperLinks
}: TItemPriceProps): JSX.Element | null {
  const {
    priceDisplayMode,
    premiumPrice,
    price,
    premiumDiscountPercentage,
    unitsAvailableForConsumption,
    totalQuantity
  } = itemPricingInfo;
  const isLimitedAndOffSale =
    isLimited(itemDetails.itemRestrictions) &&
    (itemDetails.isOffSale === true || collectibleItemDetails?.isOffSale === true);

  if (
    priceDisplayMode === 'PREMIUM_USER_PREMIUM_ITEM' &&
    typeof premiumDiscountPercentage === 'number' &&
    typeof price === 'number'
  ) {
    const innerHtml = {
      __html: itemTranslations.labelPremiumDiscountSavings(premiumDiscountPercentage, price)
    };
    // eslint-disable-next-line react/no-danger
    return <div className='small text' dangerouslySetInnerHTML={innerHtml} />;
  }
  if (priceDisplayMode === 'NON_PREMIUM_USER_PREMIUM_ITEM' && typeof premiumPrice === 'number') {
    const innerHtml = {
      __html: itemTranslations.labelPremiumDiscountOpportunityPrompt(premiumPrice)
    };
    return (
      <div className='premium-prompt small text'>
        {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
        <a
          href={hrefs.upgradeToPremium(itemDetails.id, itemDetails.itemType)}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={innerHtml}
        />
      </div>
    );
  }
  if (
    ((priceDisplayMode === 'COLLECTIBLE_IN_EXPERIENCE_ONLY_ORIGINAL' &&
      isCollectible(itemDetails.itemRestrictions)) ||
      (consumableDisplayModes.includes(priceDisplayMode) && unitsAvailableForConsumption)) &&
    !isLimitedAndOffSale
  ) {
    return (
      <Fragment>
        <div className='font-caption-body'>
          {itemModelTranslations.labelLimitedQuantity(
            unitsAvailableForConsumption ?? 0,
            totalQuantity
          )}
        </div>
        {!!itemDetails.quantityLimitPerUser && (
          <div className='font-caption-body'>
            {itemModelTranslations.labelQuantityMaxPerUser(itemDetails.quantityLimitPerUser)}
          </div>
        )}
      </Fragment>
    );
  }
  if (priceDisplayMode === 'LIMITED_WITH_RESELLERS') {
    return (
      <Fragment>
        {typeof unitsAvailableForConsumption === 'number' && !isLimitedAndOffSale && (
          <div className='font-caption-body'>
            {itemModelTranslations.labelLimitedQuantity(
              unitsAvailableForConsumption,
              totalQuantity
            )}
          </div>
        )}
        <div
          className='font-caption-body'
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: catalogTranslations.actionSeeMoreReseller()
          }}
        />
      </Fragment>
    );
  }
  if (priceDisplayMode === 'COLLECTIBLE_ONLY_ORIGINAL') {
    return (
      <Fragment>
        {/* Off-sale limited items have no purchasable original stock, so suppress */}
        {/* the "X/Y remaining" original-stock count. */}
        {!isLimitedAndOffSale && (
          <div className='font-caption-body'>
            {itemModelTranslations.labelLimitedQuantity(
              unitsAvailableForConsumption || 0,
              totalQuantity
            )}
          </div>
        )}
        {!!itemDetails.quantityLimitPerUser && (
          <div className='font-caption-body'>
            {itemModelTranslations.labelQuantityMaxPerUser(itemDetails.quantityLimitPerUser)}
          </div>
        )}
      </Fragment>
    );
  }

  if (
    priceDisplayMode === 'COLLECTIBLE_ONLY_RESELLERS' ||
    priceDisplayMode === 'COLLECTIBLE_ONLY_RESELLERS_QUANTITY_LIMIT_REACHED'
  ) {
    return (
      <div
        className='font-caption-body'
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: catalogTranslations.actionSeeMoreReseller() }}
      />
    );
  }
  return null;
}
