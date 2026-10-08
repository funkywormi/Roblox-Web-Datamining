import { useState, useEffect, useCallback } from 'react';
import { isAuthenticated } from '@rbx/core-scripts/meta/user';
import itemDetailsService from '../services/itemDetailsService';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import itemDetailParsingUtils from '../util/itemDetailParsingUtils';
import hydrateCollectibleItemDetails from '../util/hydrateCollectibleItemDetails';
import ItemType from '../../enums/ItemType';
import type {
  CatalogItemDetails,
  EconomyMetadata,
  ParsedItemDetail
} from '../types/itemDetails';

type ItemKey = { itemType: string; id: number };
type CachedItemLookup = ItemKey & { inCache: true };

const { errorMessages, maxBatchLoadRetries } = itemPurchaseConstants;
const {
  parseItemDetails,
  parseItemPurchasableDetails,
  parseItemPurchasableNonAuthDetails
} = itemDetailParsingUtils;

function BatchLoadItemDetails(items: ItemKey[]) {
  const [economyMetadata, setEconomyMetadata] = useState<{ data: EconomyMetadata }>();
  const [itemDetails, setItemDetails] = useState<Partial<ParsedItemDetail>[]>([]);
  const [cachedItems, setCachedItems] = useState<
    Record<string, Record<string, ParsedItemDetail> | undefined>
  >({});
  let failureCount = 0;

  const setItemLoadFailure = () => {
    if (failureCount < maxBatchLoadRetries) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define -- mutually-recursive retry callback
      batchLoadItemDetails();
      failureCount += 1;
    } else {
      setItemDetails([
        {
          loading: false,
          loadFailure: true
        }
      ]);
    }
  };

  const loadEconomyMetadata = useCallback(() => {
    if (!isAuthenticated()) {
      const unauthedEconomyMetadata = {
        data: {
          isMarketPlaceEnabled: false,
          isItemsXchangeEnabled: false
        }
      };
      setEconomyMetadata(unauthedEconomyMetadata);
      return;
    }
    itemDetailsService
      .getEconomyMetadata()
      .then(metadata => {
        setEconomyMetadata(metadata);
      })
      .catch(() => {
        setItemLoadFailure();
      });
  }, []);

  async function parseResult(data: CatalogItemDetails | CachedItemLookup) {
    if ('inCache' in data) {
      return cachedItems[data.itemType.toLowerCase()]?.[data.id];
    }
    let item = parseItemDetails({}, data);
    if (data.productId !== undefined) {
      if (isAuthenticated()) {
        if (item.collectibleItemId === undefined) {
          const res = await itemDetailsService.getItemPurchasableDetail(data.productId);
          item = parseItemPurchasableDetails(item, res.data, economyMetadata);
        }
      } else {
        item = parseItemPurchasableNonAuthDetails(item);
      }
    }

    return item;
  }

  async function processItemDetails(data: (CatalogItemDetails | CachedItemLookup)[]) {
    try {
      const result = (await Promise.all(data.map(item => parseResult(item)))).filter(
        (item): item is ParsedItemDetail => item !== undefined
      );
      setItemDetails(result);

      const newAllFetchedItems = cachedItems;
      result.forEach(item => {
        if (!item.isLimited && !cachedItems[item.itemType.toLowerCase()]?.[item.id]) {
          // Limited data inherently needs to be "fresher" since resellers change frequently
          // So we will not save this data
          newAllFetchedItems[item.itemType.toLowerCase()]![item.id] = item;
        }
      });
      setCachedItems(newAllFetchedItems);
    } catch (e) {
      setItemLoadFailure();
    }
  }

  async function fetchItemDetails() {
    const nonCachedItems: ItemKey[] = [];
    items.forEach(item => {
      if (cachedItems[item.itemType.toLowerCase()]?.[item.id] === undefined) {
        nonCachedItems.push(item);
      }
    });
    let result: CatalogItemDetails[] = [];
    if (nonCachedItems.length > 0) {
      const itemsToHydrate: ItemKey[] = [];
      nonCachedItems.map(item =>
        itemsToHydrate.push({
          itemType: item.itemType,
          id: item.id
        })
      );
      // Replaces window.Roblox ItemDetailsHydrationService.getItemDetails.
      const response = await itemDetailsService.postItemDetails(itemsToHydrate);
      result = response.data.data;
      await hydrateCollectibleItemDetails(result, ids =>
        itemDetailsService.getCollectibleItemsDetails(ids)
      );
    }
    const itemDetailsResult: (CatalogItemDetails | CachedItemLookup)[] = [];
    items.forEach(item => {
      if (cachedItems[item.itemType.toLowerCase()]?.[item.id] === undefined) {
        const foundItem = result.find(i => {
          return i.id === item.id && i.itemType.toLowerCase() === item.itemType.toLowerCase();
        });
        if (foundItem) {
          itemDetailsResult.push(foundItem);
        }
      } else {
        itemDetailsResult.push({ id: item.id, itemType: item.itemType, inCache: true });
      }
    });
    return itemDetailsResult;
  }

  const batchLoadItemDetails = useCallback(() => {
    fetchItemDetails()
      .then((result) => {
        try {
          processItemDetails(result);
        } catch {
          setItemLoadFailure();
        }
      })
      .catch(() => {
        setItemLoadFailure();
      });
  }, [economyMetadata, items, parseResult]);

  useEffect(() => {
    const baseFetchedItemsObject: Record<string, Record<string, ParsedItemDetail>> = {};
    baseFetchedItemsObject[ItemType.Asset] = {};
    baseFetchedItemsObject[ItemType.Bundle] = {};
    setCachedItems(baseFetchedItemsObject);
    loadEconomyMetadata();
  }, []);

  useEffect(() => {
    if (economyMetadata !== undefined) {
      batchLoadItemDetails();
    }
  }, [economyMetadata, items]);

  return {
    itemDetails,
    batchLoadItemDetails
  };
}

export default BatchLoadItemDetails;
