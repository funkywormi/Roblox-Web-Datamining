import { CreateGroupService } from 'Roblox';
import createGroupModule from '../createGroupModule';

function createGroupDirective() {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      metadata: '<',
      policies: '<',
      createGroupRequest: '=',
      errorMessages: '=',
      iconUploadInfo: '=',
      coverPhotoUploadInfo: '=',
      creationInProgress: '<',
      isCreateGroupButtonDisabled: '&',
      purchaseButtonClicked: '&',
      cancelUrl: '<'
    },
    link($scope, element) {
      const safeApply = fn => {
        const phase = $scope.$root && $scope.$root.$$phase;
        if (phase === '$apply' || phase === '$digest') {
          $scope.$evalAsync(fn);
        } else {
          $scope.$apply(fn);
        }
      };

      const renderCreateGroup = () => {
        if (!CreateGroupService || !$scope.metadata || !$scope.policies) {
          return;
        }

        CreateGroupService.renderCreateGroup(element[0], {
          metadata: $scope.metadata,
          policies: $scope.policies,
          createGroupRequest: $scope.createGroupRequest,
          errorMessages: $scope.errorMessages,
          iconUploadInfo: $scope.iconUploadInfo,
          coverPhotoUploadInfo: $scope.coverPhotoUploadInfo,
          creationInProgress: $scope.creationInProgress,
          isCreateGroupButtonDisabled: () => $scope.isCreateGroupButtonDisabled(),
          onClickPurchaseCreateGroup: () => $scope.purchaseButtonClicked(),
          cancelUrl: $scope.cancelUrl,
          setName(newName) {
            safeApply(() => {
              if (!$scope.createGroupRequest) {
                $scope.createGroupRequest = {};
              }
              $scope.createGroupRequest.name = newName;
              if ($scope.errorMessages) {
                $scope.errorMessages.name = '';
              }
            });
          },
          setDescription(newDescription) {
            safeApply(() => {
              if (!$scope.createGroupRequest) {
                $scope.createGroupRequest = {};
              }
              $scope.createGroupRequest.description = newDescription;
              if ($scope.errorMessages) {
                $scope.errorMessages.description = '';
              }
            });
          },
          setIsGroupPublic(isPublic) {
            safeApply(() => {
              if (!$scope.createGroupRequest) {
                $scope.createGroupRequest = {};
              }
              $scope.createGroupRequest.isGroupPublic = isPublic;
            });
          },
          setIconFile(file) {
            safeApply(() => {
              if (!$scope.iconUploadInfo) {
                $scope.iconUploadInfo = {};
              }
              $scope.iconUploadInfo.file = file || null;
              if (typeof $scope.iconUploadInfo.onChange === 'function') {
                $scope.iconUploadInfo.onChange();
              }
            });
          },
          setCoverPhotoFile(file) {
            safeApply(() => {
              if (!$scope.coverPhotoUploadInfo) {
                $scope.coverPhotoUploadInfo = {};
              }
              $scope.coverPhotoUploadInfo.file = file || null;
              if (typeof $scope.coverPhotoUploadInfo.onChange === 'function') {
                $scope.coverPhotoUploadInfo.onChange();
              }
            });
          }
        });
      };

      element.ready(renderCreateGroup);

      $scope.$watch(
        () => ({
          metadata: $scope.metadata,
          policies: $scope.policies,
          createGroupRequest: $scope.createGroupRequest,
          errorMessages: $scope.errorMessages,
          hasIconUploadInfo: !!($scope.iconUploadInfo && $scope.iconUploadInfo.file),
          hasCoverPhotoUploadInfo: !!(
            $scope.coverPhotoUploadInfo && $scope.coverPhotoUploadInfo.file
          ),
          creationInProgress: $scope.creationInProgress
        }),
        (newVal, oldVal) => {
          if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
            renderCreateGroup();
          }
        },
        true
      );
    }
  };
}

createGroupModule.directive('createGroup', createGroupDirective);

export default createGroupDirective;
