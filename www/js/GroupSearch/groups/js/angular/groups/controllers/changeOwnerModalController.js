import { AccountIntegrityChallengeService } from 'Roblox';
import groupsModule from '../groupsModule';

function changeOwnerModalController(
  $q,
  $scope,
  $uibModalInstance,
  $uibModal,
  $log,
  $window,
  modalData,
  groupsService,
  groupUtilityService,
  languageResource,
  thumbnailConstants,
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

  $scope.changeOwner = function () {
    $scope.layout.errorMessage = undefined;
    $scope.layout.isLoading = true;
    groupsService.changeOwner($scope.params.groupId, $scope.newOwner.id).then(
      function () {
        var currentlUrl = $window.location.href;
        var newUrl = groupUtilityService.groupDetailsPageUrl(
          $scope.params.groupId,
          $scope.params.groupName
        );

        if (currentlUrl == newUrl) {
          $uibModalInstance.dismiss();
          $window.location.reload();
        } else {
          // eslint-disable-next-line no-param-reassign
          $window.location.href = newUrl;
        }
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
            languageResource.get(groupsConstants.translations.defaultError)
          );
        }

        $log.debug('--changeOwner-error---');
        $scope.layout.isLoading = false;
        $uibModalInstance.dismiss();
      }
    );
  };

  $scope.selectUser = function (newOwner) {
    return $q(function (resolve, reject) {
      $scope.newOwner = {};
      $scope.layout.isLoadingUser = true;

      groupsService
        .getUserRoleInGroup(newOwner.id, $scope.params.groupId)
        .then(
          function (role) {
            if (role) {
              // Shouldn't be able to set owner to owner
              if (role.rank === $scope.metadata.roleConfiguration.maxRank) {
                reject(languageResource.get('Message.UserIsOwner'));
              } else {
                $scope.newOwner = {
                  role: role.name,
                  id: newOwner.id,
                  name: newOwner.name,
                  displayName: newOwner.displayName,
                  url: groupUtilityService.profilePageUrl(newOwner.id)
                };

                resolve();
              }
            } else {
              reject(languageResource.get('Message.TargetUserNotInGroup'));
            }
          },
          function (err) {
            reject(err);
          }
        )
        .finally(function () {
          $scope.layout.isLoadingUser = false;
        });
    });
  };

  $scope.close = function () {
    $uibModalInstance.dismiss();
  };

  $scope.init = function () {
    $scope.thumbnailTypes = thumbnailConstants.thumbnailTypes;

    $scope.newOwner = {};

    $scope.layout = {};

    if (!$scope.params.metadata) {
      groupsService.getGroupConfigurationMetadata().then(function (result) {
        $scope.metadata = result;
      });
    } else {
      $scope.metadata = $scope.params.metadata;
    }
  };

  $scope.init();
}

groupsModule.controller('changeOwnerModalController', changeOwnerModalController);
export default changeOwnerModalController;
