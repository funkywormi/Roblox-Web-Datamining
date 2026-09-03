/* eslint-disable prettier/prettier */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from 'react';
import { Tooltip } from 'react-style-guide';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { numberFormat } from 'core-utilities';
import translationConfig from '../translation.config';
import { TResellableCopy } from '../containers/ItemDetailsLimitedInventoryContainer';
import itemDetailsLimitedInventoryConstants from '../constants/itemDetailsLimitedInventoryConstants'

type TPlaceOnSaleModalBodyProps = {
  collectibleItemData: TResellableCopy;
  isLimited2: boolean;
  onResalePriceChange: (number) => void;
  resalePriceFloor: number;
  collectibleResaleFeePercentage: number;
};

export const PlaceOnSaleModalBody = ({
  collectibleItemData,
  isLimited2,
  onResalePriceChange,
  resalePriceFloor,
  translate,
  collectibleResaleFeePercentage
}: TPlaceOnSaleModalBodyProps & WithTranslationsProps): JSX.Element | null => {
  const [listPrice, setListPrice] = useState<number | undefined>();
  const [marketplaceFee, setMarketplaceFee] = useState<number>(0);
  const [sellerNet, setSellerNet] = useState<number>(0);
  const subtractChar = '-';
  const colonChar = ':';
  // Set by max number size for C#
  const maxResalePrice = 9999999999;
  const getMarketplaceFee = () => {
    if (isLimited2) {
      return collectibleResaleFeePercentage / 100;
    }
    return itemDetailsLimitedInventoryConstants.marketplaceFeePercentage;
  }

  const calculateMarketplaceFee = (price: number) => {
    const baseFeeCalculation = price * getMarketplaceFee();
    if (baseFeeCalculation <= itemDetailsLimitedInventoryConstants.marketplaceFeeMinimum) {
      return itemDetailsLimitedInventoryConstants.marketplaceFeeMinimum;
    }
    // The backend does every even rounding, where numbers ending in .5 are rounded to the nearest even, which fairly distributes the .5 across both groups
    // BUT for some reason we do this calculation on the seller cut not the fee, so we actually need to round to the nearest odd here in order to actually
    // calculate this in relation to the sellers fee
    if (baseFeeCalculation % 1 === 0.5) {
      if ((Math.trunc(baseFeeCalculation)) % 2 !== 0) {
        return Math.trunc(baseFeeCalculation);
      }
    }
    return Math.round(baseFeeCalculation);
  };

  const onListPriceChange = (newPrice: string) => {
    let newPriceNumber = parseInt(newPrice, 10);
    if (newPriceNumber) {
      if(newPriceNumber > maxResalePrice) {
        newPriceNumber = maxResalePrice;
      }
      const sanitizeNewPrice = Math.abs(newPriceNumber);
      const newMarketplaceFee = calculateMarketplaceFee(sanitizeNewPrice);
      const newSellerNet = sanitizeNewPrice - newMarketplaceFee;

      setListPrice(sanitizeNewPrice);
      setMarketplaceFee(newMarketplaceFee);
      setSellerNet(newSellerNet);
      onResalePriceChange(sanitizeNewPrice);
    } else {
      setListPrice(undefined);
      setMarketplaceFee(0);
      setSellerNet(0);
      onResalePriceChange(0);
    }
  };

  useEffect(() => {
    onListPriceChange(`${resalePriceFloor}`);
  }, []);

  return (
    <div className='place-on-sale-modal-body'>
      <div className='modal-top-body'>
        <div className='modal-message'>
          {(collectibleItemData.serialNumber || collectibleItemData.averagePrice) && (
          <React.Fragment>
            <div className='item-info-container'>
              <div className='item-info-header font-header-2'>{translate('Heading.ItemInfo')}</div>
              {collectibleItemData.serialNumber && (<div className='item-info-header'>
                <span>{translate('Label.SerialNumberColon')}</span>
                <span className='on-sale-tag'>
                  <span className='icon-shop-limited' />
                  <span>{translate('Label.SerialNumberDisplay', {serialNumber: collectibleItemData.serialNumber})}</span>
                  </span>
              </div>)}
              {collectibleItemData.averagePrice && (<div className='item-info-header'>
                <span>{translate('Label.AveragePrice') + colonChar }</span>
                <span className='icon-robux-16x16' />
                <span className='text-robux '>{numberFormat.getNumberFormat(collectibleItemData.averagePrice)}</span>
              </div>)}
            </div>
            <br />
          </React.Fragment>
          )}
          <div id='sell-content-wrapper' className=''>
            <div className='text-label'>{translate('Heading.SetPrice')}</div>
            <div className='form-group price-form'> 
              <input
                className='form-control input-field sell-price'
                maxLength={10}
                type='number'
                placeholder={`${resalePriceFloor}`}
                value={listPrice}
                min={resalePriceFloor}
                onChange={e => {
                  onListPriceChange(e.target.value);
                }}
              />
            </div>
            {!listPrice && (
                <div className='font-caption-body text'>{translate('Label.MinimumAmountCustom', {minimumAmount: resalePriceFloor})}</div>
              )}
            {listPrice && listPrice < resalePriceFloor && (
                <div className='font-caption-body text'>{translate('Label.MinimumAmountCustom', {minimumAmount: resalePriceFloor})}</div>
              )}
            <br />
            <div className='text-label'>
              <Tooltip
                placement='right'
                id='resale-tooltip'
                content={
                  <div className='resale-tooltip-body'>
                    <div className='font-caption-header holding-tooltip-body-header'>
                      {translate('Label.ResaleFeePolicy')}
                    </div>
                    <div className='font-caption-body text holding-tooltip-body-text'>
                      {translate('Message.ResaleFeePolicy', {yourSharePercent: (1 - getMarketplaceFee())* 100, robloxFeePercent: getMarketplaceFee() * 100})}
                    </div>
                  </div>
                }
                containerClassName='holding-tooltip-container'>
                <span className='item-hold-tooltip'>
                  <span className='text-label'>{translate('Heading.Overview')}</span>
                  <span className='icon-actions-info-sm info-icon' />
                </span>
              </Tooltip>
            </div>
            <div className='text-overflow'>
              <span className='share-label'>
                {translate('Label.Fee', {feePercentage: getMarketplaceFee() * 100})}
              </span>
              <span className='text-robux '>{subtractChar}</span>
              <span className='icon-robux-16x16' />
              <span className='text-robux '>{numberFormat.getNumberFormat(marketplaceFee)}</span>
            </div>
            <div className='text-overflow'>
              <span className='share-label'>{translate('Label.SellCut')}</span>
              <span className='icon-robux-16x16' />
              <span className='text-robux'>{numberFormat.getNumberFormat(sellerNet)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withTranslations(PlaceOnSaleModalBody, translationConfig);
