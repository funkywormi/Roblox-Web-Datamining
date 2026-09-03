/* eslint-disable react/jsx-no-literals */
import React, { useMemo } from 'react';
import { TranslateFunction, withTranslations, WithTranslationsProps } from 'react-utilities';
import { TItemPricing, TPriceDisplayMode, TOwnedItemInstance } from '../constants/types';
import { itemModelTranslationConfig } from '../translation.config';
import { noResellerDisplayModes } from '../constants/pricingConstants';
import { catalogTranslations } from '../services/translationService';
import { ResaleRestriction } from '../constants/resaleRestrictionConstants';

type TItemFristLineProps = {
  itemOwned: boolean;
  itemPricingInfo: TItemPricing;
  reachedQuantityLimit: boolean | undefined;
  resaleRestriction: number;
  unitsAvailableForConsumption: number | undefined | null;
  experienceLinkEnabled: boolean;
  isCollectibleAndOffSale: boolean;
  hasResellers: boolean;
};

function generateFirstLineText(
  priceDisplayMode: TPriceDisplayMode,
  itemOwned: boolean,
  reachedQuantityLimit: boolean | undefined,
  itemPricingInfo: TItemPricing,
  resaleRestriction: number,
  unitsAvailableForConsumption: number | undefined | null,
  saleLocationType: string | undefined,
  translate: TranslateFunction,
  experienceLinkEnabled: boolean,
  isCollectibleAndOffSale: boolean,
  hasResellers: boolean
): string | null {
  if (priceDisplayMode === 'NOT_FOR_SALE') {
    return translate(itemOwned ? 'Label.ItemAvailableInventory' : 'Label.ItemNotCurrentlyForSale');
  }

  if (isCollectibleAndOffSale) {
    return itemOwned
      ? translate('Label.ItemAvailableInventory')
      : catalogTranslations.labelOriginalUnavailable();
  }

  if (saleLocationType === 'ExperiencesDevApiOnly' && !experienceLinkEnabled) {
    return itemOwned
      ? translate('Label.ItemAvailableInventory')
      : catalogTranslations.labelInExperienceOnly();
  }

  if (priceDisplayMode === 'PURCHASE_DISABLED') {
    return translate(
      itemOwned ? 'Label.ItemAvailableInventory' : 'Label.PurchasingTemporarilyUnavailable'
    );
  }

  if (priceDisplayMode === 'MODERATED') {
    return translate(itemOwned ? 'Label.ItemAvailableInventory' : 'Label.ItemHasBeenModerated');
  }
  if (priceDisplayMode === 'COLLECTIBLE_IN_EXPERIENCE_ONLY_ORIGINAL') {
    if (
      !reachedQuantityLimit &&
      !unitsAvailableForConsumption &&
      resaleRestriction === ResaleRestriction.DISABLED
    ) {
      if (
        saleLocationType === 'ExperiencesDevApiOnly' &&
        resaleRestriction === ResaleRestriction.DISABLED
      ) {
        return itemOwned
          ? translate('Label.ItemAvailableInventory')
          : catalogTranslations.labelInExperienceOnly();
      }
      return catalogTranslations.messageSoldOut();
    }
    if (reachedQuantityLimit) {
      return catalogTranslations.labelQuantityLimitReached();
    }
    if (!hasResellers && !unitsAvailableForConsumption) {
      return translate('Label.NoOneCurrentlySelling');
    }
    return null;
  }
  if (noResellerDisplayModes.includes(priceDisplayMode)) {
    if (
      !reachedQuantityLimit &&
      !unitsAvailableForConsumption &&
      resaleRestriction === ResaleRestriction.DISABLED
    ) {
      return catalogTranslations.messageSoldOut();
    }
    if (reachedQuantityLimit) {
      return catalogTranslations.labelQuantityLimitReached();
    }
    return translate('Label.NoOneCurrentlySelling');
  }

  if (priceDisplayMode === 'ITEM_ALREADY_OWNED') {
    return translate('Label.ItemAvailableInventory');
  }

  return null;
}

export const ItemFirstLine = (
  props: TItemFristLineProps & WithTranslationsProps
): JSX.Element | null => {
  const {
    itemOwned,
    itemPricingInfo,
    reachedQuantityLimit,
    resaleRestriction,
    translate,
    experienceLinkEnabled,
    isCollectibleAndOffSale,
    hasResellers
  } = props;
  const { priceDisplayMode, saleLocationType, unitsAvailableForConsumption } = itemPricingInfo;
  const text = useMemo(
    () =>
      generateFirstLineText(
        priceDisplayMode,
        itemOwned,
        reachedQuantityLimit,
        itemPricingInfo,
        resaleRestriction,
        unitsAvailableForConsumption,
        saleLocationType || '',
        translate,
        experienceLinkEnabled,
        isCollectibleAndOffSale,
        hasResellers
      ),
    [
      priceDisplayMode,
      itemOwned,
      reachedQuantityLimit,
      itemPricingInfo,
      resaleRestriction,
      unitsAvailableForConsumption,
      saleLocationType,
      translate,
      experienceLinkEnabled,
      isCollectibleAndOffSale,
      hasResellers
    ]
  );

  if (text) {
    return <div className='item-first-line'>{text}</div>;
  }
  return null;
};
export default withTranslations(ItemFirstLine, itemModelTranslationConfig);
