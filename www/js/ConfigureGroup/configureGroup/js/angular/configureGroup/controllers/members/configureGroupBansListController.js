import configureGroupModule from '../../configureGroupModule';

function configureGroupBansListController(
  $scope,
  groupsService,
  configureGroupConstants,
  $log,
  $filter,
  cursorPaginationService,
  languageResource,
  configureGroupUtilityService,
  groupsConstants,
  systemFeedbackService,
  keyCode
) {
  'ngInject';

  const ctrl = this;

  $scope.membersPager = cursorPaginationService.createPager({
    sortOrder: cursorPaginationService.sortOrder.Desc,
    pageSize: configureGroupConstants.pageSize,
    loadPageSize: configureGroupConstants.loadPageSize,

    getCacheKeyParameters() {
      return {
        groupId: ctrl.group.id
      };
    },

    getRequestUrl() {
      return $filter('formatString')(groupsConstants.urls.getGroupBans, {
        groupId: ctrl.group.id
      });
    },

    loadSuccess(groupBans) {
      ctrl.groupBans = groupBans;
      ctrl.layout.isLoading = false;
    },

    loadError(errors) {
      ctrl.groupBans = [];
      ctrl.layout.isLoading = false;
      ctrl.failedToLoadMembers = true;
      $log.debug(' ------ GetGroupBans error -------');
    }
  });

  ctrl.isHigherRankThanUser = function (user) {
    return ctrl.group.role.rank > user.role.rank;
  };

  ctrl.profilePageUrl = function (userId) {
    return configureGroupUtilityService.profilePageUrl(userId);
  };

  ctrl.getGroupBan = function (username) {
    ctrl.layout.memberSearchError = null;

    if (!username) {
      $scope.membersPager.loadFirstPage();
      ctrl.layout.isSearchResult = false;
      return;
    }

    ctrl.groupBans = [];
    ctrl.layout.isLoading = true;
    ctrl.layout.isSearchResult = true;

    groupsService.getUserIdsFromUsernames([username]).then(
      function (users) {
        if (users.length > 0) {
          const userId = users[0].id;

          groupsService
            .fetchUserGroupBan(ctrl.group.id, userId)
            .then(
              function (groupBan) {
                if (groupBan != null) {
                  ctrl.groupBans = [groupBan];
                } else {
                  ctrl.layout.memberSearchError = languageResource.get(
                    'Message.TargetUserNotGroupBanned'
                  );
                }
              },
              function (error) {
                ctrl.layout.memberSearchError = languageResource.get('Message.BuildBanListError');
              }
            )
            .finally(function () {
              ctrl.layout.isLoading = false;
            });
        } else {
          ctrl.layout.memberSearchError = languageResource.get('Message.InvalidUser');
          ctrl.layout.isLoading = false;
        }
      },
      function () {
        ctrl.layout.isLoading = false;
      }
    );
  };

  const init = function () {
    ctrl.layout = {
      isLoading: true,
      isSearchResult: false
    };

    ctrl.keyCodes = keyCode;
    ctrl.keyword = '';

    $scope.membersPager.loadFirstPage();
  };

  ctrl.$onInit = init;
}

configureGroupModule.controller(
  'configureGroupBansListController',
  configureGroupBansListController
);
export default configureGroupBansListController;
