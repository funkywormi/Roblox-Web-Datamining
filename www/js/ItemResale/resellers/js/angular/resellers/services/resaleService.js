import resellersModule from '../resellersModule.js';

function resaleService(resellersConstants, $q, $filter, httpService) {
  'ngInject';

  const setResalePrice = function (assetId, userAssetId, price) {
    const config = {
      url: $filter('formatString')(resellersConstants.urls.setResalePrice, { assetId, userAssetId })
    };

    return $q((resolve, reject) => {
      return httpService
        .httpPatch(config, { price })
        .then(resolve)
        .catch(
          httpService.getApiErrorCodeHandler(reject, resellersConstants.errorCodes.economyApi)
        );
    });
  };

  return {
    getAssetResaleData(assetId) {
      const config = {
        url: $filter('formatString')(resellersConstants.urls.getResaleData, { assetId })
      };

      return $q((resolve, reject) => {
        return httpService
          .httpGet(config, {})
          .then(resolve)
          .catch(
            httpService.getApiErrorCodeHandler(reject, resellersConstants.errorCodes.economyApi)
          );
      });
    },

    getResellers(assetId, pagingParameters) {
      const config = {
        url: $filter('formatString')(resellersConstants.urls.getResellers, { assetId })
      };

      const queryParameters = {
        cursor: pagingParameters.cursor,
        limit: pagingParameters.count
      };

      return $q((resolve, reject) => {
        return httpService
          .httpGet(config, queryParameters)
          .then(resolve)
          .catch(
            httpService.getApiErrorCodeHandler(reject, resellersConstants.errorCodes.economyApi)
          );
      });
    },

    takeOffSale(assetId, userAssetId) {
      return setResalePrice(assetId, userAssetId, null);
    },

    setResalePrice(assetId, userAssetId, price) {
      return setResalePrice(assetId, userAssetId, price);
    },

    getCanTradeWith(userId) {
      const config = {
        url: $filter('formatString')(resellersConstants.urls.getCanTradeWith, { userId })
      };

      return $q((resolve, reject) => {
        return httpService
          .httpGet(config, {})
          .then(resolve)
          .catch(
            httpService.getApiErrorCodeHandler(reject, resellersConstants.errorCodes.economyApi)
          );
      });
    },

    postItemDetails(item) {
      const params = {
        items: [{ itemType: 'Asset', id: item }]
      };
      const config = {
        url: $filter('formatString')(resellersConstants.urls.postItemDetails)
      };

      return $q((resolve, reject) => {
        return httpService
          .httpPost(config, params)
          .then(resolve)
          .catch(
            httpService.getApiErrorCodeHandler(reject, resellersConstants.errorCodes.economyApi)
          );
      });
    },
    postMarketplaceItemDetails(collectibleItemId) {
      const params = {
        itemIds: [collectibleItemId]
      };
      const config = {
        url: $filter('formatString')(resellersConstants.urls.postMarketplaceItemDetails)
      };
      return $q((resolve, reject) => {
        return httpService
          .httpPost(config, params)
          .then(resolve)
          .catch(
            httpService.getApiErrorCodeHandler(reject, resellersConstants.errorCodes.economyApi)
          );
      });
    },
    getResellersForLimited2Item(collectibleItemId, pagingParameters) {
      const config = {
        url: $filter('formatString')(resellersConstants.urls.getResellersForLimited2Item, {
          collectibleItemId
        })
      };
      const queryParameters = {
        cursor: pagingParameters.cursor,
        limit: pagingParameters.count
      };
      return $q((resolve, reject) => {
        return httpService
          .httpGet(config, queryParameters)
          .then(resolve)
          .catch(
            httpService.getApiErrorCodeHandler(reject, resellersConstants.errorCodes.economyApi)
          );
      });
    },
    patchRemoveLimited2ItemFromSale(collectibleItemId, resaleRecord, userId) {
      const params = {
        price: undefined,
        isOnSale: false,
        sellerId: userId,
        sellerType: 'User',
        collectibleProductId: resaleRecord.collectibleProductId
      };
      const config = {
        url: $filter('formatString')(resellersConstants.urls.placeLimited2ItemOnSale, {
          collectibleItemId,
          collectibleInstanceId: resaleRecord.collectibleItemInstanceId
        })
      };
      return $q((resolve, reject) => {
        return httpService
          .httpPatch(config, params)
          .then(resolve)
          .catch(
            httpService.getApiErrorCodeHandler(reject, resellersConstants.errorCodes.economyApi)
          );
      });
    },
    getLimited2AssetResaleData(collectibleItemId) {
      const config = {
        url: $filter('formatString')(resellersConstants.urls.getResaleDataForLimited2Item, {
          collectibleItemId
        })
      };
      return $q((resolve, reject) => {
        return httpService
          .httpGet(config, {})
          .then(resolve)
          .catch(
            httpService.getApiErrorCodeHandler(reject, resellersConstants.errorCodes.economyApi)
          );
      });
    }
  };
}

resellersModule.factory('resaleService', resaleService);
export default resaleService;
