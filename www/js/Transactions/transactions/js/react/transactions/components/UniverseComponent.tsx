import classNames from 'classnames';
import React, { FunctionComponent } from 'react';
import { Link } from 'react-style-guide';
import { Thumbnail2d, ThumbnailTypes, DefaultThumbnailSize } from 'roblox-thumbnails';
import { LicensedPaymentTransactionOriginType, urlService, TransactionItem } from '../../../../ts';
import ItemDescription from './ItemDescription';

interface UniverseComponentProps {
  item: TransactionItem;
  licensingPaymentTransactionOriginType?: LicensedPaymentTransactionOriginType;
  translate: (key: string) => string;
}

const UniverseComponent: FunctionComponent<UniverseComponentProps> = ({
  item,
  licensingPaymentTransactionOriginType,
  translate
}) => {
  const placeUrl = urlService.getPlaceUrl(item);

  if (!item?.place) {
    return null;
  }

  return (
    <div className='place-card'>
      <div className={classNames('place-icon', 'place-icon-sm')}>
        <Thumbnail2d
          containerClass='place-card-image'
          type={ThumbnailTypes.gameIcon}
          targetId={item.place.universeId}
          size={DefaultThumbnailSize}
        />
      </div>
      <div className='place-card-caption'>
        <ItemDescription
          item={item}
          transactionType={licensingPaymentTransactionOriginType}
          translate={translate}
        />
        <Link url={placeUrl} className='place-card-name text-name text-overflow'>
          {item.place.name}
        </Link>
      </div>
    </div>
  );
};

export default UniverseComponent;
