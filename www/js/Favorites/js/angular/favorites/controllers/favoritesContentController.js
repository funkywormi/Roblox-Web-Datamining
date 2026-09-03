import { CurrentUser, Endpoints } from 'Roblox';
import favoritesModule from '../favoritesModule';
import { getUserIdFromUrl } from '../../utils/userInfo';

function favoritesContentController(
  $httpParamSerializer,
  $q,
  $scope,
  assetsService,
  $log,
  $timeout,
  assetsConstants,
  favoritesService,
  cursorPaginationServiceV2,
  cursorPaginationConstants
) {
  'ngInject';

  const ctrl = this;

  ctrl.pageType = 'favorites';
  ctrl.assets = [];

  ctrl.userId = getUserIdFromUrl();
  ctrl.absoluteLibraryUrl = Endpoints.getAbsoluteUrl('/develop/library');
  ctrl.absoluteCatalogUrl = Endpoints.getAbsoluteUrl('/catalog');

  ctrl.cursorPager = cursorPaginationServiceV2.createPager({
    pageSize: 30,
    loadPageSize: 100,
    getItems(pagingParameters) {
      if (pagingParameters.subtypeId === assetsConstants.assetTypeIds.avatar) {
        return favoritesService.getFavoriteLooks(pagingParameters);
      }
      if (pagingParameters.itemType.toLowerCase() === assetsConstants.itemTypes.bundle) {
        return favoritesService.getFavoriteBundles(pagingParameters);
      }

      if (pagingParameters.subtypeId === assetsConstants.assetTypeIds.place) {
        return favoritesService.getFavoriteGames(pagingParameters);
      }

      if (assetsConstants.creatorStoreAssetTypeIds.includes(pagingParameters.subtypeId)) {
        return favoritesService.getFavoriteCreatorAssets(pagingParameters);
      }

      // Default to assets
      return favoritesService.getFavoriteAssets(pagingParameters);
    }
  });

  // Fisher-Yates shuffle so each loaded favorites page renders in a random order.
  const shuffle = items => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  const pageLoaded = items => {
    // Only shuffle when viewing another user's favorites. The profile owner
    // sees their own favorites in their original order.
    ctrl.assets = ctrl.isOwnFavorites ? items : shuffle(items);
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
    return favoritesService
      .getUser(userId)
      .then(result => {
        return result.displayName;
      })
      .catch(() => {
        return '';
      });
  };

  const getCategories = () => {
    return favoritesService
      .getCategories(ctrl.userId)
      .then(result => {
        return result.categories;
      })
      .catch(() => {
        // Fallback to hard-coded list if we fail to fetch categories
        return assetsConstants.favoriteCategories;
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

  ctrl.loadCreatorNamePolicy = () => {
    favoritesService.getInventoryCreatorNamePolicy().then(
      response => {
        ctrl.showCreatorName = response.displayCreatorNameInFavorites;
      },
      error => {
        console.debug(error);
      }
    );
  };

  const updateForStateChange = () => {
    ctrl.currentData.templateVisible = false;

    if (!ctrl.categories) {
      return;
    }

    $timeout(() => {
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

      const itemSection = assetsService.getItemSection(category);
      if (itemSection === 'library') {
        ctrl.currentData.assetTypeUrl = ctrl.absoluteLibraryUrl;
        ctrl.currentData.itemSection = 'library';
      } else if (itemSection === 'catalog') {
        ctrl.currentData.assetTypeUrl = ctrl.absoluteCatalogUrl;
        let urlParams = {};
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
        ctrl.currentData.itemSection = 'catalog';
      } else {
        ctrl.currentData.itemSection = null;
      }

      ctrl.cursorPager
        .setPagingParametersAndLoadFirstPage({
          cursor: '',
          userId: ctrl.userId,
          itemType: subcategory.type,
          subtypeId: subcategory.id
        })
        .then(pageLoaded)
        .catch(pageLoadError);
    });
  };

  $scope.$on('$stateChangeSuccess', (_event, _toState, toParams) => {
    const { categoryName, subcategoryName } = toParams;
    ctrl.currentData.categoryName = categoryName;
    ctrl.currentData.subcategoryName = subcategoryName;

    updateForStateChange();
  });

  const init = () => {
    ctrl.isOwnFavorites = Number(CurrentUser.userId) === ctrl.userId;

    ctrl.currentData = {
      currentPage: 1,
      totalPages: 1,
      category: null,
      categoryName: null,
      subcategory: null,
      subcategoryName: null,
      assetTypeUrl: ctrl.absoluteCatalogUrl,
      ItemTypeId: 0, // No bundles
      AssetTypeId: 0,
      itemSection: assetsConstants.types.catalog,
      templateVisible: true
    };

    const loadingPromises = [];
    loadingPromises.push(getUserDisplayName(ctrl.userId));
    loadingPromises.push(getCategories());
    loadingPromises.push(assetsService.getAssetToCategoryMappings());
    loadingPromises.push(assetsService.getAssetToSubcategoryMappings());

    $q.all(loadingPromises).then(results => {
      [
        ctrl.displayName,
        ctrl.categories,
        ctrl.assetToCategoryMappings,
        ctrl.assetToSubcategoryMappings
      ] = results;
      if (ctrl.currentData.categoryName) {
        updateForStateChange();
      }

      ctrl.nameForTitle = ctrl.displayName ? ctrl.displayName : ctrl.userId;
      ctrl.isLoaded = true;
    });

    ctrl.showCreatorName = false;
    ctrl.loadCreatorNamePolicy();
  };

  ctrl.$onInit = init;
}

favoritesModule.controller('favoritesContentController', favoritesContentController);
export default favoritesContentController;
