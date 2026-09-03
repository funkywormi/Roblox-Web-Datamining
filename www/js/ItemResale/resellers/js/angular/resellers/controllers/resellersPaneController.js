import { initRobloxBadgesFrameworkAgnostic } from 'roblox-badges';
import resellersModule from '../resellersModule.js';

function resellersPaneController(
  resellersConstants,
  resaleService,
  $q,
  $scope,
  cursorPaginationServiceV2,
  cursorPaginationConstants,
  experimentationService
) {
  'ngInject';

  const ctrl = this;
  ctrl.showResellerTradeButton = false;

  const fetchSellerTradePermissions = async function (sellerId) {
    try {
      const result = await resaleService.getCanTradeWith(sellerId);
      return { sellerId, permissions: result };
    } catch (error) {
      return { sellerId, error };
    }
  };

  const batchFetchSellerTradePermissions = async function (resaleRecords = []) {
    if (!resaleRecords?.length) return;
    const batchSize = resellersConstants.fetchTradePermissionsBatchSize;
    const slice = resaleRecords.slice(0, batchSize);

    const results = await Promise.all(slice.map(fetchSellerTradePermissions));

    const updates = {};
    results.forEach(({ sellerId, permissions, error }) => {
      updates[sellerId] = {
        isFetching: false,
        canTrade: !!permissions?.canTrade,
        error: error || null
      };
    });

    ctrl.resellerTradePermissions = {
      ...ctrl.resellerTradePermissions,
      ...updates
    };

    await batchFetchSellerTradePermissions(resaleRecords.slice(batchSize));
  };

  const initiateFetchSellerTradePermissions = async function (resaleRecords) {
    if (!resaleRecords?.length) return;
    const sellerIds = resaleRecords
      .map(resaleRecord => {
        return resaleRecord?.seller?.id;
      })
      .filter(sellerId => {
        // remove if already fetched or queued
        if (!sellerId || ctrl.resellerTradePermissions?.[sellerId]) {
          return false;
        }
        return true;
      });
    sellerIds.forEach(sellerId => {
      if (!ctrl.resellerTradePermissions[sellerId]) {
        ctrl.resellerTradePermissions[sellerId] = { isFetching: true, canTrade: false };
      }
    });
    await batchFetchSellerTradePermissions(sellerIds || []);
    $scope?.$apply?.();
  };

  const resellersLoaded = function (resaleRecords) {
    ctrl.resellersLoading = false;
    resaleRecords.forEach(function (resaleRecord) {
      const existingRecord =
        ctrl.resaleDeduplicator[
          ctrl.isLimited2 ? resaleRecord.collectibleItemInstanceId : resaleRecord.userAssetId
        ];
      if (existingRecord) {
        // Already exists in resaleRecords, update the information we know about it
        existingRecord.price = resaleRecord.price;
        existingRecord.seller = resaleRecord.seller;
        return;
      }

      ctrl.resaleDeduplicator[
        ctrl.isLimited2 ? resaleRecord.collectibleItemInstanceId : resaleRecord.userAssetId
      ] = resaleRecord;
      ctrl.resaleRecords.push(resaleRecord);
    });
    initiateFetchSellerTradePermissions(resaleRecords);

    // bootstraps the verified badges component
    try {
      initRobloxBadgesFrameworkAgnostic({
        overrideIconClass: 'verified-badge-icon-item-resellers'
      });
    } catch (e) {
      // noop
    }
  };

  const resellersLoadFailure = function (e) {
    if (e.type === cursorPaginationConstants.errorType.pagingParametersChanged) {
      // Another request started, do nothing.
      return;
    }

    ctrl.resellersLoading = false;
  };

  const resellersPager = cursorPaginationServiceV2.createPager({
    pageSize: 10,
    loadPageSize: 100,

    getItems(pagingParameters) {
      if (ctrl.isLimited2 && ctrl.resaleData.collectibleItemId) {
        return $q(function (resolve, reject) {
          resaleService
            .getResellersForLimited2Item(ctrl.resaleData.collectibleItemId, pagingParameters)
            .then(resellers => {
              resolve({
                nextPageCursor:
                  resellers.nextPageCursor !== '' ? resellers.nextPageCursor : undefined,
                items: resellers.data
              });
            })
            .catch(reject);
        });
      }
      return $q(function (resolve, reject) {
        resaleService
          .getResellers(ctrl.assetData.id, pagingParameters)
          .then(resellers => {
            resolve({
              nextPageCursor: resellers.nextPageCursor,
              items: resellers.data
            });
          })
          .catch(reject);
      });
    }
  });

  ctrl.loadMore = function () {
    ctrl.resellersLoading = true;
    resellersPager.loadNextPage().then(resellersLoaded).catch(resellersLoadFailure);
  };

  ctrl.initTradeBtnExperiment = async function () {
    try {
      const showResellerTradeButton = await experimentationService.getShouldShowResellerTradeBtn();
      ctrl.showResellerTradeButton = showResellerTradeButton || false;
    } catch (err) {}
  };

  const init = function () {
    ctrl.resaleRecords = [];
    ctrl.resaleDeduplicator = {};
    ctrl.resellerTradePermissions = {};
    ctrl.showResellerTradeButton = false;
    ctrl.canLoadMore = resellersPager.canLoadNextPage;
    ctrl.initTradeBtnExperiment();

    resellersPager.loadFirstPage().then(resellersLoaded).catch(resellersLoadFailure);
  };

  ctrl.$onInit = init;
}

resellersModule.controller('resellersPaneController', resellersPaneController);
export default resellersPaneController;
