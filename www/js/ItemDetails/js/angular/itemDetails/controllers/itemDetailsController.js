import { EnvironmentUrls, CurrentUser } from 'Roblox';
import itemDetailsModule from '../itemDetailsModule';

function itemDetailsController($q, $scope, itemDetailsService) {
  'ngInject';

  const ctrl = this;

  const loadData = async () => {
    try {
      const result = await itemDetailsService.getDetails(ctrl.targetId, ctrl.isBundle);
      ctrl.itemDetail = result;
      if (result === null) {
        window.location.href = `${EnvironmentUrls.websiteUrl}/catalog`;
      }
      ctrl.canReportItem = result.creatorTargetId !== 1;
      ctrl.canPurchaseItem = result.purchasable;
      if (ctrl.isBundle) {
        ctrl.isAnimationBundle = result.bundleType === 2;
        ctrl.allowedInShowcase = !ctrl.isAnimationBundle;
        const items = [];
        result.bundledItems.forEach(bundledItem => {
          if (
            bundledItem.type.toLowerCase() === 'asset' ||
            bundledItem.type.toLowerCase() === 'bundle'
          ) {
            items.push({ id: bundledItem.id, itemType: bundledItem.type });
          }
        });
        window.dispatchEvent(
          new CustomEvent('item-list:render', {
            detail: {
              items,
              purchasable: false,
              selectable: false,
              backgroundVisualContainer: false,
              titleText: 'Included Items',
              wrapItems: true,
              eventIdentifier: 'included-items',
              showCreatorName: false,
              showPrice: false,
              showItemType: true,
              checkOwnership: false
            }
          })
        );
      } else {
        ctrl.canDeleteItem = false;
        ctrl.allowedInShowcase = [
          19,
          8,
          41,
          42,
          43,
          44,
          45,
          46,
          47,
          72,
          67,
          70,
          71,
          61,
          66,
          65,
          69,
          68,
          64
        ].includes(result.assetType);
        ctrl.isClassicAssetType = [2, 11, 12, 18].includes(result.assetType);
      }

      const purchaseParamsPromises = [];

      if (ctrl.isBundle) {
        purchaseParamsPromises.push(itemDetailsService.getBundleThumbnail(ctrl.targetId));
      } else {
        purchaseParamsPromises.push(itemDetailsService.getAssetThumbnail(ctrl.targetId));
      }
      if (CurrentUser.isAuthenticated) {
        purchaseParamsPromises.push(itemDetailsService.getCurrentUserBalance(CurrentUser.userId));
      }

      try {
        const results = await $q.all(purchaseParamsPromises);
        ctrl.thumbnailUrl = results[0].data[0].imageUrl;
        if (CurrentUser.isAuthenticated) {
          ctrl.currentUserBalance = results[1].robux;
        }
        ctrl.purchaseParamsLoaded = true;
      } catch {
        ctrl.purchaseParamsLoaded = true;
      }
    } catch (e) {
      if (e.errors[0].code === 21) {
        window.location.href = `${EnvironmentUrls.websiteUrl}/catalog`;
      } else {
        window.location.href = `${EnvironmentUrls.websiteUrl}/request-error`;
      }
    }

    const type = ctrl.isBundle ? ctrl.itemDetail.bundleType : ctrl.itemDetail.assetType;
    itemDetailsService
      .getRecommendations(ctrl.targetId, type, 7, ctrl.isBundle)
      .then(recommendations => {
        const items = [];
        recommendations.data.forEach(recommendation => {
          items.push({
            id: recommendation,
            itemType: ctrl.itemType
          });
        });
        window.dispatchEvent(
          new CustomEvent('item-list:render', {
            detail: {
              items,
              purchasable: false,
              selectable: false,
              backgroundVisualContainer: true,
              titleText: 'Recommendations',
              wrapItems: false,
              eventIdentifier: 'recommendations',
              checkOwnership: true
            }
          })
        );
      })
      .catch(() => {});

    const loadingPromises = [];

    if (CurrentUser.isAuthenticated) {
      loadingPromises.push(itemDetailsService.getCanConfigure(ctrl.targetId, ctrl.isBundle));

      loadingPromises.push(itemDetailsService.getUserShowcase(CurrentUser.userId));
      if (!ctrl.isBundle) {
        loadingPromises.push(itemDetailsService.getCanSponsor(ctrl.targetId));
      }

      $q.all(loadingPromises)
        .then(results => {
          if (CurrentUser.isAuthenticated) {
            ctrl.canConfigureItem = results[0].isAllowed;
            results[1].forEach(element => {
              if (element.id.toString() === ctrl.targetId.toString()) {
                if (element.assetSeoUrl.includes(ctrl.isBundle ? 'bundles' : 'catalog')) {
                  ctrl.isInShowcase = true;
                }
              }
            });
            if (!ctrl.isBundle) {
              ctrl.canSponsorItem = results[2][ctrl.targetId];
            }
          }

          ctrl.loaded = true;
        })
        .catch(() => {
          ctrl.loaded = true;
        });
    } else {
      ctrl.loaded = true;
    }
  };

  const initialized = () => {
    ctrl.isClassicAssetType = false;
    ctrl.loaded = false;
    ctrl.purchaseParamsLoaded = false;
    ctrl.isAnimationBundle = false;
    ctrl.canReportItem = false;
    ctrl.canDeleteItem = false;
    ctrl.canPurchaseItem = false;
    ctrl.allowedInShowcase = false;
    ctrl.isInShowcase = false;
    ctrl.canConfigureItem = false;
    ctrl.canSponsorItem = false;
    if (window.location.href.includes('bundles')) {
      ctrl.isBundle = true;
      ctrl.itemType = 'Bundle';
    } else {
      ctrl.isBundle = false;
      ctrl.itemType = 'Asset';
    }

    if (ctrl.isBundle) {
      const { pathname } = window.location;
      const parts = /\/bundles\/([^/]+)/.exec(pathname);
      const bundleId = parts !== null && parts[1] !== null ? parts[1] : '';
      ctrl.targetId = bundleId;
    } else {
      const { pathname } = window.location;
      const parts = /\/catalog\/([^/]+)/.exec(pathname);
      const assetId = parts !== null && parts[1] !== null ? parts[1] : '';
      ctrl.targetId = assetId;
    }

    loadData();
  };

  ctrl.$onInit = initialized;
}

itemDetailsModule.controller('itemDetailsController', itemDetailsController);
export default itemDetailsController;
