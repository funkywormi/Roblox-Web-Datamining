import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { ItemCard, ItemCardUtils } from 'react-style-guide';
import { Thumbnail2d, ThumbnailTypes, DefaultThumbnailSize } from 'roblox-thumbnails';
import { TDetailEntry, AvatarAccoutrementService, TTimedOption } from 'Roblox';
import translationConfig from '../translation.config';
import { TItemDisabledReason } from './ItemListCarousel';
import { trackItemCardClick, TItemCardSource } from '../../analytics/axTrackingEvents';

type TDetailEntryWithTimedOptions = TDetailEntry & {
  timedOptions?: TTimedOption[];
};

type TSelectableItemCardProps = {
  item: TDetailEntry;
  itemKey: string;
  purchasable: boolean;
  useCheckbox: boolean;
  selectedItems: Array<TDetailEntry> | undefined;
  disabledItemsRecord: Record<string, TItemDisabledReason>;
  ownershipRecord: Record<string, boolean>;
  onCheckClicked: (number, string) => void;
  showCreatorName: boolean;
  showPrice: boolean;
  showItemType: boolean;
  defaultPermanentTimedOption?: boolean;
  itemCardSource?: TItemCardSource;
};

export const SelectableItemCard = ({
  item,
  itemKey,
  purchasable,
  useCheckbox,
  selectedItems,
  disabledItemsRecord,
  ownershipRecord,
  onCheckClicked,
  showCreatorName,
  showPrice,
  showItemType,
  defaultPermanentTimedOption,
  itemCardSource,
  translate
}: TSelectableItemCardProps & WithTranslationsProps): JSX.Element => {
  const onChange = () => {
    onCheckClicked(item.id, item.itemType);
  };
  // FAE-gated items (IsFAE in itemStatus) require Facial Age Estimation on
  // the item details page and can't be purchased / try-on'd through the bundle
  // contents flow, so we treat them like an offsale item with no resellers —
  // their card is unselectable.
  const isFaeItem = item.itemStatus?.includes('IsFAE') === true;
  const availableToPurchase =
    !isFaeItem &&
    (disabledItemsRecord[itemKey] === undefined ||
      (!disabledItemsRecord[itemKey].isOwned &&
        !disabledItemsRecord[itemKey].noSellers &&
        (!item.isOffSale || item.hasResellers)));

  // Process timed options: if defaultPermanentTimedOption is true, set permanent as selected
  const itemWithTimedOptions = item as TDetailEntryWithTimedOptions;
  let processedTimedOptions: TTimedOption[] | undefined;
  if (itemWithTimedOptions.timedOptions && itemWithTimedOptions.timedOptions.length > 0) {
    if (defaultPermanentTimedOption) {
      // Override: set permanent as selected, all others as not selected
      processedTimedOptions = itemWithTimedOptions.timedOptions.map(opt => ({
        ...opt,
        selected: opt.days === 0
      }));
    } else {
      // Pass through as-is from hydration service
      processedTimedOptions = itemWithTimedOptions.timedOptions;
    }
  }

  // Get the price from the selected timed option if one exists
  const selectedTimedOption = processedTimedOptions?.find(opt => opt.selected);
  const timedOptionPrice = selectedTimedOption?.price;

  const getItemCardDisabled = () => {
    if (availableToPurchase === true) {
      return false;
    }
    if (!purchasable && ownershipRecord[itemKey] === true) {
      return false;
    }
    return !availableToPurchase;
  };

  return (
    <React.Fragment>
      <div className='item-list-item-card'>
        {(availableToPurchase || !purchasable) && useCheckbox && (
          <div
            className='checkbox-target'
            onClick={onChange}
            role='button'
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onChange()}
            style={{ cursor: 'pointer' }}>
            <div className='checkbox purchase-checkbox-container'>
              <input
                className='input-checkbox'
                id={`checkbox-${item.id}`}
                type='checkbox'
                checked={selectedItems?.includes(item)}
                disabled={getItemCardDisabled()}
              />
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label htmlFor={`checkbox-${item.id}`} />
            </div>
          </div>
        )}
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
        <div
          style={{ display: 'contents' }}
          onClick={() =>
            trackItemCardClick(itemCardSource ?? TItemCardSource.ItemDetailsRecommendations, {
              itemId: item.id,
              itemType: item.itemType
            })
          }>
          <ItemCard
            id={item.id}
            name={item.name}
            type={item.itemType}
            creatorName={showCreatorName ? item.creatorName : undefined}
            creatorType={item.creatorType}
            creatorTargetId={item.creatorTargetId}
            price={
              timedOptionPrice ??
              (item.collectibleItemDetails !== undefined
                ? item.collectibleItemDetails.lowestPrice
                : item.price)
            }
            lowestPrice={
              timedOptionPrice ??
              (item.collectibleItemDetails !== undefined
                ? item.collectibleItemDetails.lowestPrice
                : item.lowestPrice)
            }
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
            timedOptions={processedTimedOptions}
          />
        </div>
        {showItemType && item.itemType.toLowerCase() === 'asset' && (
          <div className='xsmall font-caption-body text-label'>
            {translate(AvatarAccoutrementService.getAssetTypeById(item.assetType).catalogNameKey)}
          </div>
        )}

        {ownershipRecord[itemKey] && (
          <div className='item-owned'>
            <span className='item-owned-icon' />
            <span className='item-owned-text'>{translate('Label.ItemOwned')}</span>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default withTranslations(SelectableItemCard, translationConfig);
