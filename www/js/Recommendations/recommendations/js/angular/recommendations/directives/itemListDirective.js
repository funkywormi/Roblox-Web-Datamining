import recommendationsModule from '../recommendationsModule';

function itemList(itemListConstants) {
  'ngInject';

  return {
    restrict: 'A',
    scope: true,
    templateUrl: itemListConstants.templateUrls.itemList
  };
}

recommendationsModule.directive('itemList', itemList);

export default itemList;
