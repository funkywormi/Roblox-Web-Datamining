import configureGroupModule from '../../configureGroupModule';

function configureGroupMembersListController(
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
  keyCode,
  configureGroupMembersService,
  $uibModal,
  groupResources
) {
  'ngInject';

  const ctrl = this;

  function closePopover() {
    // Click / outsideClick is the best trigger we can come up with for angular
    // bootstrap popover, but what that means is that clicking a menu element that
    // opens a modal leaves the menu open. This sends an outsideClick event to the
    // popover and forces it to close in a safe way, while still leveraging triggers.
    angular.element(document.querySelector('body')).click();
  }

  $scope.membersPager = cursorPaginationService.createPager({
    sortOrder: cursorPaginationService.sortOrder.Desc,
    pageSize: configureGroupConstants.pageSize,
    loadPageSize: configureGroupConstants.loadPageSize,

    getCacheKeyParameters() {
      if (ctrl.isAllRoles()) {
        return {
          groupId: ctrl.group.id
        };
      }
      return {
        groupId: ctrl.group.id,
        roleId: ctrl.currentRoleFilter.id
      };
    },

    getRequestUrl() {
      if (ctrl.isAllRoles()) {
        return $filter('formatString')(configureGroupConstants.urls.groupMembersUrl, {
          groupId: ctrl.group.id
        });
      }
      return $filter('formatString')(groupsConstants.urls.getGroupRoleMembers, {
        groupId: ctrl.group.id,
        roleId: ctrl.currentRoleFilter.id
      });
    },

    loadSuccess(members) {
      if (ctrl.isAllRoles()) {
        ctrl.members = members.map(member => {
          const { user, role } = member;
          let currentUser = user;
          currentUser = configureGroupUtilityService.getNameForDisplay(user);
          return Object.assign(currentUser, { role });
        });
      } else {
        ctrl.members = members.map(member => {
          let currentUser = member;
          currentUser = configureGroupUtilityService.getNameForDisplay(member);
          return Object.assign(currentUser, { role: ctrl.currentRoleFilter });
        });
      }
      ctrl.layout.isLoading = false;
    },

    loadError(errors) {
      ctrl.members = [];
      ctrl.layout.isLoading = false;
      ctrl.failedToLoadMembers = true;
      $log.debug(' ------ getGroupRoleMembers error -------');
    }
  });

  ctrl.buildGroupRolesList = function (groupId) {
    groupsService.getGroupRoles(groupId).then(
      function success(result) {
        if (result.roles && result.roles.length > 1) {
          const { roles } = result;
          // Sort by rank (lowest to highest)
          roles.sort(function (a, b) {
            return a.rank - b.rank;
          });

          ctrl.roles = roles;

          // User can only update rolesets to rolesets with ranks less than their own
          ctrl.configurableRoles = ctrl.roles.filter(role => role.rank < ctrl.group.role.rank);
        }
      },
      function (data) {
        systemFeedbackService.warning(
          languageResource.get(groupsConstants.translations.buildGroupRolesListError)
        );
        $log.debug('--buildGroupRolesList-error---');
      }
    );
  };

  ctrl.canDeleteWallPostOfUser = function (user) {
    return (
      ctrl.group.permissions.groupPostsPermissions.deleteFromWall && ctrl.isHigherRankThanUser(user)
    );
  };

  ctrl.isHigherRankThanUser = function (user) {
    return ctrl.group.role.rank > user.role.rank;
  };

  ctrl.showExileUserModal = function (user, index) {
    closePopover();
    const modalParams = {
      animation: false,
      templateUrl: groupResources.modals.exileUser.templateUrl,
      controller: groupResources.modals.exileUser.controller,
      resolve: {
        modalData: {
          groupId: ctrl.group.id,
          userId: user.userId,
          showDeletePostsCheckbox: ctrl.canDeleteWallPostOfUser(user),
          refreshGroupWall: angular.noop,
          reloadCurrentPage() {
            // Decrement total group members count
            ctrl.group.memberCount = ctrl.group.memberCount - 1;
            // Decrement count for specific role
            const oldRole = ctrl.roles.filter(role => role.id === user.role.id)[0];
            oldRole.memberCount -= 1;
            // Reload page
            $scope.membersPager.removeItemAtIndex(index);
          }
        }
      }
    };
    $uibModal.open(modalParams);
  };

  ctrl.showBanUserModal = function (user, index) {
    closePopover();
    const modalParams = {
      animation: false,
      templateUrl: groupResources.modals.banUser.templateUrl,
      controller: groupResources.modals.banUser.controller,
      resolve: {
        modalData: {
          groupId: ctrl.group.id,
          userId: user.userId,
          showDeletePostsCheckbox: ctrl.canDeleteWallPostOfUser(user),
          refreshGroupWall: angular.noop,
          reloadCurrentPage() {
            // Decrement total group members count
            ctrl.group.memberCount = ctrl.group.memberCount - 1;
            // Reload page
            $scope.membersPager.removeItemAtIndex(index);
          }
        }
      }
    };
    $uibModal.open(modalParams);
  };

  ctrl.updateUserRole = function (user, role, index) {
    if (user.role.id === role.id) {
      // Nothing to do here
      return;
    }

    configureGroupMembersService.updateUserRole(ctrl.group.id, user.userId, role.id).then(
      function (result) {
        // Decrement count for the members previous role
        const oldRole = ctrl.roles.filter(role => role.id === user.role.id)[0];
        oldRole.memberCount -= 1;
        // Increment count for selected role
        role.memberCount += 1;
        // Update role
        user.role = role;

        if (!ctrl.isAllRoles()) {
          // Remove from current page
          $scope.membersPager.removeItemAtIndex(index);
        }
        systemFeedbackService.success(languageResource.get('Message.SuccessfullyUpdatedRole'));
      },
      function (errors) {
        systemFeedbackService.warning(languageResource.get('Message.UnableToUpdateRole'));
      }
    );
  };

  ctrl.profilePageUrl = function (userId) {
    return configureGroupUtilityService.profilePageUrl(userId);
  };

  ctrl.updateRoleFilter = function (currentRoleFilter) {
    // user is filtering by specific roles again, this resets the search
    ctrl.keyword = '';
    ctrl.layout.isSearchResult = false;
    ctrl.layout.memberSearchError = null;
    // Set the new role
    ctrl.currentRoleFilter = currentRoleFilter;
    ctrl.members = [];
    // Load first page
    ctrl.layout.isLoading = true;
    $scope.membersPager.loadFirstPage();
  };

  ctrl.isAllRoles = function () {
    return ctrl.currentRoleFilter.id === configureGroupConstants.filterTerms.all;
  };

  ctrl.getMember = function (username) {
    ctrl.layout.memberSearchError = null;

    if (!username) {
      $scope.membersPager.loadFirstPage();
      ctrl.layout.isSearchResult = false;
      return;
    }

    ctrl.members = [];
    ctrl.layout.isLoading = true;
    ctrl.layout.isSearchResult = true;
    groupsService.getUserIdsFromUsernames([username]).then(
      function (users) {
        if (users.length > 0) {
          const currentUser = configureGroupUtilityService.getNameForDisplay(users[0]);
          const { id: userId, name, nameForDisplay } = currentUser;
          groupsService
            .getUserRoleInGroup(userId, ctrl.group.id)
            .then(
              function (role) {
                if (
                  role != null &&
                  (role.id === ctrl.currentRoleFilter.id ||
                    ctrl.currentRoleFilter.id === configureGroupConstants.filterTerms.all)
                ) {
                  ctrl.members = [
                    {
                      userId,
                      username: name,
                      role,
                      nameForDisplay
                    }
                  ];
                } else if (role == null) {
                  ctrl.layout.memberSearchError = languageResource.get(
                    'Message.TargetUserNotInGroup'
                  );
                } else {
                  ctrl.layout.memberSearchError = languageResource.get('Message.MemberNotFound');
                }
              },
              function (error) {
                ctrl.layout.memberSearchError = error;
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
    ctrl.allRolesFilter = {
      id: configureGroupConstants.filterTerms.all,
      name: languageResource.get('Label.All')
    };
    ctrl.updateRoleFilter(ctrl.allRolesFilter);

    ctrl.buildGroupRolesList(ctrl.group.id);
  };

  ctrl.$onInit = init;
}

configureGroupModule.controller(
  'configureGroupMembersListController',
  configureGroupMembersListController
);
export default configureGroupMembersListController;
