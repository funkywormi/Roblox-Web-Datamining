/* eslint-disable no-param-reassign */
import revenueModule from '../revenueModule';

function transactionsController($scope) {
  'ngInject';

  const ctrl = this;

  const init = () => {
    $scope.targetId = ctrl.targetId;
    $scope.transactionType = ctrl.transactionType;
  };

  ctrl.$onInit = init;
}

revenueModule.controller('transactionsController', transactionsController);
export default transactionsController;
