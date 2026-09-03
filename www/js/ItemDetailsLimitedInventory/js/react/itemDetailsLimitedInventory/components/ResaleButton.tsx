/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { ItemCard, ItemCardUtils } from 'react-style-guide';
import { Thumbnail2d, ThumbnailTypes, DefaultThumbnailSize } from 'roblox-thumbnails';
import { authenticatedUser } from 'header-scripts';
import { TDetailEntry } from '../services/itemDetailsLimitedInventoryService';
import translationConfig from '../translation.config';
import { TResellableCopy, ItemStatus } from '../containers/ItemDetailsLimitedInventoryContainer';
import ResaleRestriction from '../constants/resaleRestrictionConstants';

type TResaleButtonProps = {
  collectibleItemData: TResellableCopy;
  isLimited2: boolean;
  resaleRestriction: number;
  onResaleButtonClicked: (number, ItemStatus) => void;
};

export const ResaleButton = ({
  collectibleItemData,
  resaleRestriction,
  isLimited2,
  onResaleButtonClicked,
  translate
}: TResaleButtonProps & WithTranslationsProps): JSX.Element | null => {
  const getButtonStatus = () => {
    if (collectibleItemData.isInHolding) {
      return ItemStatus.holding;
    }
    if (collectibleItemData.price) {
      return ItemStatus.onSale;
    }
    return ItemStatus.offSale;
  };
  const onClick = () => {
    onResaleButtonClicked(collectibleItemData, getButtonStatus());
  };

  const buttonStatus = getButtonStatus() as ItemStatus;

  const getButtonTextForStatus = () => {
    switch (buttonStatus) {
      case ItemStatus.onSale:
        return translate('Heading.TakeOffSale');
      case ItemStatus.offSale:
        return translate('Action.Sell');
      case ItemStatus.holding:
        return translate('Label.Holding');
      default:
        return translate('Action.Sell');
    }
  };

  const getButtonIdForStatus = () => {
    switch (buttonStatus) {
      case ItemStatus.onSale:
        return 'take-off-sale';
      case ItemStatus.offSale:
        return 'sell';
      case ItemStatus.holding:
        return 'holding';
      default:
        return 'sell';
    }
  };

  return (
    <div className='resale-button' id={getButtonIdForStatus()}>
      {resaleRestriction !== ResaleRestriction.DISABLED && (
        <button
          type='button'
          className='btn-min-width btn-buy-md'
          onClick={e => {
            e.currentTarget.blur();
            onClick();
          }}
          disabled={!authenticatedUser.isPremiumUser || buttonStatus === ItemStatus.holding}>
          {getButtonTextForStatus()}
        </button>
      )}
    </div>
  );
};

export default withTranslations(ResaleButton, translationConfig);
