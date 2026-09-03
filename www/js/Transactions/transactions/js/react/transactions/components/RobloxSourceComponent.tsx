import classNames from 'classnames';
import React, { FunctionComponent } from 'react';
import { TranslateFunction } from 'react-utilities';
import { TransactionItem, TransactionOriginType } from '../../../../ts';
import ItemDescription from './ItemDescription';

interface RobloxSourceComponentProps {
  item?: TransactionItem | null;
  transactionOriginType?: TransactionOriginType;
  translate: TranslateFunction;
}

const RobloxSourceComponent: FunctionComponent<RobloxSourceComponentProps> = ({
  item,
  transactionOriginType,
  translate
}) => {
  const robloxString = 'Roblox';

  return (
    <div className='place-card'>
      <div className={classNames('place-icon', 'place-icon-xs')}>
        <span className={classNames('thumbnail-2d-container', 'place-card-image', 'icon-logo-r')} />
      </div>
      <div className='place-card-caption'>
        <ItemDescription
          item={item}
          transactionType={transactionOriginType}
          translate={translate}
        />
        <span className='place-card-name text-name text-overflow'>{robloxString}</span>
      </div>
    </div>
  );
};

export default RobloxSourceComponent;
