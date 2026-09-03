import classNames from 'classnames';
import { TranslateFunction } from 'react-utilities';
import React, { useState, useEffect, FunctionComponent } from 'react';
import { Thumbnail2d, DefaultThumbnailSize, ThumbnailTypes } from 'roblox-thumbnails';
import { TransactionItem } from '../../../../ts';
import LicensedTooltip from './LicensedTooltip';
import ItemName from './ItemName';

interface SubscriptionComponentProps {
  item: TransactionItem;
  translate: TranslateFunction;
}

const SubscriptionComponent: FunctionComponent<SubscriptionComponentProps> = ({
  item,
  translate
}) => {
  const thumbnailTargetId = item.iconImageAssetId;
  const [name, setName] = useState(item.name);

  useEffect(() => {
    // '-' is a reserved character only prefixed to a subscription name
    // when it is deleted (and only added through our system).
    if (item.name.includes('-')) {
      const [, subName] = item.name.split('-');
      setName(subName);
    }
  }, [item.name]);

  return (
    <div className={classNames('item-format')}>
      {thumbnailTargetId && (
        <Thumbnail2d
          containerClass='subscription-card-image'
          type={ThumbnailTypes.assetThumbnail}
          targetId={thumbnailTargetId}
          size={DefaultThumbnailSize}
        />
      )}
      <div className='item-description'>
        <ItemName item={{ ...item, name }} />
        <div>
          <LicensedTooltip includeSeparator={false} item={item} translate={translate} />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionComponent;
