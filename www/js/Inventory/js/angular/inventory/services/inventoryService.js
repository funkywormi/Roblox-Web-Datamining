import angular from 'angular';
import inventoryModule from '../inventoryModule';

function inventoryService($q, $filter, inventoryConstants, assetsConstants, assetsService, httpService) {
  'ngInject';

  return {
    getUser(userId) {
      const urlConfig = {
        url: $filter('formatString')(inventoryConstants.urls.getUser, {
          userId
        })
      };
      return httpService.httpGet(urlConfig);
    },

    getPrivateServers(pagingParameters) {
      return $q(function (resolve, reject) {
        const urlConfig = {
          url: inventoryConstants.urls.getPrivateServers
        };

        httpService
          .httpGet(urlConfig, {
            privateServersTab: pagingParameters.placeTab,
            itemsPerPage: pagingParameters.count,
            cursor: pagingParameters.cursor
          })
          .then(function (response) {
            const items = response.data;
            angular.forEach(items, assetsService.translatePrivateServer);

            const isOtherServersTab =
              pagingParameters.placeTab === assetsConstants.types.otherPrivateServers;
            if (isOtherServersTab) {
              angular.forEach(items, function (item) {
                item.hidePrice = true;
              });
            }

            resolve({
              nextPageCursor: response.nextPageCursor,
              items
            });
          })
          .catch(function (response) {
            reject(response.Data || response.error || '');
          });
      });
    },

    getPlaces(pagingParameters) {
      return $q(function (resolve, reject) {
        const urlConfig = {
          url: $filter('formatString')(inventoryConstants.urls.getPlaces, {
            userId: pagingParameters.userId
          })
        };

        var placesTab = pagingParameters.placeTab;
        if (placesTab === null) {
          placesTab = 'Created';
        }

        httpService
          .httpGet(urlConfig, {
            itemsPerPage: pagingParameters.count,
            cursor: pagingParameters.cursor,
            placesTab: placesTab
          })
          .then(function (response) {
            const items = response.data;
            angular.forEach(items, assetsService.translatePlace);

            resolve({
              nextPageCursor: response.nextPageCursor,
              items
            });
          })
          .catch(function (response) {
            reject(response.Data || response.error || '');
          });
      });
    },

    getInventoryItemsV2(pagingParameters) {
      return $q(function (resolve, reject) {
        const urlConfig = {
          url: $filter('formatString')(inventoryConstants.urls.getUserInventoryV2, {
            userId: pagingParameters.userId,
            assetTypeId: pagingParameters.assetTypeId
          })
        };

        httpService
          .httpGet(urlConfig, {
            limit: pagingParameters.count,
            cursor: pagingParameters.cursor,
            sortOrder: 'Desc'
          })
          .then(function (response) {
            const items = response.data;
            angular.forEach(items, assetsService.formatInventoryV2Asset);
            if (response.nextPageCursor) {
              resolve({
                nextPageCursor: response.nextPageCursor,
                items
              });
            } else {
              resolve({
                nextPageCursor: response.Data && response.Data.nextPageCursor,
                items
              });
            }
          })
          .catch(function (response) {
            reject(response.Data || response.error || '');
          });
      });
    },

    getBadges(pagingParameters) {
      return $q(function (resolve, reject) {
        const urlConfig = {
          url: $filter('formatString')(inventoryConstants.urls.getBadges, {
            userId: pagingParameters.userId
          })
        };

        httpService
          .httpGet(urlConfig, {
            limit: pagingParameters.count,
            cursor: pagingParameters.cursor,
            sortOrder: 'Desc'
          })
          .then(function (response) {
            const items = response.data ? response.data : [];
            angular.forEach(items, assetsService.translateBadgeItem);

            resolve({
              nextPageCursor: response.nextPageCursor,
              items
            });
          })
          .catch(function (response) {
            reject(response.error || '');
          });
      });
    },

    getCreatorStoreAssets(pagingParameters) {
      const formatCreatorStoreAssets = (items, itemDetailsMap, assetTypeId) => {
        items.forEach(item => {
          const itemDetails = itemDetailsMap ? itemDetailsMap[item.assetId] : undefined;
          assetsService.formatCreatorStoreAsset(item, itemDetails, assetTypeId);
        });
      };

      return $q((resolve, reject) => {
        const inventoryUrlConfig = {
          url: $filter('formatString')(inventoryConstants.urls.getUserInventoryV2, {
            userId: pagingParameters.userId,
            assetTypeId: pagingParameters.assetTypeId
          })
        };

        httpService
          .httpGet(inventoryUrlConfig, {
            limit: pagingParameters.count,
            cursor: pagingParameters.cursor,
            sortOrder: 'Desc'
          })
          .then(inventoryResponse => {
            const items = inventoryResponse.data;
            const assetIds = items.map(item => item.assetId);

            if (assetIds.length === 0) {
              resolve({
                nextPageCursor: inventoryResponse.nextPageCursor,
                items
              });
              return;
            }

            // Make a single call to Toolbox service to fetch details for all assetIds
            const toolboxServiceUrlConfig = {
              url: $filter('formatString')(inventoryConstants.urls.getCreatorStoreItemDetails, {
                assetIds: assetIds.join(',')
              })
            };

            httpService
              .httpGet(toolboxServiceUrlConfig)
              .then(itemDetailResponse => {
                const itemDetailsMap = itemDetailResponse.data.reduce((result, itemDetails) => {
                  const newResult = { ...result };
                  newResult[itemDetails.asset.id] = itemDetails;
                  return newResult;
                }, {});
                formatCreatorStoreAssets(items, itemDetailsMap, pagingParameters.assetTypeId);
              })
              .catch(() => {
                // If the call to Toolbox service fails, format the items without item details
                formatCreatorStoreAssets(items, undefined, pagingParameters.assetTypeId);
              })
              .finally(() => {
                resolve({
                  nextPageCursor:
                    inventoryResponse.nextPageCursor ||
                    (inventoryResponse.Data && inventoryResponse.Data.nextPageCursor),
                  items
                });
              });
          })
          .catch(inventoryResponse => {
            reject(inventoryResponse.Data || inventoryResponse.error || '');
          });
      });
    },

    getBundles(pagingParameters) {
      return $q(function (resolve, reject) {
        const urlConfig = {
          url: $filter('formatString')(inventoryConstants.urls.getBundles, {
            userId: pagingParameters.userId
          })
        };

        httpService
          .httpGet(urlConfig, {
            limit: pagingParameters.count,
            cursor: pagingParameters.cursor,
            sortOrder: pagingParameters.sortOrder
          })
          .then(function (response) {
            const items = response.data ? response.data : [];
            angular.forEach(items, assetsService.translateCatalogItem);

            resolve({
              nextPageCursor: response.nextPageCursor,
              items
            });
          })
          .catch(function (response) {
            reject(response.error || '');
          });
      });
    },

    getBundlesWithBundleType(pagingParameters) {
      return $q(function (resolve, reject) {
        const urlConfig = {
          url: $filter('formatString')(inventoryConstants.urls.getBundlesWithType, {
            userId: pagingParameters.userId,
            bundleType: pagingParameters.assetTypeId
          })
        };

        httpService
          .httpGet(urlConfig, {
            limit: pagingParameters.count,
            cursor: pagingParameters.cursor,
            sortOrder: pagingParameters.sortOrder
          })
          .then(function (response) {
            const items = response.data ? response.data : [];
            angular.forEach(items, assetsService.translateCatalogItem);

            resolve({
              nextPageCursor: response.nextPageCursor,
              items
            });
          })
          .catch(function (response) {
            reject(response.error || '');
          });
      });
    },

    getGamePasses(pagingParameters) {
      return $q(function (resolve, reject) {
        const urlConfig = {
          url: $filter('formatString')(inventoryConstants.urls.getGamePasses, {
            userId: pagingParameters.userId
          })
        };

        httpService
          .httpGet(urlConfig, {
            count: pagingParameters.count,
            exclusiveStartId: pagingParameters.cursor
          })
          .then(function (response) {
            const items = response.gamePasses ? response.gamePasses : [];
            angular.forEach(items, assetsService.translateGamePassItem);

            // The game pass endpoint uses exclusiveStartId instead of cursor
            // So we pass in ID of last returned game pass if there was one
            const nextPageCursor =
              response.gamePasses.length > 0
                ? response.gamePasses[response.gamePasses.length - 1].gamePassId.toString()
                : undefined;

            resolve({
              nextPageCursor,
              items
            });
          })
          .catch(function (response) {
            reject(response.error || '');
          });
      });
    },

    getCategories(userId) {
      const urlConfig = {
        url: $filter('formatString')(inventoryConstants.urls.getCategories, {
          userId
        })
      };

      const params = {};

      const result = httpService.httpGet(urlConfig, params);

      return result;
    }
  };
}

inventoryModule.factory('inventoryService', inventoryService);
export default inventoryService;
