import { ThumbnailTypes } from 'roblox-thumbnails';
import TransactionItemType from '../enums/TransactionItemType';
import TransactionItem from '../interfaces/TransactionItem';

// For developer products and VIP servers, we show the associated game's icon
const getThumbnailTypeForItem = (item: TransactionItem): ThumbnailTypes | null => {
  if (!item) return null;
  switch (item.type) {
    case TransactionItemType.Asset:
    case TransactionItemType.SubscriptionProduct:
      return ThumbnailTypes.assetThumbnail;
    case TransactionItemType.GamePass:
      return ThumbnailTypes.gamePassIcon;
    case TransactionItemType.Bundle:
      return ThumbnailTypes.bundleThumbnail;
    case TransactionItemType.DeveloperProduct:
      return ThumbnailTypes.developerProductIcon;
    case TransactionItemType.AffiliatePayout:
    case TransactionItemType.PrivateServer:
    case TransactionItemType.Place:
    case TransactionItemType.RobloxSelectTransfer:
    case TransactionItemType.CreatorRewardsPayout:
      return ThumbnailTypes.gameIcon;
    case TransactionItemType.RobloxProduct:
      return ThumbnailTypes.groupIcon;
    default:
      console.log(`Unable to identify transaction thumbnail type for item with id ${item.id}`);
      return ThumbnailTypes.assetThumbnail;
  }
};

const getThumbnailTargetIdForItem = (item: TransactionItem): number | null => {
  if (!item) return null;
  switch (item.type) {
    case TransactionItemType.Asset:
    case TransactionItemType.GamePass:
    case TransactionItemType.DeveloperProduct:
    case TransactionItemType.Bundle:
    case TransactionItemType.SubscriptionProduct:
      return item.id;
    case TransactionItemType.AffiliatePayout:
    case TransactionItemType.PrivateServer:
    case TransactionItemType.Place:
    case TransactionItemType.RobloxSelectTransfer:
    case TransactionItemType.CreatorRewardsPayout:
      return item?.place?.universeId;
    case TransactionItemType.RobloxProduct:
      // Show official Roblox group icon
      return 7;
    default:
      console.log(`Unable to identify transaction thumbnail target id for item with id ${item.id}`);
      return null;
  }
};

export default {
  getThumbnailTypeForItem,
  getThumbnailTargetIdForItem
};
