import { AccountIntegrityChallengeService } from 'Roblox';
import groupModule from '../groupModule';

function leaveGroupController(
  $scope,
  $uibModalInstance,
  $uibModal,
  modalData,
  $log,
  languageResource,
  groupDetailsConstants,
  systemFeedbackService,
  groupsConstants,
  verificationService,
  verificationResources
) {
  'ngInject';

  $scope.params = modalData;

  $scope.showVerificationRedirectModal = function () {
    verificationService.sendFrictionEvent(
      verificationResources.events.settingsRedirectModalTriggered
    );
    const modalParams = {
      animation: false,
      templateUrl: 'verification-redirect-modal',
      controller: 'verificationRedirectModalController'
    };
    $uibModal.open(modalParams);
  };

  $scope.showVerificationInputModal = function (isUsingTwoStepWebviewComponent) {
    if (isUsingTwoStepWebviewComponent) {
      const { TwoStepVerification } = AccountIntegrityChallengeService;

      verificationService.popUpTwoStepVerificationChallenge(
        verificationResources.events.codeInputModalTriggered,
        TwoStepVerification
      );
    } else {
      const modalParams = {
        animation: false,
        templateUrl: 'verification-input-modal',
        controller: 'verificationInputModalController'
      };
      $uibModal.open(modalParams);
    }
  };

  $scope.leaveGroup = function () {
    modalData.leaveGroup().then(
      function () {
        modalData.refreshGroupData();
      },
      function (data) {
        if (data.errors && data.errors.length > 0) {
          if (
            data.errors[0].code ===
            groupsConstants.errorCodes.membership.twoStepVerificationRequired
          ) {
            $uibModalInstance.dismiss();

            verificationService
              .getTwoStepVerificationConfiguration()
              .then(result => {
                if (result.twoStepEnabled) {
                  $scope.showVerificationInputModal(result.usingTwoStepWebviewComponent);
                } else {
                  $scope.showVerificationRedirectModal();
                }
              })
              .catch(() => {
                $scope.showVerificationRedirectModal(); // on error, default to settings redirect modal
              });
          } else {
            systemFeedbackService.warning(data.errors[0].userFacingMessage);
          }
        } else {
          systemFeedbackService.warning(
            languageResource.get(groupDetailsConstants.translations.leaveGroupError)
          );
        }
        $log.debug('--leaveGroup-error---');
      }
    );

    $uibModalInstance.close();
  };

  $scope.close = function () {
    $uibModalInstance.dismiss();
  };
}

groupModule.controller('leaveGroupController', leaveGroupController);
export default leaveGroupController;
