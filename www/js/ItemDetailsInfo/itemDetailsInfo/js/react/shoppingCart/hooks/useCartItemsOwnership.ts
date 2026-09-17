import { useEffect, useRef, useState } from 'react';
import { CurrentUser } from 'Roblox';
import { fetchItemOwnership } from '../services/cartService';
import { getCartItemKey, isLimitedItemDetail } from '../utils/cartUtils';
import { TCartItem, TItemDetails } from '../constants/types';

/**
 * Checks whether the current user already owns each item in the cart. The cart
 * modal mounts when the cart is opened, so the check runs once per cart open.
 *
 * Limited items are skipped because they can be owned in multiples: owning one
 * copy doesn't stop the user from buying another.
 *
 * The returned record is keyed the same way as the cart's selected items.
 */
export default function useCartItemsOwnership(
  items: TCartItem[],
  itemDetails: Record<string, TItemDetails>
): Record<string, boolean> {
  const [ownershipRecord, setOwnershipRecord] = useState<Record<string, boolean>>({});
  // Item details hydrate asynchronously after the cart opens, so this effect
  // runs several times; track what has already been requested so each item is
  // only checked once.
  const requestedKeys = useRef<Set<string>>(new Set());
  // Opening the cart refreshes it, which replaces the items and details while
  // the first ownership requests are still in flight. Those replacements must
  // not discard the responses: an item is only ever requested once, so a
  // dropped response is never asked for again. Only unmounting -- closing the
  // cart -- makes a response irrelevant.
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!CurrentUser.isAuthenticated) {
      return;
    }

    const itemsToCheck = items.filter(item => {
      if (requestedKeys.current.has(getCartItemKey(item))) {
        return false;
      }
      // Whether an item is limited is only known from its details, so wait for
      // them rather than checking ownership for an item that is then skipped.
      const details = itemDetails[item.itemId];
      return !!details && !isLimitedItemDetail(details);
    });
    if (itemsToCheck.length === 0) {
      return;
    }
    itemsToCheck.forEach(item => requestedKeys.current.add(getCartItemKey(item)));

    Promise.all(
      itemsToCheck.map(async item => ({
        key: getCartItemKey(item),
        owned: await fetchItemOwnership(item).catch(() => false)
      }))
    )
      .then(results => {
        if (!isMountedRef.current) {
          return;
        }
        setOwnershipRecord(currentRecord => {
          const updatedRecord = { ...currentRecord };
          results.forEach(({ key, owned }) => {
            updatedRecord[key] = owned;
          });
          return updatedRecord;
        });
      })
      .catch(() => {
        console.error('could not check cart item ownership');
      });
  }, [items, itemDetails]);

  return ownershipRecord;
}
