import React from 'react';
import { Icon } from '@rbx/foundation-ui';
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
    return <span>{translate(resources.freeLabel)}</span>;
  }
  return (
    // Plain inline (not flex) so the number stays on the surrounding text's baseline.
    <span className='text-no-wrap'>
      <Icon
        name='icon-regular-robux'
        size='Small'
        className={`text-align-y-center margin-right-[2px]${color === 'gray' ? ' content-muted' : ''}`}
      />
      <span>{formatNumber(price)}</span>
    </span>
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
