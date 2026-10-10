import React from 'react';
import { formatNumber } from '@rbx/core-scripts/format/number';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import { SelfProvidedTranslate } from '../SelfProvidedTranslate';
import { purchasingNamespaces, usePurchasingTranslate, type PurchaseTranslate } from '../useTranslate';

const { resources } = itemPurchaseConstants;

interface PriceLabelProps {
  translate?: PurchaseTranslate;
  price: number;
  color?: string;
  useFreeText?: boolean;
}

function PriceLabel({
  translate,
  price,
  color = '',
  useFreeText = true
}: PriceLabelProps & { translate: PurchaseTranslate }) {
  if (price === 0 && useFreeText) {
    return <span className='text-robux text-free'>{translate(resources.freeLabel)}</span>;
  }
  return (
    <React.Fragment>
      <span className={`icon-robux${color ? `-${color}` : ''}-16x16`} />
      <span className='text-robux'>{formatNumber(price)}</span>
    </React.Fragment>
  );
}

export default function PriceLabelWithTranslations({ translate, ...props }: PriceLabelProps) {
  return (
    <SelfProvidedTranslate
      translate={translate}
      namespaces={purchasingNamespaces}
      useTranslate={usePurchasingTranslate}
      render={t => <PriceLabel {...props} translate={t} />}
    />
  );
}
