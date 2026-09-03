import angular from 'angular';
import { CurrentUser, Endpoints } from 'Roblox';
import inventoryModule from '../inventoryModule';
import { getUserIdFromUrl } from '../../utils/userInfo';

function inventoryContentController(
  $httpParamSerializer,
  $q,
  $scope,
  $log,
  assetsConstants,
  assetsService,
  $document,
  recommendationsConstants,
  cursorPaginationServiceV2,
  cursorPaginationConstants,
  inventoryService
) {
  'ngInject';

  const ctrl = this;

  ctrl.pageType = 'inventory';
  ctrl.assets = [];

  ctrl.userId = getUserIdFromUrl();
  ctrl.absoluteLibraryUrl = Endpoints.getAbsoluteUrl('/develop/library');
  ctrl.absoluteCatalogUrl = Endpoints.getAbsoluteUrl('/catalog');

  ctrl.cursorPager = cursorPaginationServiceV2.createPager({
    pageSize: 30,
    loadPageSize: 100,
    getItems(pagingParameters) {
      if (pagingParameters.type === 'Bundle') {
        if (ctrl.catalogMetadata && ctrl.catalogMetadata.isDynamicHeadsEnabled) {
          ctrl.recommendationsType = recommendationsConstants.recommendationTypes.bundle;
          return inventoryService.getBundlesWithBundleType(pagingParameters);
        }
        return inventoryService.getBundles(pagingParameters);
      }
      ctrl.recommendationsType = recommendationsConstants.recommendationTypes.asset;

      if (ctrl.currentData.isPrivateServerCategoryType) {
        return inventoryService.getPrivateServers(pagingParameters);
      }

      if (pagingParameters.assetTypeId === assetsConstants.assetTypeIds.place) {
        return inventoryService.getPlaces(pagingParameters);
      }

      if (pagingParameters.assetTypeId === assetsConstants.assetTypeIds.badge) {
        // badges asset type
        return inventoryService.getBadges(pagingParameters);
      }

      if (pagingParameters.assetTypeId === assetsConstants.assetTypeIds.gamePass) {
        // game pass asset type
        return inventoryService.getGamePasses(pagingParameters);
      }
      if (assetsConstants.creatorStoreAssetTypeIds.includes(pagingParameters.assetTypeId)) {
        return inventoryService.getCreatorStoreAssets(pagingParameters);
      }
      return inventoryService.getInventoryItemsV2(pagingParameters);
    }
  });

  // Fisher-Yates shuffle so each loaded inventory page renders in a random order.
  const shuffle = items => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  const pageLoaded = items => {
    // Only shuffle when viewing another user's inventory. The owner sees their
    // own inventory in its original order.
    ctrl.assets = ctrl.isOwnInventory ? items : shuffle(items);
    ctrl.currentData.templateVisible = true;
  };

  const pageLoadError = e => {
    if (e.type === cursorPaginationConstants.errorType.pagingParametersChanged) {
      // User switched to another tab. Do nothing.
      return;
    }
    ctrl.currentData.templateVisible = true;
    // This page does nothing with errors right now.
    $log.error(e);
  };

  const getUserDisplayName = userId => {
    return inventoryService
      .getUser(userId)
      .then(result => {
        return result.displayName;
      })
      .catch(() => {
        return '';
      });
  };

  const getCategories = () => {
    return inventoryService
      .getCategories(ctrl.userId)
      .then(result => {
        return result.categories;
      })
      .catch(() => {
        // Fallback to hard-coded list if we fail to fetch categories
        return assetsConstants.inventoryCategories;
      });
  };

  ctrl.assetsPager = {
    loadNextPage() {
      if (!ctrl.cursorPager.canLoadNextPage()) {
        return;
      }

      ctrl.cursorPager.loadNextPage().then(pageLoaded).catch(pageLoadError);
    },
    loadPreviousPage() {
      if (!this.canLoadPreviousPage()) {
        return;
      }

      ctrl.cursorPager.loadPreviousPage().then(pageLoaded).catch(pageLoadError);
    },
    canLoadNextPage: ctrl.cursorPager.canLoadNextPage,
    canLoadPreviousPage: ctrl.cursorPager.canLoadPreviousPage,
    getCurrentPageNumber: ctrl.cursorPager.getCurrentPageNumber
  };

  const isPrivateServerCategoryType = category => {
    return category.categoryType === assetsConstants.types.privateServers;
  };

  const updateForStateChange = () => {
    ctrl.currentData.templateVisible = false;

    if (!ctrl.categories || !ctrl.currentData.categoryName) {
      return;
    }

    const category =
      ctrl.categories.find(
        element => assetsService.makeUrlFriendly(element.name) === ctrl.currentData.categoryName
      ) ?? ctrl.categories[0];
    const subcategory = ctrl.currentData.subcategoryName
      ? category.items.find(
          element =>
            assetsService.makeUrlFriendly(element.name) === ctrl.currentData.subcategoryName
        )
      : category.items[0];

    ctrl.currentData.category = category;
    ctrl.currentData.subcategory = subcategory;
    ctrl.currentData.AssetTypeId = subcategory.id;
    ctrl.currentData.isPrivateServerCategoryType = isPrivateServerCategoryType(category);

    ctrl.constructCatalogUrl();
    // Remove behind switch in AVBURST-564
    $document.triggerHandler('Roblox.Recommendations.GetItems', [
      ctrl.currentData.AssetTypeId,
      ctrl.currentData.category.name
    ]);

    ctrl.cursorPager
      .setPagingParametersAndLoadFirstPage({
        cursor: '',
        userId: ctrl.userId,
        placeTab: subcategory.filter,
        assetTypeId: subcategory.id,
        sortOrder: cursorPaginationConstants.sortOrder.descending,
        type: subcategory.type
      })
      .then(pageLoaded)
      .catch(pageLoadError);
  };

  $scope.$on('$stateChangeSuccess', (_event, _toState, toParams) => {
    const { categoryName, subcategoryName } = toParams;
    ctrl.currentData.categoryName = categoryName;
    ctrl.currentData.subcategoryName = subcategoryName;

    updateForStateChange();
  });

  ctrl.isRecommendationAvailable = () => {
    return (
      ctrl.recommendationsType >= 0 &&
      ctrl.currentData.AssetTypeId > 0 &&
      ctrl.currentData.AssetTypeId !== assetsConstants.assetTypeIds.bundle
    );
  };

  ctrl.constructCatalogUrl = () => {
    const itemSection = assetsService.getItemSection(ctrl.currentData.category);
    let urlParams = {};
    if (
      angular.isDefined(ctrl.assetToCategoryMappings) &&
      angular.isDefined(ctrl.assetToSubcategoryMappings)
    ) {
      if (itemSection === assetsConstants.library) {
        ctrl.currentData.assetTypeUrl = ctrl.absoluteLibraryUrl;
        urlParams = {
          Category: ctrl.assetToCategoryMappings[ctrl.currentData.AssetTypeId],
          CatalogContext: assetsConstants.currentCatalogContext
        };
        ctrl.currentData.assetTypeUrl += `?${$httpParamSerializer(urlParams)}`;
        ctrl.currentData.itemSection = assetsConstants.library;
      } else if (itemSection === assetsConstants.catalog) {
        ctrl.currentData.assetTypeUrl = ctrl.absoluteCatalogUrl;
        if (ctrl.currentData.subcategory.type.toLowerCase() === assetsConstants.itemTypes.bundle) {
          urlParams = {
            Category:
              assetsConstants.bundleMarketplaceCategoryMapping[ctrl.currentData.AssetTypeId]
                .category,
            Subcategory:
              assetsConstants.bundleMarketplaceCategoryMapping[ctrl.currentData.AssetTypeId]
                .subcategory
          };
        } else {
          urlParams = {
            Category: ctrl.assetToCategoryMappings[ctrl.currentData.AssetTypeId],
            Subcategory: ctrl.assetToSubcategoryMappings[ctrl.currentData.subcategory.id]
          };
        }
        ctrl.currentData.assetTypeUrl += `?${$httpParamSerializer(urlParams)}`;
        ctrl.currentData.itemSection = assetsConstants.catalog;
      } else {
        ctrl.currentData.itemSection = null;
      }
    }
  };

  const init = () => {
    ctrl.showCreatorName = true;
    ctrl.isOwnInventory = Number(CurrentUser.userId) === ctrl.userId;
    ctrl.recommendationsType = recommendationsConstants.recommendationTypes.asset; // TODO: we need to pull this into separated file from core script instead of cross other project because there is no way to tell there is change there

    ctrl.currentData = {
      currentPage: 1,
      totalPages: 1,
      category: null,
      categoryName: null,
      subcategory: null,
      subcategoryName: null,
      assetTypeUrl: ctrl.absoluteCatalogUrl,
      ItemTypeId: 0,
      AssetTypeId: 0,
      itemSection: assetsConstants.types.catalog,
      templateVisible: true,
      isRecommendationAvailable: false
    };

    const loadingPromises = [];
    loadingPromises.push(getUserDisplayName(ctrl.userId));
    loadingPromises.push(assetsService.getAssetToCategoryMappings());
    loadingPromises.push(assetsService.getAssetToSubcategoryMappings());
    loadingPromises.push(getCategories());
    loadingPromises.push(assetsService.getCatalogMetadata());

    $q.all(loadingPromises).then(results => {
      [
        ctrl.displayName,
        ctrl.assetToCategoryMappings,
        ctrl.assetToSubcategoryMappings,
        ctrl.categories,
        ctrl.catalogMetadata
      ] = results;

      if (ctrl.currentData.categoryName) {
        updateForStateChange();
      }

      ctrl.nameForTitle = ctrl.displayName ? ctrl.displayName : ctrl.username;
      ctrl.isLoaded = true;
    });
  };

  ctrl.$onInit = init;
}

inventoryModule.controller('inventoryContentController', inventoryContentController);
export default inventoryContentController;
