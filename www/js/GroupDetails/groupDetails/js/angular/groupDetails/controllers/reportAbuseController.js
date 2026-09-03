import groupModule from '../groupModule';

function reportAbuseController($scope, $uibModalInstance, modalData, groupDetailsService) {
  'ngInject';

  $scope.abusePageUrl = function () {
    let url = '';
    // eslint-disable-next-line default-case
    switch ($scope.currentReport.name) {
      case $scope.params.reportAbuseTypes.group:
        if ($scope.params.policies.EnableGroup) {
          url = groupDetailsService.abusePageRevampUrl('group', $scope.params.groupId);
          break;
        }
        url = groupDetailsService.abusePageUrl('group', $scope.params.groupId);
        break;
      case $scope.params.reportAbuseTypes.role:
        if ($scope.params.policies.EnableGroupRoleset) {
          url = groupDetailsService.abusePageRevampUrl(
            'group_roleset_v2',
            `${$scope.currentReport.role.id}:${$scope.params.groupId}`,
            { stringId: String($scope.params.groupId) }
          );
          break;
        }
        url = groupDetailsService.abusePageUrl('grouproleset', $scope.currentReport.role.id);
        break;
      case $scope.params.reportAbuseTypes.announcements:
        if ($scope.params.policies.EnableCommunityGroupStatus) {
          url = groupDetailsService.abusePageRevampUrl(
            'communitygroupstatus',
            $scope.params.groupId
          );
          break;
        }
        url = groupDetailsService.abusePageUrl('communitygroupstatus', $scope.params.groupId);
        break;
    }
    return url;
  };

  $scope.close = function () {
    $uibModalInstance.dismiss();
  };

  $scope.init = function () {
    $scope.params = modalData;
    $scope.roles = modalData.roles;
    $scope.currentReport = {
      name: modalData.reportAbuseTypes.group,
      role: modalData.roles[0]
    };
  };

  $scope.init();
}

groupModule.controller('reportAbuseController', reportAbuseController);
export default reportAbuseController;
