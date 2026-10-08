import React from 'react';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import { SelfProvidedTranslate } from '../SelfProvidedTranslate';
import { itemNamespaces, useItemTranslate, type PurchaseTranslate } from '../useTranslate';

const { resources } = itemPurchaseConstants;

interface PriceLabelTextProps {
  translate?: PurchaseTranslate;
  isLimited: boolean;
  resellerAvailable: boolean;
}

function PriceLabelText({
  translate,
  isLimited,
  resellerAvailable
}: PriceLabelTextProps & { translate: PurchaseTranslate }) {
  const showPriceLabelText = isLimited && resellerAvailable;

  return (
    <div className='text-label field-label price-label'>
      <span>
        {showPriceLabelText ? translate(resources.bestPriceLabel) : translate(resources.priceLabel)}
      </span>
    </div>
  );
}

export default function PriceLabelTextWithTranslations({ translate, ...props }: PriceLabelTextProps) {
  return (
    <SelfProvidedTranslate
      translate={translate}
      namespaces={itemNamespaces}
      useTranslate={useItemTranslate}
      render={t => <PriceLabelText {...props} translate={t} />}
    />
  );
}
