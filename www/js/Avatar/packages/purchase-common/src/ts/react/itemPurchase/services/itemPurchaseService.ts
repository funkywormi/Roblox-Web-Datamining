import * as httpService from '@rbx/core-scripts/http';
import urlConstants from '../constants/urlConstants';
import type {
  DeveloperProductPurchaseResponse,
  GamePassPurchaseResponse,
  SubscriptionWithRobuxPurchaseResponse,
  PrepareFiatSubscriptionPurchaseResponse,
  BulkPurchaseResponse,
  CollectibleItemPurchaseResponse,
  ItemPurchaseResponse
} from '../types/purchase';

const {
  getPurchaseItemUrl,
  getPurchaseCollectibleItemUrl,
  getPurchaseCollectibleItemInstanceUrl,
  postBulkPurchaseUrl,
  postPurchaseDeveloperProductUrl,
  postPurchaseGamePassUrl,
  postPurchaseSubscriptionWithRobuxUrl,
  postPrepareFiatSubscriptionPurchaseUrl
} = urlConstants;

export default {
  purchaseCollectibleItem: (collectibleItemId: string, params: object) => {
    const urlConfig = {
      url: getPurchaseCollectibleItemUrl(collectibleItemId),
      retryable: true,
      withCredentials: true
    };
    return httpService.post<CollectibleItemPurchaseResponse>(urlConfig, params);
  },
  purchaseCollectibleItemInstance: (collectibleItemId: string, params: object) => {
    const urlConfig = {
      url: getPurchaseCollectibleItemInstanceUrl(collectibleItemId),
      retryable: true,
      withCredentials: true
    };
    return httpService.post<CollectibleItemPurchaseResponse>(urlConfig, params);
  },
  purchaseDeveloperProduct: (productId: number, request: object) => {
    const urlConfig = {
      url: postPurchaseDeveloperProductUrl(productId),
      withCredentials: true
    };
    return httpService.post<DeveloperProductPurchaseResponse>(urlConfig, request);
  },
  purchaseGamePass: (productId: number, request: object) => {
    const urlConfig = {
      url: postPurchaseGamePassUrl(productId),
      retryable: true,
      withCredentials: true
    };
    return httpService.post<GamePassPurchaseResponse>(urlConfig, request);
  },
  purchaseItem: (productId: number, params: object) => {
    const urlConfig = {
      url: getPurchaseItemUrl(productId),
      retryable: true,
      withCredentials: true
    };
    return httpService.post<ItemPurchaseResponse>(urlConfig, params);
  },
  purchaseSubscriptionWithRobux: (subscriptionTargetKey: string, request: object) => {
    const urlConfig = {
      url: postPurchaseSubscriptionWithRobuxUrl(subscriptionTargetKey),
      withCredentials: true
    };
    return httpService.post<SubscriptionWithRobuxPurchaseResponse>(urlConfig, request);
  },
  prepareFiatSubscriptionPurchase: (subscriptionTargetKey: string, request: object) => {
    const urlConfig = {
      url: postPrepareFiatSubscriptionPurchaseUrl(subscriptionTargetKey),
      withCredentials: true
    };
    return httpService.post<PrepareFiatSubscriptionPurchaseResponse>(urlConfig, request);
  },
  bulkPurchaseItem: (
    userId: number,
    productSurface: string,
    fulfillmentGroups: object,
    idempotencyKey: string
  ) => {
    const urlConfig = {
      url: `${postBulkPurchaseUrl()}?idempotencyKey.key=${idempotencyKey}`,
      retryable: true,
      withCredentials: true
    };
    const params = {
      purchasingUser: `users/${userId}`,
      context: { productSurface },
      fulfillmentGroups: [fulfillmentGroups]
    };
    return httpService.post<BulkPurchaseResponse>(urlConfig, params);
  }
};
