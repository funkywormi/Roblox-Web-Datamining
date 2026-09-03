import angular from 'angular';
import { Guac } from 'Roblox';
import favoritesModule from '../favoritesModule.js';

function favoritesService($q, $filter, $timeout, favoritesConstants, assetsService, httpService) {
  'ngInject';

  return {
    getUser(userId) {
      const urlConfig = {
        url: $filter('formatString')(favoritesConstants.urls.getUser, {
          userId
        })
      };
      return httpService.httpGet(urlConfig);
    },
    getInventoryCreatorNamePolicy() {
      return Guac.callBehaviour('inventory-creator-policy');
    },

    // When Creator team moves this page to CreatorHub, we can delete this
    getFavoriteCreatorAssets(pagingParameters) {
      const formatCreatorStoreAssets = (items, itemDetailsMap, assetTypeId) => {
        items.forEach(item => {
          item.assetId = item.asset.id;
          item.assetName = item.asset.name;
          const itemDetails = itemDetailsMap ? itemDetailsMap[item.assetId] : undefined;
          assetsService.formatCreatorStoreAsset(item, itemDetails, assetTypeId);
        });
      };

      return $q(function (resolve, reject) {
        const urlConfig = {
          url: $filter('formatString')(favoritesConstants.urls.getCreatorStoreFavoriteAssets, {
            userId: pagingParameters.userId,
            subtypeId: pagingParameters.subtypeId
          })
        };

        httpService
          .httpGet(urlConfig, {
            limit: pagingParameters.count,
            cursor: pagingParameters.cursor
          })
          .then(function (response) {
            const items = response.data;
            const itemDetailsMap = items.reduce((result, item) => {
              const newResult = { ...result };
              newResult[item.asset.id] = {
                creator: {
                  // api returns type and id as a single string e.g. 'user/1'
                  id: Number(item.creator.creator.split('/')[1]),
                  type: assetsService.convertCreatorTypeStringToNumber(
                    item.creator.creator.split('/')[0]
                  ),
                  name: item.creator.name
                }
              };
              return newResult;
            }, {});
            formatCreatorStoreAssets(items, itemDetailsMap, pagingParameters.subtypeId);

            resolve({
              nextPageCursor: response.nextPageCursor,
              items
            });
          })
          .catch(function (response) {
            resolve({
              items: []
            });
          });
      });
    },

    getFavoriteAssets(pagingParameters) {
      return $q(function (resolve, reject) {
        const urlConfig = {
          url: $filter('formatString')(favoritesConstants.urls.getUserFavoriteAssets, {
            userId: pagingParameters.userId,
            subtypeId: pagingParameters.subtypeId
          })
        };

        httpService
          .httpGet(urlConfig, {
            limit: pagingParameters.count,
            cursor: pagingParameters.cursor
          })
          .then(function (response) {
            const items = response.data ?? [];
            angular.forEach(items, assetsService.translateFavoriteAsset);
            let nextPageCursor = null;
            if (response.nextPageCursor !== null) {
              nextPageCursor = response.nextPageCursor;
            }

            resolve({
              nextPageCursor,
              items
            });
          })
          .catch(function (response) {
            resolve({
              items: []
            });
          });
      });
    },

    getFavoriteLooks(pagingParameters) {
      return $q(function (resolve, reject) {
        const urlConfig = {
          url: favoritesConstants.urls.getUserFavoriteLooks
        };

        httpService
          .httpGet(urlConfig, {
            limit: pagingParameters.count,
            cursor: pagingParameters.cursor,
            isPrevious: false,
            userId: pagingParameters.userId,
            lookType: 'Avatar'
          })
          .then(function (response) {
            const lookIds = response.lookIds ?? [];
            
            if (lookIds.length === 0) {
              $timeout(() => resolve({ nextPageCursor: null, items: [] }));
              return;
            }
            
            const lookReq = lookIds.map(lookId => ({ id: lookId, type: 'Look' }));
            
            httpService
              .httpPost(
                { url: favoritesConstants.urls.getHydratedWidgets, useCredentials: true },
                { content: lookReq }
              )
              .then(function (widgetResult) {
                const hydratedContentMap = {};
                const hydratedContent = widgetResult?.hydratedContent ?? [];
                hydratedContent.forEach(content => {
                  hydratedContentMap[content.id] = content;
                });
                
                const items = lookIds.map(lookId => {
                  const hydratedContent = hydratedContentMap[lookId];
                  if (!hydratedContent) {
                    return null;
                  }
                  return {
                    itemType: 'Look',
                    name: hydratedContent.name,
                    creatorType: hydratedContent.curator.type,
                    creatorName: hydratedContent.curator.name,
                    price: hydratedContent.totalPrice,
                    isOffSale: false,
                    creatorTargetId: hydratedContent.curator.id,
                    id: lookId
                  };
                }).filter(item => item !== null);
                
                angular.forEach(items, assetsService.translateFavoriteLook);
                
                let nextPageCursor = null;
                if (response.nextPageCursor !== null) {
                  nextPageCursor = response.nextPageCursor;
                }

                // Wrap in $timeout to ensure Angular digest cycle runs after nested promise resolves
                $timeout(() => {
                  resolve({
                    nextPageCursor,
                    items
                  });
                });
              })
              .catch(function (hydrationError) {
                $timeout(() => resolve({ items: [] }));
              });
          })
          .catch(function (response) {
            $timeout(() => resolve({ items: [] }));
          });
      });
    },

    getFavoriteGames(pagingParameters) {
      return $q(function (resolve, reject) {
        const urlConfig = {
          url: $filter('formatString')(favoritesConstants.urls.getUserFavoriteGames, {
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
            const items = response.data ?? [];
            angular.forEach(items, assetsService.translateFavoritePlace);
            let nextPageCursor = null;
            if (response.nextPageCursor !== null) {
              nextPageCursor = response.nextPageCursor;
            }

            resolve({
              nextPageCursor,
              items
            });
          })
          .catch(function (response) {
            resolve({
              items: []
            });
          });
      });
    },

    getFavoriteBundles(pagingParameters) {
      return $q(function (resolve, reject) {
        const urlConfig = {
          url: $filter('formatString')(favoritesConstants.urls.getUserFavoriteBundles, {
            userId: pagingParameters.userId,
            subtypeId: pagingParameters.subtypeId
          })
        };
        httpService
          .httpGet(urlConfig, {
            itemsPerPage: pagingParameters.count,
            cursor: pagingParameters.cursor
          })
          .then(function (response) {
            const items = response.favorites;
            angular.forEach(items, assetsService.translateCatalogItem);
            let nextPageCursor = null;
            if (response.nextCursor !== null) {
              // What's important is that we return a unique next page cursor string, even if we're not reading it.
              // The consumer of this method needs it to know if there _is_ a next page.
              nextPageCursor = response.nextCursor;
            }
            resolve({
              nextPageCursor,
              items
            });
          })
          .catch(function (response) {
            resolve({
              items: []
            });
          });
      });
    },

    getCategories(userId) {
      const urlConfig = {
        url: $filter('formatString')(favoritesConstants.urls.getCategories, {
          userId
        })
      };

      const params = {};

      const result = httpService.httpGet(urlConfig, params);

      return result;
    }
  };
}

favoritesModule.factory('favoritesService', favoritesService);
export default favoritesService;
