/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import { numberFormat } from 'core-utilities';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import translationConfig from '../translation.config';
import ResaleButton from './ResaleButton';
import { TResellableCopy, ItemStatus } from '../containers/ItemDetailsLimitedInventoryContainer';

type TItemDetailsLimitedInventoryRowProps = {
  collectibleItemData: TResellableCopy;
  resaleRestriction: number;
  itemName: string | undefined;
  isLimited2: boolean;
  isFirstItem: boolean;
  onButtonAction: (number, ItemStatus) => void;
};

export const ItemDetailsLimitedInventoryRow = ({
  collectibleItemData,
  resaleRestriction,
  itemName,
  isLimited2,
  isFirstItem,
  onButtonAction,
  translate
}: TItemDetailsLimitedInventoryRowProps & WithTranslationsProps): JSX.Element | null => {
  const onResaleButtonClicked = (
    selectedCollectibleItemData: TResellableCopy,
    itemStatus: ItemStatus
  ) => {
    onButtonAction(selectedCollectibleItemData, itemStatus);
  };
  const displayName = collectibleItemData.serialNumber
    ? `#${collectibleItemData.serialNumber}`
    : itemName;
  return (
    <div className='item-details-limited-inventory-row'>
      <span className='item-info'>
        <span className='collectible-serial-number font-header-2'>{displayName}</span>

        <span className='buy-price font-caption-body text'>
          {collectibleItemData.buyPrice !== undefined && (
            <span>
              {translate('Label.BuyPrice')}
              <span className='icon-robux-16x16' />
              <span className='text-robux'>
                {numberFormat.getNumberFormat(collectibleItemData.buyPrice)}
              </span>
            </span>
          )}
          {collectibleItemData.buyPrice !== undefined && collectibleItemData.price !== undefined && (
            <span className='on-sale-tag-divider-container'>
              <div className='on-sale-tag-divider' />
            </span>
          )}
          {collectibleItemData.price !== undefined && (
            <React.Fragment>
              <span className='on-sale-tag'>{translate('Label.OnSale')}</span>
              <span className='on-sale-tag-divider-container'>
                <div className='on-sale-tag-divider' />
              </span>
              <span>
                {translate('Label.SalePrice')}
                <span className='icon-robux-16x16' />
                <span className='text-robux'>
                  {numberFormat.getNumberFormat(collectibleItemData.price)}
                </span>
              </span>
            </React.Fragment>
          )}
        </span>
      </span>
      <span className='sale-status'>
        <ResaleButton
          collectibleItemData={collectibleItemData}
          isLimited2={isLimited2}
          onResaleButtonClicked={onResaleButtonClicked}
          resaleRestriction={resaleRestriction}
        />
      </span>
      {!isFirstItem && <div className='dividing-line' />}
    </div>
  );
};

export default withTranslations(ItemDetailsLimitedInventoryRow, translationConfig);
