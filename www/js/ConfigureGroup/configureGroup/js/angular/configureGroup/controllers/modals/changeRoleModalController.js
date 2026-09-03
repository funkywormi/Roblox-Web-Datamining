import configureGroupModule from '../../configureGroupModule';

function changeRoleModalController($scope, $uibModalInstance, modalData) {
  'ngInject';

  $scope.params = modalData;

  $scope.changeRole = function () {
    $scope.layout.isLoading = true;
    $scope.params.updateUserRole($scope.params.user, $scope.params.newRole, $scope.params.index);
    $uibModalInstance.close();
  };

  $scope.close = function () {
    $uibModalInstance.dismiss();
  };

  $scope.init = function () {
    $scope.layout = {};
  };

  $scope.init();
}

configureGroupModule.controller('changeRoleModalController', changeRoleModalController);
export default changeRoleModalController;
