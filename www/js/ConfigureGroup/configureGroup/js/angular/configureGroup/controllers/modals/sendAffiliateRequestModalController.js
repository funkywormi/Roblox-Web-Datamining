import configureGroupModule from '../../configureGroupModule';

function sendAffiliateRequestModalController(
  $q,
  $scope,
  $uibModalInstance,
  groupsService,
  groupsConstants,
  modalData,
  configureGroupAffiliatesService,
  thumbnailConstants,
  languageResource,
  systemFeedbackService
) {
  'ngInject';

  $scope.params = modalData;

  $scope.close = function () {
    $uibModalInstance.dismiss();
  };

  $scope.selectGroup = function (groupSearchResult) {
    return $q(function (resolve, reject) {
      $scope.group = {};
      $scope.layout.isLoadingGroup = true;

      groupsService
        .getGroup(groupSearchResult.id)
        .then(
          function (groupData) {
            Object.assign($scope.group, groupData);
            resolve();
          },
          function (response) {
            if (response.errors[0].code === 0) {
              reject(languageResource.get(groupsConstants.translations.defaultError));
            } else {
              reject(response.errors[0].message);
            }
          }
        )
        .finally(function () {
          $scope.layout.isLoadingGroup = false;
        });
    });
  };

  $scope.doesGroupHaveOwner = function () {
    return $scope.group && $scope.group.owner !== null && $scope.group.owner.userId > 0;
  };

  $scope.isAlliesPage = function () {
    return $scope.data.relationshipType === groupsConstants.relationshipTypes.allies;
  };

  $scope.modalButtonText = function () {
    return $scope.isAlliesPage()
      ? languageResource.get('Action.Request')
      : languageResource.get('Action.Send');
  };

  $scope.modalTitleText = function () {
    return $scope.isAlliesPage()
      ? languageResource.get('Label.SendAllyRequest')
      : languageResource.get('Label.DeclareEnemy');
  };

  $scope.createGroupRelationship = function () {
    configureGroupAffiliatesService
      .createGroupRelationship(
        $scope.params.currentGroupId,
        $scope.data.relationshipType,
        $scope.group.id
      )
      .then(
        function (response) {
          if ($scope.isAlliesPage()) {
            systemFeedbackService.success(
              languageResource.get('Message.AllyRequestSent', { group: $scope.group.name })
            );
          } else {
            // Enemy declarations are automatic, seeing new enemy in list is enough for user to understand declaration was successful
            $scope.params.loadFirstPage();
          }
        },
        function (response) {
          systemFeedbackService.warning(response.errors[0].message);
        }
      )
      .finally(function () {
        $uibModalInstance.dismiss();
      });
  };

  $scope.init = function () {
    $scope.thumbnailTypes = thumbnailConstants.thumbnailTypes;
    $scope.data = {
      relationshipType: $scope.params.relationshipType
    };
    $scope.layout = {};
    $scope.group = {};
  };

  $scope.init();
}

configureGroupModule.controller(
  'sendAffiliateRequestModalController',
  sendAffiliateRequestModalController
);
export default sendAffiliateRequestModalController;
