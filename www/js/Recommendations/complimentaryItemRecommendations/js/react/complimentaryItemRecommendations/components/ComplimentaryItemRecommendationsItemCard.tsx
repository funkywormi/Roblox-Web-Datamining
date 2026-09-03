/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { ItemCard, ItemCardUtils } from 'react-style-guide';
import { Thumbnail2d, ThumbnailTypes, DefaultThumbnailSize } from 'roblox-thumbnails';
import { TDetailEntry } from 'Roblox';
import translationConfig from '../translation.config';
import { TItemDisabledReason } from './ComplimentaryItemRecommendationsCarousel';
import { trackItemCardClick, TItemCardSource } from '../../analytics/axTrackingEvents';

type TComplimentaryItemRecommendationsItemCardProps = {
  item: TDetailEntry;
  selectedItems: Array<TDetailEntry> | undefined;
  disabledItemsRecord: Record<number, TItemDisabledReason>;
  onCheckClicked: (number) => void;
};

export const ComplimentaryItemRecommendationsItemCard = ({
  item,
  selectedItems,
  disabledItemsRecord,
  onCheckClicked,
  translate
}: TComplimentaryItemRecommendationsItemCardProps & WithTranslationsProps): JSX.Element | null => {
  const onChange = () => {
    onCheckClicked(item.id);
  };
  const availableToPurchase =
    disabledItemsRecord[item.id] === undefined ||
    (!disabledItemsRecord[item.id].isOwned && !disabledItemsRecord[item.id].noSellers);

  return (
    <React.Fragment>
      <div className='complimentary-item-recommendations-item-card'>
        {availableToPurchase && (
          <div className='checkbox purchase-checkbox-container'>
            <input
              className='input-checkbox'
              id={`checkbox-${item.id}`}
              type='checkbox'
              checked={selectedItems?.includes(item)}
              onChange={onChange}
              disabled={!availableToPurchase}
            />
            <label htmlFor={`checkbox-${item.id}`} />
          </div>
        )}
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
        <div
          style={{ display: 'contents' }}
          onClick={() =>
            trackItemCardClick(TItemCardSource.ComplimentaryItemRecommendations, {
              itemId: item.id,
              itemType: item.itemType
            })
          }>
          <ItemCard
            id={item.id}
            name={item.name}
            type={item.itemType}
            creatorName={item.creatorName}
            creatorType={item.creatorType}
            creatorTargetId={item.creatorTargetId}
            price={item.price}
            lowestPrice={item.lowestPrice}
            unitsAvailableForConsumption={item.unitsAvailableForConsumption}
            itemStatus={item.itemStatus}
            priceStatus={item.priceStatus}
            premiumPricing={item.premiumPricing?.premiumPriceInRobux}
            itemRestrictions={item.itemRestrictions}
            thumbnail2d={
              <div>
                <Thumbnail2d
                  type={
                    ItemCardUtils.checkIfBundle(item.itemType)
                      ? ThumbnailTypes.bundleThumbnail
                      : ThumbnailTypes.assetThumbnail
                  }
                  targetId={item.id}
                  size={DefaultThumbnailSize}
                />
              </div>
            }
          />
        </div>
        {disabledItemsRecord[item.id] && disabledItemsRecord[item.id].isOwned && (
          <div className='item-owned'>
            <span className='item-owned-icon' />
            <span className='item-owned-text'>{translate('Label.ItemOwned')}</span>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default withTranslations(ComplimentaryItemRecommendationsItemCard, translationConfig);
