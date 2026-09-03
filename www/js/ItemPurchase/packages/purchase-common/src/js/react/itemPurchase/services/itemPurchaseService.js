import * as httpService from '@rbx/core-scripts/http';
import urlConstants from '../constants/urlConstants';

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
  purchaseCollectibleItem: (collectibleItemId, params) => {
    const urlConfig = {
      url: getPurchaseCollectibleItemUrl(collectibleItemId),
      retryable: true,
      withCredentials: true
    };
    return httpService.post(urlConfig, params);
  },
  purchaseCollectibleItemInstance: (collectibleItemId, params) => {
    const urlConfig = {
      url: getPurchaseCollectibleItemInstanceUrl(collectibleItemId),
      retryable: true,
      withCredentials: true
    };
    return httpService.post(urlConfig, params);
  },
  purchaseDeveloperProduct: (productId, request) => {
    const urlConfig = {
      url: postPurchaseDeveloperProductUrl(productId),
      withCredentials: true
    };
    return httpService.post(urlConfig, request);
  },
  purchaseGamePass: (productId, request) => {
    const urlConfig = {
      url: postPurchaseGamePassUrl(productId),
      retryable: true,
      withCredentials: true
    };
    return httpService.post(urlConfig, request);
  },
  purchaseItem: (productId, params) => {
    const urlConfig = {
      url: getPurchaseItemUrl(productId),
      retryable: true,
      withCredentials: true
    };
    return httpService.post(urlConfig, params);
  },
  purchaseSubscriptionWithRobux: (subscriptionTargetKey, request) => {
    const urlConfig = {
      url: postPurchaseSubscriptionWithRobuxUrl(subscriptionTargetKey),
      withCredentials: true
    };
    return httpService.post(urlConfig, request);
  },
  prepareFiatSubscriptionPurchase: (subscriptionTargetKey, request) => {
    const urlConfig = {
      url: postPrepareFiatSubscriptionPurchaseUrl(subscriptionTargetKey),
      withCredentials: true
    };
    return httpService.post(urlConfig, request);
  },
  bulkPurchaseItem: (userId, productSurface, fulfillmentGroups, idempotencyKey) => {
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
    return httpService.post(urlConfig, params);
  }
};
