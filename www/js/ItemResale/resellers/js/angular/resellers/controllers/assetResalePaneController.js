import angular from 'angular';
import { object } from 'prop-types';
import { CurrentUser, AvatarAccoutrementService, ItemDetailsHydrationService } from 'Roblox';
import resellersModule from '../resellersModule.js';

function assetResalePaneController(resaleService, resellersConstants, $timeout) {
  'ngInject';

  const ctrl = this;

  const checkIfItemIsResellable = details => {
    if (details.itemRestrictions.indexOf('Collectible') > -1) {
      return true;
    }
    if (details.itemRestrictions.indexOf('Limited') > -1) {
      return true;
    }
    if (details.itemRestrictions.indexOf('LimitedUnique') > -1) {
      return true;
    }
    return false;
  };

  ctrl.loadItemDetails = function () {
    ItemDetailsHydrationService.getItemDetails(
      [{ id: ctrl.assetId, itemType: ctrl.itemType }],
      undefined,
      true
    )
      .then(function (details) {
        if (checkIfItemIsResellable(details[0])) {
          ctrl.resellableItem = true;
          const itemDetails = details[0];
          ctrl.itemDetails = itemDetails;
          if (details[0].collectibleItemId) {
            ctrl.resaleRestriction = details[0].collectibleItemDetails.resaleRestriction;
            ctrl.isLimited2 = true;
            ctrl.collectibleItemId = details[0].collectibleItemId;
            ctrl.selectTab(resellersConstants.resellersTabs.inventory);
          }
          ctrl.loadResaleData();
        } else {
          ctrl.resellableItem = false;
        }
      })
      .catch(function () {
        ctrl.resaleDataLoadFailure = true;
        ctrl.loadingResaleData = false;
      });
  };

  ctrl.loadResaleData = function () {
    if (ctrl.loadingResaleData) {
      return;
    }

    ctrl.loadingResaleData = true;
    ctrl.resaleDataLoadFailure = false;

    if (ctrl.isLimited2) {
      ItemDetailsHydrationService.getItemDetails(
        [{ id: ctrl.assetId, itemType: ctrl.itemType }],
        undefined,
        true
      )
        .then(function (itemDetails) {
          const marketplaceItemDetails = itemDetails[0].collectibleItemDetails;
          const limitedDetails = {
            assetStock: marketplaceItemDetails.assetStock,
            assetType: AvatarAccoutrementService.getAssetTypeNameById(ctrl.itemDetails.assetType),
            collectibleItemId: ctrl.collectibleItemId,
            sales: marketplaceItemDetails.sales,
            originalPrice: marketplaceItemDetails.price
          };

          resaleService
            .getLimited2AssetResaleData(ctrl.collectibleItemId)
            .then(function (resaleData) {
              ctrl.resaleData = limitedDetails;
              ctrl.resaleData.priceDataPoints = resaleData.priceDataPoints;
              ctrl.resaleData.volumeDataPoints = resaleData.volumeDataPoints;
              ctrl.resaleData.recentAveragePrice = resaleData.recentAveragePrice;

              ctrl.loadingResaleData = false;
            })
            .catch(function () {
              ctrl.resaleData = limitedDetails;
              ctrl.loadingResaleData = false;
            });
        })
        .catch(function () {
          ctrl.resaleData = undefined;
          ctrl.resaleDataLoadFailure = true;
          ctrl.loadingResaleData = false;
        });
    } else {
      resaleService
        .getAssetResaleData(ctrl.assetId)
        .then(function (resaleData) {
          ctrl.resaleData = resaleData;
          ctrl.loadingResaleData = false;
        })
        .catch(function () {
          ctrl.resaleData = undefined;
          ctrl.resaleDataLoadFailure = true;
          ctrl.loadingResaleData = false;
        });
    }
  };

  ctrl.getTabActiveClasses = function (tabName) {
    return {
      active: tabName === ctrl.selectedTab
    };
  };

  ctrl.selectTab = function (tabName) {
    ctrl.selectedTab = tabName;
  };

  const init = function () {
    ctrl.authenticatedUser = CurrentUser.isAuthenticated
      ? {
          id: Number(CurrentUser.userId)
        }
      : null;
    // Use $timeout to ensure the DOM is fully rendered
    $timeout(function () {
      let assetDataContainer = angular.element('#item-container');
      if (document.getElementById('asset-resale-data-container')) {
        assetDataContainer = angular.element('#asset-resale-data-container');
      }

      ctrl.assetData = {
        id: ctrl.assetId,
        name: assetDataContainer.data('item-name'),
        type: assetDataContainer.data('asset-type'),
        productId: assetDataContainer.data('product-id'),
        membershipRequirement: assetDataContainer.data('bc-requirement')
      };

      ctrl.economyMetadata = {
        purchasingEnabled: assetDataContainer.data('is-purchase-enabled')
      };

      if (ctrl.isBundle === undefined) {
        ctrl.isBundle = false;
      }
      ctrl.itemType = ctrl.isBundle === true ? 'bundle' : 'asset';
      ctrl.resellersTabs = resellersConstants.resellersTabs;
      ctrl.selectTab(resellersConstants.resellersTabs.priceChart);

      ctrl.loadItemDetails();
    }, 0); // Use a delay of 0 to ensure the DOM is fully updated
  };

  ctrl.$onInit = init;
}

resellersModule.controller('assetResalePaneController', assetResalePaneController);
export default assetResalePaneController;
