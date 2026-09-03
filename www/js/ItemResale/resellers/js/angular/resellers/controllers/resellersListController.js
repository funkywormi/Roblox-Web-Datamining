import { Endpoints, CurrentUser } from 'Roblox';
import { eventStreamService } from 'core-roblox-utilities';
import { authenticatedUser } from 'header-scripts';
import { uuidService, numberFormat } from 'core-utilities';
import resellersModule from '../resellersModule.js';

function resellersListController(
  resellersConstants,
  languageResource,
  thumbnailConstants,
  resaleService,
  systemFeedbackService,
  $scope
) {
  'ngInject';

  const ctrl = this;

  ctrl.formatNumber = function (number) {
    if (number > 0) {
      return numberFormat.getNumberFormat(number);
    }

    return languageResource.get(resellersConstants.translationKeys.notAvailable);
  };

  ctrl.takeOffSale = function (resaleRecord) {
    if (ctrl.isLimited2) {
      ctrl.takeOffSaleDebounce[resaleRecord.collectibleProductId] = true;
      resaleService
        .patchRemoveLimited2ItemFromSale(
          ctrl.resaleData.collectibleItemId,
          resaleRecord,
          authenticatedUser.id
        )
        .then(function () {
          delete ctrl.takeOffSaleDebounce[resaleRecord.collectibleProductId];

          // Successfully taken off sale, remove it from the list.
          const resaleIndex = ctrl.resaleRecords.indexOf(resaleRecord);
          ctrl.resaleRecords.splice(resaleIndex, 1);
        })
        .catch(function () {
          delete ctrl.takeOffSaleDebounce[resaleRecord.collectibleProductId];

          systemFeedbackService.warning(
            languageResource.get(resellersConstants.translationKeys.takeOffSaleFailure),
            0,
            resellersConstants.errorBannerTimeout
          );
        });
    } else {
      ctrl.takeOffSaleDebounce[resaleRecord.userAssetId] = true;
      resaleService
        .takeOffSale(ctrl.assetData.id, resaleRecord.userAssetId)
        .then(function () {
          delete ctrl.takeOffSaleDebounce[resaleRecord.userAssetId];

          // Successfully taken off sale, remove it from the list.
          const resaleIndex = ctrl.resaleRecords.indexOf(resaleRecord);
          ctrl.resaleRecords.splice(resaleIndex, 1);
        })
        .catch(function () {
          delete ctrl.takeOffSaleDebounce[resaleRecord.userAssetId];

          systemFeedbackService.warning(
            languageResource.get(resellersConstants.translationKeys.takeOffSaleFailure),
            0,
            resellersConstants.errorBannerTimeout
          );
        });
    }
  };

  ctrl.purchaseLimited1Item = function (resaleRecord) {
    window.dispatchEvent(
      new CustomEvent('angular-to-react-purchase-event', {
        detail: {
          identifier: 'limited-reseller-list',
          name: ctrl.assetData.name,
          itemType: ctrl.itemType,
          assetId: ctrl.assetData.id,
          productId: ctrl.assetData.productId,
          assetType: ctrl.assetData.type,
          expectedCurrency: 1,
          expectedPrice: resaleRecord.price,
          expectedPurchaserId: authenticatedUser.id,
          expectedPurchaserType: 'User',
          expectedSellerId: ctrl.getSellerId(resaleRecord),
          expectedSellerName: resaleRecord.seller.name,
          userAssetId: resaleRecord.userAssetId,
          refreshPage: true,
          resalePurchase: true
        }
      })
    );
    ctrl.onResellerBuyBtnClick(resaleRecord);
  };

  ctrl.purchaseLimited2Item = function (resaleRecord) {
    const uuid = uuidService.generateRandomUuid();
    window.dispatchEvent(
      new CustomEvent('angular-to-react-purchase-event', {
        detail: {
          identifier: 'limited-reseller-list',
          name: ctrl.assetData.name,
          itemType: ctrl.itemType,
          assetId: ctrl.assetData.id,
          productId: ctrl.productId,
          assetType: ctrl.resaleData.assetType,
          collectibleItemId: ctrl.resaleData.collectibleItemId,
          collectibleItemInstanceId: resaleRecord.collectibleItemInstanceId,
          collectibleProductId: resaleRecord.collectibleProductId,
          expectedCurrency: 1,
          expectedPrice: resaleRecord.price,
          expectedPurchaserId: authenticatedUser.id,
          expectedPurchaserType: 'User',
          expectedSellerId: resaleRecord.seller.sellerId,
          expectedSellerName: resaleRecord.seller.name,
          expectedSellerType: resaleRecord.seller.sellerType,
          idempotencyKey: uuid,
          refreshPage: true,
          resalePurchase: true
        }
      })
    );
  };

  ctrl.isFetchingTradePermissions = function (sellerId) {
    return ctrl.resellerTradePermissions?.[sellerId]?.isFetching ?? true;
  };

  ctrl.getSellerId = function (resaleRecord) {
    return resaleRecord.seller.id ? resaleRecord.seller.id : resaleRecord.seller.sellerId;
  };

  ctrl.canTradeWith = function (sellerId) {
    const isFetching = ctrl.isFetchingTradePermissions(sellerId);
    if (isFetching) return false;

    return ctrl.resellerTradePermissions?.[sellerId]?.canTrade || false;
  };

  ctrl.logResellerBtnClickEvent = function (resaleRecord, btnStr) {
    const eventParams = [
      ['assetId', ctrl.assetData.id],
      ['sellerAssetId', resaleRecord.userAssetId],
      ['sellerUserId', resaleRecord.seller.id],
      ['sellerAssetPrice', resaleRecord.price],
      ['btn', btnStr]
    ].filter(entry => entry[1] !== undefined && entry[1] !== null);

    if (eventParams.length) {
      eventStreamService.sendEventWithTarget(
        eventStreamService.eventTypes.buttonClick,
        resellersConstants.eventStream.context.resellersList,
        Object.fromEntries(eventParams)
      );
    }
  };

  ctrl.onResellerBuyBtnClick = function (resaleRecord) {
    ctrl.logResellerBtnClickEvent(resaleRecord, resellersConstants.eventStream.name.buyBtn);
  };

  ctrl.onResellerTradeBtnClick = function (resaleRecord) {
    ctrl.logResellerBtnClickEvent(resaleRecord, resellersConstants.eventStream.name.tradeBtn);
  };

  ctrl.onUpgradeToPremiumClick = function (resaleRecord) {
    ctrl.logResellerBtnClickEvent(resaleRecord, resellersConstants.eventStream.name.upgradeBtn);
  };

  ctrl.onNonPremiumTradeBtnClick = function (resaleRecord) {
    if (ctrl.activeUpgradeTradeBtnId === resaleRecord.userAssetId) {
      ctrl.activeUpgradeTradeBtnId = null;
    } else {
      ctrl.activeUpgradeTradeBtnId = resaleRecord.userAssetId;
      ctrl.logResellerBtnClickEvent(
        resaleRecord,
        resellersConstants.eventStream.name.nonPremiumTradeBtn
      );
    }
  };

  ctrl.getUpgradeToPremiumURL = function () {
    return Endpoints.getAbsoluteUrl(`/premium/membership?ctx=trade#premium-memberships`);
  };

  ctrl.getUserTradeUrl = function (userId, sellerAssetId) {
    return Endpoints.getAbsoluteUrl(`/users/${userId}/trade?ritems=${sellerAssetId}`);
  };
  ctrl.getProfilePageUrl = function (userId) {
    return Endpoints.getAbsoluteUrl(`/users/${userId}/profile`);
  };
  ctrl.addTradeWindowClickListener = function () {
    window.addEventListener(
      'click',
      evt => {
        if (!ctrl.activeUpgradeTradeBtnId) return;
        let inTradeContainer = false;
        for (const btnCont of document.querySelectorAll('.trade-button-container')) {
          if (btnCont.contains(evt.target)) {
            inTradeContainer = true;
          }
        }
        if (!inTradeContainer) {
          ctrl.activeUpgradeTradeBtnId = null;
          $scope?.$apply?.();
        }
      },
      true
    );
  };

  ctrl.showVerifiedBadge = seller => {
    return seller && seller.hasVerifiedBadge;
  };

  const init = function () {
    ctrl.isPremiumUser = CurrentUser.isPremiumUser;
    ctrl.takeOffSaleDebounce = {};
    ctrl.thumbnailTypes = thumbnailConstants.thumbnailTypes;
    ctrl.authenticatedUser = {
      id: Number(CurrentUser.userId)
    };
    ctrl.addTradeWindowClickListener();
  };

  ctrl.$onInit = init;
}

resellersModule.controller('resellersListController', resellersListController);
export default resellersListController;
