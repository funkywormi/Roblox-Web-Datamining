import React, { Fragment, FunctionComponent } from 'react';
import { Link } from 'react-style-guide';
import { TransactionItem, TransactionItemType, urlService } from '../../../../ts';

interface ItemNameProps {
  item?: TransactionItem | null;
}

const TRANSACTION_ITEM_TYPES_WITHOUT_ITEM_URL = new Set([
  TransactionItemType.PrivateServer,
  TransactionItemType.DeveloperProduct
]);

const ItemName: FunctionComponent<ItemNameProps> = ({ item }) => {
  if (!item) {
    return null;
  }

  const formattedItemUrl = TRANSACTION_ITEM_TYPES_WITHOUT_ITEM_URL.has(item.type)
    ? null
    : urlService.getItemUrl(item);

  // For creator rewards payouts, the field campaignName is used instead and name is omitted
  const itemName = item.name || item.campaignName;

  return (
    <Fragment>
      {item.status && <span className='text-overflow'>{item.status}</span>}
      {itemName &&
        (formattedItemUrl ? (
          <Link url={formattedItemUrl} className='text-link text-overflow'>
            {itemName}
          </Link>
        ) : (
          <span className='text-overflow'>{itemName}</span>
        ))}
    </Fragment>
  );
};

export default ItemName;
