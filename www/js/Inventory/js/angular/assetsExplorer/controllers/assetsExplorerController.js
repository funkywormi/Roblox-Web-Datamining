import { CurrentUser, DeviceMeta } from 'Roblox';
import assetsExplorerModule from '../assetsExplorerModule';
import { getUserIdFromUrl } from '../../utils/userInfo';

function assetsExplorerController(
  $scope,
  assetsMessageService,
  assetsConstants,
  assetsService,
  itemCardUtility
) {
  'ngInject';

  const ctrl = this;
  ctrl.itemDetailCache = {};

  const layoutData = { ...assetsConstants.defaultLayoutData };

  ctrl.makeUrlFriendly = assetsService.makeUrlFriendly;

  ctrl.shouldShowPremiumIcon = item => {
    if (!layoutData.isPremiumIconOnItemTilesEnabled) {
      return false;
    }

    if (!item.Product || !item.Product.PremiumPriceInRobux) {
      return false;
    }

    return true;
  };

  ctrl.getDisplayPrice = item => {
    if (!item.Product) {
      return undefined;
    }

    if (layoutData.isPremiumPriceOnItemTilesEnabled && item.Product.PremiumPriceInRobux) {
      return item.Product.PremiumPriceInRobux;
    }

    return item.Product.PriceInRobux;
  };

  ctrl.doesItemHavePrice = item => {
    if (!item.Product) {
      return false;
    }

    if (
      !item.Product.PriceInRobux &&
      (!item.Product.PremiumPriceInRobux || !layoutData.isPremiumPriceOnItemTilesEnabled)
    ) {
      return false;
    }

    return true;
  };

  const init = () => {
    $scope.assetsPager = ctrl.assetsPager;
    const deviceMeta = new DeviceMeta();
    ctrl.staticData = {
      canViewInventory: ctrl.canViewInventory === 'True',
      isLibraryLinkEnabled: !deviceMeta.isInApp && !(deviceMeta.isPhone || deviceMeta.isTablet),
      isOwnPage: Number(CurrentUser.userId) === getUserIdFromUrl(),
    }
    ctrl.assetsConstants = assetsConstants;
    ctrl.getInventoryEmptyMessage = assetsMessageService.getInventoryEmptyMessage;
    ctrl.getInventoryNewItemsMessage = assetsMessageService.getInventoryNewItemsMessage;
    ctrl.showMessageToFindNewItems = assetsMessageService.showMessageToFindNewItems;
    ctrl.getExploreMessage = assetsMessageService.getExploreMessage;

    assetsService.getCatalogMetadata().then(function success(result) {
      const { isPremiumIconOnItemTilesEnabled, isPremiumPriceOnItemTilesEnabled } = result;

      layoutData.isPremiumIconOnItemTilesEnabled = isPremiumIconOnItemTilesEnabled;
      layoutData.isPremiumPriceOnItemTilesEnabled = isPremiumPriceOnItemTilesEnabled;
    });
  };

  ctrl.$onInit = init;

  ctrl.$onChanges = function () {
    if (ctrl.assets) {
      const assets = [];
      for (let assetCount = 0; assetCount < ctrl.assets.length; assetCount++) {
        const item = ctrl.assets[assetCount];
        if (
          ctrl.currentData.itemSection &&
          ctrl.currentData.itemSection.toLowerCase() === 'catalog' &&
          item.hydrationRequired &&
          (!ctrl.itemDetailCache[item.itemType] !== undefined ||
            !ctrl.itemDetailCache[item.itemType][item.id] !== undefined)
        ) {
          if (!item.id) {
            item.id = item.assetId;
          }
          assets.push({ id: item.id, itemType: item.itemType });
        }
      }
      if (assets.length > 0) {
        assetsService.postItemDetails(assets).then(function success(result) {
          result.data.forEach(item => {
            if (!ctrl.itemDetailCache[item.itemType]) {
              ctrl.itemDetailCache[item.itemType] = {};
            }
            ctrl.itemDetailCache[item.itemType][item.id] = item;
          });
          for (let assetCount = 0; assetCount < ctrl.assets.length; assetCount++) {
            const item = ctrl.assets[assetCount];
            if (
              item.hydrationRequired &&
              ctrl.itemDetailCache[item.itemType] &&
              ctrl.itemDetailCache[item.itemType][item.id]
            ) {
              ctrl.assets[assetCount] = itemCardUtility.mapCatalogDetailsToInventoryItemCard(
                item,
                ctrl.itemDetailCache[item.itemType][item.id]
              );
            }
          }
        });
      }
    } else {
      for (let assetCount = 0; assetCount < ctrl.assets.length; assetCount++) {
        const item = ctrl.assets[assetCount];
        if (
          item.hydrationRequired &&
          ctrl.itemDetailCache[item.itemType] &&
          ctrl.itemDetailCache[item.itemType][item.id]
        ) {
          ctrl.assets[assetCount] = itemCardUtility.mapCatalogDetailsToInventoryItemCard(
            item,
            ctrl.itemDetailCache[item.itemType][item.id]
          );
        }
      }
    }
  };
}

assetsExplorerModule.controller('assetsExplorerController', assetsExplorerController);
export default assetsExplorerController;
