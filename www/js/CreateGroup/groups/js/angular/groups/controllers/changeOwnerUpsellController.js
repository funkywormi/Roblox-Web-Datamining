import groupsModule from '../groupsModule';

function changeOwnerUpsellModalController($scope, $uibModalInstance, modalData) {
  'ngInject';

  $scope.params = modalData;

  $scope.close = function () {
    $uibModalInstance.dismiss();
  };

  $scope.getChangeOwnerUrl = function () {
    return $scope.params.changeOwnerUrl;
  };

  $scope.leaveGroup = function () {
    $scope.params.onLeaveGroup();
    $uibModalInstance.dismiss();
  };

  $scope.init = function () {};

  $scope.init();
}

groupsModule.controller('changeOwnerUpsellModalController', changeOwnerUpsellModalController);
export default changeOwnerUpsellModalController;
