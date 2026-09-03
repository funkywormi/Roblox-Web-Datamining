import groupModule from '../groupModule';

function groupStoreController(
  $scope,
  $filter,
  groupStoreService,
  groupDetailsConstants,
  thumbnailConstants,
  cursorPaginationService,
  creatorTypeConstants,
  groupExperimentsService
) {
  'ngInject';

  const ctrl = this;

  ctrl.getDevelopPageUrl = () => {
    return `/develop/groups/${ctrl.groupId}?view=11`;
  };

  ctrl.getCatalogPageUrl = () => {
    return `/catalog?Category=1&CreatorName=${encodeURIComponent(ctrl.groupName)}&CreatorType=${
      creatorTypeConstants.creatorTypes.group
    }`;
  };

  const reorderResponseByRequestOrder = (requestItems, responseItems) => {
    const itemMap = {};
    responseItems.forEach(item => {
      const itemId = item.id;
      if (itemId) {
        itemMap[itemId] = item;
      }
    });

    const orderedItems = [];
    requestItems.forEach(requestItem => {
      const itemId = requestItem.id;
      if (itemMap[itemId]) {
        orderedItems.push(itemMap[itemId]);
      }
    });
    return orderedItems;
  };

  $scope.storePager = cursorPaginationService.createPager({
    sortOrder: cursorPaginationService.sortOrder.Desc,
    pageSize: groupDetailsConstants.storePageSize,
    loadPageSize: groupDetailsConstants.cursorPageLoadSize,

    getCacheKeyParameters(params) {
      return {
        category: params.category,
        sortType: params.sortType,
        creatorType: params.creatorType,
        creatorTargetId: params.creatorTargetId
      };
    },

    getRequestUrl() {
      return $filter('formatString')(groupDetailsConstants.urls.catalogSearch);
    },

    beforeLoad() {
      ctrl.layout.isLoading = true;
      ctrl.layout.loadError = false;
    },

    loadSuccess(items) {
      ctrl.layout.isLoading = true;
      groupStoreService.getItemDetails(items).then(details => {
        const orderedDetails = reorderResponseByRequestOrder(items, details.data);
        if (ctrl.layout.isInfiniteScroll) {
          // Append if infinite scroll
          ctrl.storeItems = ctrl.storeItems.concat(orderedDetails);
        } else {
          ctrl.storeItems = orderedDetails;
        }
        ctrl.layout.isLoading = false;
      });
    },

    loadError(errors) {
      ctrl.storeItems = [];
      ctrl.layout.isLoading = false;
      ctrl.layout.loadError = true;
    }
  });

  ctrl.isInfiniteScrollingDisabled = () => {
    return !ctrl.layout.isInfiniteScroll || ctrl.layout.isLoading;
  };

  const init = () => {
    ctrl.isInitialized = true;

    ctrl.layout = {
      isInfiniteScroll: ctrl.metadata.isPhone
    };

    ctrl.storeItems = [];

    ctrl.thumbnailTypes = thumbnailConstants.thumbnailTypes;

    $scope.storePager.setPagingParameter('category', 'All');
    $scope.storePager.setPagingParameter('creatorType', 'Group');
    $scope.storePager.setPagingParameter('creatorTargetId', ctrl.groupId);

    groupExperimentsService
      .getCommunityStoreSortOrderExperimentVariant()
      .then(variant => {
        $scope.storePager.setPagingParameter('sortType', variant);
        if (variant === 'Sales') {
          $scope.storePager.setPagingParameter('sortAggregation', 'PastWeek');
        }
      })
      .catch(() => {
        // Set default sort type on error
        $scope.storePager.setPagingParameter('sortType', 'Updated');
      })
      .finally(() => {
        $scope.storePager.loadFirstPage();
      });
  };

  const onChanges = changesObj => {
    // If we haven't initialized this yet, return
    if (!ctrl.isInitialized) {
      return;
    }

    if ('groupId' in changesObj) {
      $scope.storePager.setPagingParameter('creatorTargetId', ctrl.groupId);
      $scope.storePager.loadFirstPage();
    }
  };

  ctrl.$onInit = init;
  ctrl.$onChanges = onChanges;
}

groupModule.controller('groupStoreController', groupStoreController);
export default groupStoreController;
