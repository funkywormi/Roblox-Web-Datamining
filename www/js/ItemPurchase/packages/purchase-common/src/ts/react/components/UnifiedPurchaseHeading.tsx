import React from 'react';
import { type PurchaseTranslate } from '../itemPurchase/useTranslate';

import UnifiedPriceLabel from './UnifiedPriceLabel';

export type UnifiedPurchaseHeadingProps = {
  translate: PurchaseTranslate;
  titleText: string;
  currentRobuxBalance?: number;
};

const UnifiedPurchaseHeading: React.FC<UnifiedPurchaseHeadingProps> = ({
  translate,
  titleText,
  currentRobuxBalance
}) => {
  return (
    <div
      id='rbx-unified-purchase-heading'
      className='flex flex-row items-center justify-between'
      style={{ paddingRight: 42 }}>
      <span className='text-heading-medium'>{titleText}</span>
      {typeof currentRobuxBalance === 'number' && (
        <div className='flex flex-row items-center'>
          <UnifiedPriceLabel
            translate={translate}
            price={currentRobuxBalance}
            color=''
            useFreeText={false}
          />
        </div>
      )}
    </div>
  );
};

export default UnifiedPurchaseHeading;
