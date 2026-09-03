import recommendationsModule from '../recommendationsModule';

function itemListController(
  $scope,
  $log,
  itemsListService,
  itemListConstants,
  itemsListLayoutService
) {
  'ngInject';

  $scope.getItemListAndDetails = () => {
    itemsListService
      .getItemList($scope.itemCreator)
      .then(resultOfList => {
        if (resultOfList && resultOfList.data) {
          $scope.items = resultOfList.data.slice(0, 7);

          itemsListService.getItemDetails($scope.items).then(resultOfDetails => {
            if (resultOfDetails && resultOfDetails.data) {
              resultOfDetails.data.forEach(details => {
                const { id } = details;
                $scope.items.some(item => {
                  if (item.id === id) {
                    Object.assign(item, details);
                  }
                });
              });
            }
          });
        }
      })
      .finally(() => {
        $scope.itemListLayout.isItemListDetailsLoaded = true;
      });
  };

  $scope.isItemListDetailsAvailable = () => {
    return $scope.itemListLayout.isItemListDetailsLoaded && $scope.items && $scope.items.length > 0;
  };

  $scope.isItemListDetailsEmpty = () => {
    return (
      $scope.itemListLayout.isItemListDetailsLoaded && $scope.items && $scope.items.length === 0
    );
  };

  $scope.initializeLayout = () => {
    $scope.itemListLayout = { ...itemsListLayoutService.itemListLayout };
    const username = $scope.itemCreator.Name;
    $scope.itemListLayout.heading = itemsListLayoutService.itemListHeading(username);
    $scope.itemListLayout.seeMoreLink = itemsListLayoutService.getSeeMoreLink(
      username,
      $scope.itemCreator.Type
    );
  };

  function initItemList() {
    $scope.initializeLayout();
    $scope.getItemListAndDetails();
  }
  initItemList();
}

recommendationsModule.controller('itemListController', itemListController);
export default itemListController;
