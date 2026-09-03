import React from 'react';
import { TranslateFunction } from '@rbx/core-scripts/react';
import { Icon } from '@rbx/foundation-ui';

import AssetName from '../../../js/react/itemPurchase/components/AssetName';
import PriceLabel from '../../../js/react/itemPurchase/components/PriceLabel';
import itemPurchaseConstants from '../../../js/react/itemPurchase/constants/itemPurchaseConstants';
import type { DiscountInformation } from './discountInformation';

const { resources } = itemPurchaseConstants;

export type UnifiedProductDetailsProps = {
  translate: TranslateFunction;
  thumbnail: React.ReactNode;
  assetName: string;
  expectedPrice: number;
  displayPrice?: string;
  priceSuffix?: string;
  thumbnailSizePx?: number;
  rentalOptionDays?: number | null;
  discountInformation?: DiscountInformation | null;
};

const UnifiedProductDetails: React.FC<UnifiedProductDetailsProps> = ({
  translate,
  thumbnail,
  assetName,
  expectedPrice,
  displayPrice,
  priceSuffix,
  thumbnailSizePx = 150,
  rentalOptionDays = null,
  discountInformation
}) => {
  const thumbnailContainerStyle: React.CSSProperties = {
    maxWidth: '40vw',
    maxHeight: '40vw'
  };

  const hasDiscount =
    discountInformation?.originalPrice != null && discountInformation.originalPrice > expectedPrice;

  const renderPrice = () => {
    if (hasDiscount) {
      return (
        <div className='flex flex-row items-center flex-wrap gap-x-small'>
          <span className='flex flex-row items-center'>
            <PriceLabel translate={translate} price={expectedPrice} color='' useFreeText={false} />
            {priceSuffix && <span className='text-robux'>{priceSuffix}</span>}
          </span>
          <span
            className='flex flex-row items-center'
            style={{ textDecoration: 'line-through', opacity: 0.6 }}>
            <PriceLabel
              translate={translate}
              price={discountInformation.originalPrice}
              color=''
              useFreeText={false}
            />
            {priceSuffix && <span className='text-robux'>{priceSuffix}</span>}
          </span>
        </div>
      );
    }

    if (displayPrice) {
      return (
        <div className='flex flex-row items-center'>
          <span className='text-robux'>
            {displayPrice}
            {priceSuffix}
          </span>
        </div>
      );
    }

    return (
      <div className='flex flex-row items-center'>
        <PriceLabel translate={translate} price={expectedPrice} color='' useFreeText={false} />
        {priceSuffix && <span className='text-robux'>{priceSuffix}</span>}
      </div>
    );
  };

  return (
    <div className='flex flex-row items-center gap-large'>
      <div
        className='relative shrink-0 unified-modal-thumbnail-container'
        style={thumbnailContainerStyle}>
        <div
          className='rounded'
          style={{ width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.06)' }}
        />
        <div
          className='absolute unified-modal-thumbnail'
          style={{
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          {thumbnail}
        </div>
      </div>

      <div className='min-w-0 flex flex-col gap-small'>
        <span className='text-body-large break-words'>
          <AssetName name={assetName} />
        </span>
        {rentalOptionDays != null && rentalOptionDays > 0 && (
          <div className='flex flex-row items-center gap-small'>
            <Icon name='icon-regular-clock' />
            <span>
              {translate(resources.timedOptionDaysTimerStartsWhenYouBuy, {
                days: rentalOptionDays
              }) || `${rentalOptionDays} days (Timer starts when you buy)`}
            </span>
          </div>
        )}
        {renderPrice()}
      </div>
    </div>
  );
};

export default UnifiedProductDetails;
