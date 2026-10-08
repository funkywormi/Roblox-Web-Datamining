import * as httpService from '@rbx/core-scripts/http';
import urlConstants from '../constants/urlConstants';
import type {
  CatalogItemDetails,
  CollectibleItemDetails,
  EconomyMetadata,
  ItemDetailsBatchResponse,
  PurchasableDetail
} from '../types/itemDetails';
import type { UserCurrencyResponse } from '../types/purchase';

const {
  getItemDetailsUrl,
  postItemDetailsUrl,
  getPurchaseableDetailUrl,
  getMetaDataUrl,
  getCollectibleItemDetailsUrl,
  getCurrentUserBalance,
  getSubscriptionsMetadataUrl
} = urlConstants;

export default {
  getItemDetails: (itemId: number, itemType: string) => {
    const urlConfig = {
      url: getItemDetailsUrl(itemId, itemType),
      retryable: true,
      withCredentials: true
    };
    return httpService.get<CatalogItemDetails>(urlConfig);
  },
  postItemDetails: (items: { itemType: string; id: number }[]) => {
    const urlConfig = {
      url: postItemDetailsUrl(),
      retryable: true,
      withCredentials: true
    };
    const params = {
      items
    };
    return httpService.post<ItemDetailsBatchResponse>(urlConfig, params);
  },
  getItemPurchasableDetail: (productId: number) => {
    const urlConfig = {
      url: getPurchaseableDetailUrl(productId),
      retryable: true,
      withCredentials: true
    };
    return httpService.get<PurchasableDetail>(urlConfig);
  },
  getEconomyMetadata: () => {
    const urlConfig = {
      url: getMetaDataUrl(),
      retryable: true,
      withCredentials: true
    };
    return httpService.get<EconomyMetadata>(urlConfig);
  },
  async getCollectibleItemDetails(collectibleItemId: string) {
    const urlConfig = {
      url: getCollectibleItemDetailsUrl(),
      retryable: true,
      withCredentials: true
    };
    const requestBody = {
      itemIds: [collectibleItemId]
    };
    const result = await httpService.post<CollectibleItemDetails[]>(urlConfig, requestBody);
    return result.data?.[0] || null;
  },
  async getCollectibleItemsDetails(collectibleItemIds: string[]) {
    const urlConfig = {
      url: getCollectibleItemDetailsUrl(),
      retryable: true,
      withCredentials: true
    };
    const requestBody = {
      itemIds: collectibleItemIds
    };
    const result = await httpService.post<CollectibleItemDetails[]>(urlConfig, requestBody);
    return result.data ?? [];
  },
  getCurrentUserBalance: (userId: number) => {
    const urlConfig = {
      url: getCurrentUserBalance(userId),
      retryable: true,
      withCredentials: true
    };
    return httpService.get<UserCurrencyResponse>(urlConfig);
  },
  getSubscriptionsMetadata: () => {
    const urlConfig = {
      url: getSubscriptionsMetadataUrl(),
      retryable: true,
      withCredentials: true
    };
    return httpService.get(urlConfig);
  }
};
