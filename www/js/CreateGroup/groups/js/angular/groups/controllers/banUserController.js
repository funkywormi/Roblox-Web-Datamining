import groupsModule from '../groupsModule';

function banUserController(
  $scope,
  $uibModalInstance,
  groupsService,
  modalData,
  $log,
  groupsConstants,
  languageResource,
  systemFeedbackService
) {
  'ngInject';

  $scope.params = modalData;

  $scope.banUser = function () {
    // Check if the checkbox is checked or not
    if ($scope.layout.deleteWallPosts) {
      groupsService.deletePostsByUser($scope.params.groupId, $scope.params.userId).then(
        function () {
          // Remove the posts wallReloadDelay milliseconds after post deletion as bulk post deletion is executed asynchronously on backend.
          setTimeout(function () {
            modalData.removeUserPosts(modalData.userId);
          }, groupsConstants.wallReloadDelay);
        },
        function (error) {
          if (error.status !== groupsConstants.statusCodes.operationUnavailable) {
            // TODO update when forums are available to everyone
            systemFeedbackService.warning(
              languageResource.get(groupsConstants.translations.deleteWallPostsByUserError)
            );
            $log.debug('--deleteWallPostsByUser-error---');
          }
        }
      );
    }

    groupsService
      .banUser($scope.params.groupId, $scope.params.userId)
      .then(data => {
        modalData.reloadCurrentPage();

        systemFeedbackService.success(
          languageResource.get(groupsConstants.translations.banUserSuccess)
        );
      })
      .catch(error => {
        systemFeedbackService.warning(
          languageResource.get(groupsConstants.translations.banUserError)
        );
        $log.debug('--banUser-error---');
      });

    $uibModalInstance.close();
  };

  $scope.close = function () {
    $uibModalInstance.dismiss();
  };

  $scope.init = function () {
    $scope.layout = {
      deleteWallPosts: false
    };
  };

  $scope.init();
}

groupsModule.controller('banUserController', banUserController);
export default banUserController;
