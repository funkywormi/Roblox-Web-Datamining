import groupsModule from '../groupsModule';

function exileUserController(
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

  $scope.exileUser = function () {
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
            systemFeedbackService.warning(
              languageResource.get(groupsConstants.translations.deleteWallPostsByUserError)
            );

            $log.debug('--deleteWallPostsByUser-error---');
          }
        }
      );
    }

    groupsService.exileUser($scope.params.groupId, $scope.params.userId).then(
      function () {
        modalData.reloadCurrentPage();

        systemFeedbackService.success(
          languageResource.get(groupsConstants.translations.kickUserSuccess)
        );
      },
      function (data) {
        systemFeedbackService.warning(
          languageResource.get(groupsConstants.translations.kickUserError)
        );
      }
    );

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

groupsModule.controller('exileUserController', exileUserController);
export default exileUserController;
