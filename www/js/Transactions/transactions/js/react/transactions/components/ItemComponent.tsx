import classNames from 'classnames';
import React, { FunctionComponent, useMemo } from 'react';
import { Link } from 'react-style-guide';
import { Thumbnail2d, DefaultThumbnailSize } from 'roblox-thumbnails';
import { TranslateFunction } from 'react-utilities';
import {
  transactionsThumbnailService,
  urlService,
  TransactionOriginType,
  TransactionItemType,
  TransactionItem
} from '../../../../ts';
import LicensedTooltip from './LicensedTooltip';
import ItemDescription from './ItemDescription';

export interface ItemComponentProps {
  item?: TransactionItem | null;
  transactionType: TransactionOriginType;
  translate: TranslateFunction;
  created?: string;
}

// Set of transaction types that should have the 'item-sale-format' class
const SALE_FORMAT_TRANSACTION_TYPES = new Set([
  TransactionOriginType.Sale,
  TransactionOriginType.Purchase,
  TransactionOriginType.AffiliateSale,
  TransactionOriginType.AffiliatePayout,
  TransactionOriginType.Renewal,
  TransactionOriginType.PrivateServerEngagementPayout
]);

const useThumbnailData = (item: TransactionItem | null | undefined) => {
  return useMemo(
    () => ({
      thumbnailTargetId: transactionsThumbnailService.getThumbnailTargetIdForItem(item),
      thumbnailType: transactionsThumbnailService.getThumbnailTypeForItem(item)
    }),
    [item]
  );
};

const ItemComponent: FunctionComponent<ItemComponentProps> = ({
  item,
  transactionType,
  translate,
  created
}) => {
  const { thumbnailTargetId, thumbnailType } = useThumbnailData(item);

  const formattedPlaceUrl = urlService.getPlaceUrl(item);
  const showPlaceName = item?.type !== TransactionItemType.Place && !!item?.place;

  return (
    <div
      className={classNames('item-format', {
        'item-sale-format': SALE_FORMAT_TRANSACTION_TYPES.has(transactionType)
      })}>
      {thumbnailType && thumbnailTargetId && (
        <span className='item-card-image'>
          <Thumbnail2d
            type={thumbnailType}
            targetId={thumbnailTargetId}
            size={DefaultThumbnailSize}
          />
        </span>
      )}
      <div className='item-description'>
        <div>
          <ItemDescription
            item={item}
            transactionType={transactionType}
            translate={translate}
            created={created}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          {showPlaceName &&
            (formattedPlaceUrl ? (
              <Link url={formattedPlaceUrl} className='item-card-label text-link text-overflow'>
                {item.place.name}
              </Link>
            ) : (
              <div className='item-card-label'>{item.place.name}</div>
            ))}
          <LicensedTooltip includeSeparator={showPlaceName} item={item} translate={translate} />
        </div>
        {item && item.payoutDescription && (
          <div className='item-card-label text-overflow'>{item.payoutDescription}</div>
        )}
      </div>
    </div>
  );
};

export default ItemComponent;
