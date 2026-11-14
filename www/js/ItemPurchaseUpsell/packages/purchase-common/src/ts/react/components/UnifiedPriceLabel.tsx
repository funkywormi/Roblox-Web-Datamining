import React from 'react';
import { formatNumber } from '@rbx/core-scripts/format/number';
import itemPurchaseConstants from '../itemPurchase/constants/itemPurchaseConstants';
import { type PurchaseTranslate } from '../itemPurchase/useTranslate';

const { resources } = itemPurchaseConstants;

export type UnifiedPriceLabelProps = {
  translate: PurchaseTranslate;
  price: number;
  color?: string;
  useFreeText?: boolean;
};

// Prop-driven: the only caller (UnifiedPurchaseHeading) always supplies `translate` from its own
// dual-path provider, so this leaf needs no self-wrap.
function UnifiedPriceLabel({
  translate,
  price,
  color = '',
  useFreeText = true
}: UnifiedPriceLabelProps) {
  if (price === 0 && useFreeText) {
    return <span className='text-robux text-free'>{translate(resources.freeLabel)}</span>;
  }
  return (
    <React.Fragment>
      <span className={`icon-robux${color ? `-${color}` : ''}-16x16`} />
      <span className='text-robux text-body-medium' style={{ marginLeft: '0.25rem' }}>
        {formatNumber(price)}
      </span>
    </React.Fragment>
  );
}

export default UnifiedPriceLabel;
