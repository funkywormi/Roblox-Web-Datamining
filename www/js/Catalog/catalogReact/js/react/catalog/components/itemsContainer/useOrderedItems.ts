import { useEffect, useState } from 'react';
import {
  ItemWithDetails,
  ItemWithAllDetails,
  AssetsCollection,
  Layout
} from '../../constants/types';

function orderList(inputDict: AssetsCollection, sortBy: string[]) {
  const ordered: ItemWithAllDetails[] = [];
  sortBy.forEach(key => {
    if (key in inputDict) {
      const value = inputDict[key];
      ordered.push(value as ItemWithAllDetails);
    }
  });
  return ordered;
}

const useOrderedItems = (
  layout: Layout,
  searchResultDict: AssetsCollection | null,
  searchResultList: string[] | null,
  isPaginationEnabled: boolean,
  numberOfItemsToDisplay: number
) => {
  const [orderedItems, setOrderedItems] = useState<ItemWithDetails[]>();
  const [orderedItemsLoaded, isOrderedItemsLoaded] = useState<boolean>();

  const isItemsLoaded = layout.isSearchItemsLoaded && orderedItemsLoaded;

  const showShimmer = !isItemsLoaded && !layout.searchItemsError;

  useEffect(() => {
    isOrderedItemsLoaded(false);
    setOrderedItems(undefined);

    if (searchResultList === null || !layout.isSearchItemsLoaded) {
      return;
    }

    let ordered: ItemWithAllDetails[] = [];

    if (searchResultList.length) {
      if (searchResultDict != null) {
        ordered = orderList(searchResultDict, searchResultList);
      } else {
        return;
      }
    }

    let limit = -1;
    if (!isPaginationEnabled) {
      limit = numberOfItemsToDisplay;
    }

    if (limit === -1) {
      setOrderedItems(ordered);
    } else {
      const limitedOrderedItems = ordered.slice(0, limit);
      setOrderedItems(limitedOrderedItems);
    }
    isOrderedItemsLoaded(true);
  }, [
    searchResultDict,
    searchResultList,
    numberOfItemsToDisplay,
    layout.isSearchItemsLoaded,
    isPaginationEnabled
  ]);

  return {
    orderedItems,
    showShimmer
  };
};

export default useOrderedItems;
