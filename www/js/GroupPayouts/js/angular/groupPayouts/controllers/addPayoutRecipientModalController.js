import groupPayoutsModule from '../groupPayoutsModule';

function addPayoutRecipientModalController(
  $q,
  $scope,
  $uibModalInstance,
  modalData,
  groupsService,
  thumbnailConstants,
  groupUtilityService,
  languageResource,
  groupPayoutsService
) {
  'ngInject';

  $scope.params = modalData;

  $scope.addPayoutRecipients = function () {
    $scope.params.addPayoutRecipients($scope.recipients);
    $uibModalInstance.dismiss();
  };

  $scope.isUserAlreadyPayoutRecipient = function (userId) {
    const user = $scope.params.recipients.filter(function (userData) {
      return userData.userId === userId;
    });
    return user && user.length > 0;
  };

  $scope.selectUser = function (user) {
    return $q(function (resolve, reject) {
      $scope.layout.isLoadingUser = true;

      if ($scope.isUserAlreadyPayoutRecipient(user.id)) {
        $scope.layout.isLoadingUser = false;
        reject(languageResource.get('Message.UserAlreadyAdded'));
        return;
      }

      groupsService
        .getUserRoleInGroup(user.id, $scope.params.groupId)
        .then(
          function (role) {
            if (role) {
              groupPayoutsService
                .getUserPayoutEligibility($scope.params.groupId, user.id)
                .then(eligibilityResult => {
                  const payoutEligibility = eligibilityResult.usersGroupPayoutEligibility;
                  if (payoutEligibility[user.id] === 'Eligible') {
                    const recipient = {
                      role: role.name,
                      id: user.id,
                      name: user.name,
                      displayName: user.displayName,
                      url: groupUtilityService.profilePageUrl(user.id)
                    };

                    $scope.recipients.push(recipient);

                    resolve();
                  } else {
                    reject(languageResource.get('Message.UserGroupPayoutIneligible'));
                  }
                });
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

  $scope.removeUser = index => {
    $scope.recipients.splice(index, 1);
  };

  $scope.close = function () {
    $uibModalInstance.dismiss();
  };

  $scope.init = function () {
    $scope.thumbnailTypes = thumbnailConstants.thumbnailTypes;

    $scope.layout = {};
    $scope.recipients = [];
  };

  $scope.init();
}

groupPayoutsModule.controller(
  'addPayoutRecipientModalController',
  addPayoutRecipientModalController
);
export default addPayoutRecipientModalController;
