import { TItemDetailRequestEntry } from 'Roblox';

const itemListConstants = {
  itemTypeConstants: {
    asset: 'asset',
    bundle: 'bundle'
  },
  batchBuyPurchaseResults: {
    success: 'Success',
    alreadyOwned: 'AlreadyOwned',
    insufficientFunds: 'InsufficientFunds',
    exceptionOccured: 'ExceptionOccurred',
    tooManyPurchases: 'TooManyPurchases'
  },
  limited: 'Limited',
  numberOfItemsToRecommend: 5,
  totalNumberOfRecommendations: 140,
  itemListEventName: 'item-list:render',
  itemListElementName: 'item-list-container'
};

export type TItemListEventOptions = {
  items: Array<TItemDetailRequestEntry>;
  eventIdentifier: string;
  purchasable: boolean;
  selectable?: boolean;
  backgroundVisualContainer?: boolean;
  titleText: string;
  wrapItems: boolean;
  showCreatorName?: boolean;
  showPrice?: boolean;
  showItemType?: boolean;
  checkOwnership?: boolean;
  defaultPermanentTimedOption?: boolean;
};

export default itemListConstants;
