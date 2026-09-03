import groupsModule from '../groupsModule';
import groupsConstants from '../constants/groupsConstants';

function verificationRedirectModalController(
  $scope,
  $uibModalInstance,
  verificationService,
  verificationResources
) {
  'ngInject';

  $scope.redirectToSettings = function () {
    verificationService.sendFrictionEvent(verificationResources.events.goToSecurityBtn);
    window.location.href = groupsConstants.absoluteUrls.mySettings;
  };

  $scope.close = function () {
    verificationService.sendFrictionEvent(verificationResources.events.cancelBtn);
    $uibModalInstance.dismiss();
  };
}

groupsModule.controller('verificationRedirectModalController', verificationRedirectModalController);
export default verificationRedirectModalController;
