import {
  TCartAddItemAction,
  TCartRemoveItemAction,
  TCartRefreshAction,
  TUnsanitizedItemDetails
} from '../constants/types';
import { standardizeCartItem } from './cartUtils';

export const addItemAction = (
  item: TUnsanitizedItemDetails,
  displaySystemFeedback?: boolean
): TCartAddItemAction => ({
  type: 'ADD_ITEM',
  item: standardizeCartItem(item),
  displaySystemFeedback
});
export const removeItemAction = (
  item: {
    itemId: number;
    id?: number;
    item?: { id: number };
    itemType: string;
  },
  displaySystemFeedback?: boolean
): TCartRemoveItemAction => ({
  type: 'REMOVE_ITEM',
  item: { ...item, itemId: item.itemId ?? item.id ?? item?.item?.id },
  displaySystemFeedback
});
export const refreshCartAction = (): TCartRefreshAction => ({
  type: 'REFRESH_CART'
});
