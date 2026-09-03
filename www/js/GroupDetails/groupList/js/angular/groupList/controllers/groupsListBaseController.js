import { CurrentUser } from 'Roblox';
import groupListModule from '../groupListModule';

function groupsListBaseController(
  $scope,
  $q,
  groupsListService,
  groupsService,
  $log,
  groupsListConstants,
  groupsConstants,
  groupExperimentsService,
  groupEventLoggingService,
  eventConstants
) {
  'ngInject';

  $scope.data = {
    moreGroupsUrl: groupsConstants.absoluteUrls.moreGroups
  };

  $scope.createGroupUrl = function () {
    return groupsConstants.absoluteUrls.createGroup;
  };

  $scope.handleCreateGroupClick = () => {
    groupEventLoggingService.logGroupPageClickEvent({
      clickTargetType: 'createGroup',
      context: eventConstants.EventContext.MyGroups
    });
    window.location.href = $scope.createGroupUrl();
  };

  $scope.canCreateGroup = function () {
    return !$scope.groups || $scope.metadata.currentGroupCount < $scope.metadata.groupLimit;
  };

  $scope.loadGroups = function () {
    return $q(function (resolve, reject) {
      groupsListService.getGroups($scope.userId).then(
        function (result) {
          if (result) {
            $scope.groups = result;
          }
          resolve(result);
        },
        function (data) {
          $scope.groups = [];
          $scope.layout.loadFailure = true;
          $log.debug('--loadGroups-error---');
          reject(data);
        }
      );
    });
  };

  $scope.loadGroupMetadata = function () {
    return $q(function (resolve, reject) {
      groupsService.getGroupMetadata().then(
        function (result) {
          $scope.metadata = result;
          resolve(result);
        },
        function (data) {
          // Don't need to consider this a load failure, list is functional without
          $log.debug('--loadGroupMetadata-error---');
          reject(data);
        }
      );
    });
  };

  $scope.updateDisplay = function (showGrid) {
    $scope.layout.isGridOn = showGrid;
    groupsListService.lazyImageRefresh();
  };

  function initVariables() {
    $scope.layout = groupsListConstants.layout;

    ($scope.layout.isGridOn = false), ($scope.layout.areProfileGroupsHidden = true);

    $scope.metadata = {};
    $scope.userId = $scope.displayUserId || CurrentUser.userId;
  }

  $scope.fetchAndExposeExperiment = async () => {
    const response = await groupExperimentsService.getLandingPageExperiment();
    $scope.isV2 = response.isSearchV2;

    groupExperimentsService.exposeLandingPageExperiment();
  };

  $scope.logPageExposure = () => {
    groupEventLoggingService.logGroupPageExposureEvent({
      exposureType: eventConstants.ExposureType.MyGroups,
      context: eventConstants.EventContext.MyGroups
    });
  };

  $scope.loadGroupsListRedesignExperiment = async () => {
    const isEnabled = await groupExperimentsService.isGroupsListRedesignExperimentEnabled();
    $scope.isGroupsListRedesignEnabled = Boolean(isEnabled);
  };

  $scope.loadGroupsList = function () {
    initVariables();
    $scope.layout.isLoading = true;

    const metadataPromise = $scope.loadGroupMetadata();
    const groupsPromise = $scope.loadGroups();
    const fetchAndExposeExperimentPromise = $scope.fetchAndExposeExperiment();
    const loadGroupsListRedesignExperimentPromise = $scope.loadGroupsListRedesignExperiment();

    $q.all([
      metadataPromise,
      groupsPromise,
      fetchAndExposeExperimentPromise,
      loadGroupsListRedesignExperimentPromise
    ])
      .then(
        function () {
          $scope.logPageExposure();
        },
        function () {
          $log.debug('--error waiting for metadataPromise and groupsPromise---');
        }
      )
      .finally(function () {
        $scope.layout.isLoading = false;
      });
  };

  $scope.loadGroupsList();
}

groupListModule.controller('groupsListBaseController', groupsListBaseController);
export default groupsListBaseController;
