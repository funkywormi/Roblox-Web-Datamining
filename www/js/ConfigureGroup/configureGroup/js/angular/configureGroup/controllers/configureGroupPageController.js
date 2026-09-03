import { ConfigureGroupV2Service, CurrentUser, DeviceMeta } from 'Roblox';
import { initRobloxBadgesFrameworkAgnostic } from 'roblox-badges';
import { JOIN_REQUESTS_CHANGED_EVENT } from '../../../../ts/react/shared/constants/joinRequestsConstants';
import configureGroupModule from '../configureGroupModule';

function configureGroupPageController(
  configureGroupConstants,
  groupsService,
  configureGroupService,
  configureGroupUtilityService,
  $log,
  languageResource,
  $location,
  $scope,
  $q,
  groupsConstants,
  groupMembershipService,
  $state,
  groupUtilityService,
  $window
) {
  'ngInject';

  const ctrl = this;

  ctrl.doesGroupHaveOwner = function () {
    return ctrl.group.owner && ctrl.group.owner.userId > 0;
  };

  ctrl.displayGroupFunds = function () {
    return (
      ctrl.group.permissions &&
      ctrl.group.permissions.groupEconomyPermissions &&
      ctrl.group.permissions.groupEconomyPermissions.spendGroupFunds
    );
  };

  ctrl.profilePageUrl = function (userId) {
    return configureGroupUtilityService.profilePageUrl(userId);
  };

  ctrl.loadGroup = function (groupId) {
    return groupsService.getGroup(groupId).then(
      function (result) {
        if (result) {
          ctrl.group.description = result.description;
          ctrl.group.memberCount = result.memberCount;
          ctrl.group.name = result.name;
          ctrl.group.owner = result.owner;
          if (CurrentUser.isAuthenticated && result.owner?.userId === Number(CurrentUser.userId)) {
            ConfigureGroupV2Service?.initializeUnificationOptInModal(ctrl.group.id);
          }
          ctrl.detailsPageUrl = configureGroupUtilityService.groupDetailsPageUrl(
            ctrl.group.id,
            result.name
          );

          try {
            initRobloxBadgesFrameworkAgnostic({
              overrideIconClass: 'verified-badge-configure-group'
            });
          } catch (e) {
            // noop
          }

          // Settings returned from getGroup endpoint are named differently than settings
          // returned from getSettings endpoint
          ctrl.group[
            configureGroupConstants.groupSettings.approvalRequired
          ] = !result.publicEntryAllowed;
        }
      },
      function (data) {
        ctrl.layout.pageError = languageResource.get(groupsConstants.translations.loadGroupError);
        $log.debug('--loadGroup-error---');
        try {
          // Redirect to Search page if group is invalid/not found
          if (data.errors[0].code === groupsConstants.errorCodes.groupErrors.invalidGroup) {
            groupUtilityService.redirectToPage(groupsConstants.absoluteUrls.moreGroups);
          }
        } catch (e) {
          // noop
        }
      }
    );
  };

  ctrl.loadGroupMembership = function (groupId) {
    return $q(function (resolve, reject) {
      groupMembershipService.getGroupMembership(groupId).then(
        function (result) {
          if (result) {
            if (result.userRole) {
              ctrl.group.role = result.userRole.role;
            }

            if (result.permissions) {
              ctrl.group.permissions = result.permissions;
            }

            if (result.channelPermissions) {
              ctrl.group.channelPermissions = result.channelPermissions;
            }

            ctrl.group[configureGroupConstants.groupSettings.groupFundsVisible] =
              result.areGroupFundsVisible;
            ctrl.group[configureGroupConstants.groupSettings.enemiesAllowed] =
              result.areEnemiesAllowed;
            ctrl.group[configureGroupConstants.groupSettings.groupGamesVisible] =
              result.areGroupGamesVisible;

            if (result.canConfigure !== true) {
              groupUtilityService.redirectToPage(groupsConstants.absoluteUrls.forbidden);
            }
          }
          resolve(result);
        },
        function (data) {
          ctrl.layout.pageError = languageResource.get(
            groupsConstants.translations.loadGroupMembershipError
          );
          $log.debug('--loadGroupMembership-error---');
          reject(data);
        }
      );
    });
  };

  ctrl.loadConfigurationMetadata = function () {
    return $q(function (resolve, reject) {
      groupsService.getGroupConfigurationMetadata().then(
        function (result) {
          if (result) {
            ctrl.metadata = result;
          }
          ctrl.metadata.isPhone = DeviceMeta && DeviceMeta().isPhone;
          ctrl.metadata.isApp = DeviceMeta && DeviceMeta().isInApp;
          resolve(result);
        },
        function (data) {
          ctrl.layout.pageError = languageResource.get(
            groupsConstants.translations.loadGroupConfigMetadataError
          );
          $log.debug('--loadConfigurationMetadata-error---');
          reject(data);
        }
      );
    });
  };

  ctrl.loadGroupCurrency = function () {
    return $q(function (resolve, reject) {
      if (!ctrl.displayGroupFunds()) {
        resolve();
      }

      groupsService.getGroupCurrency(ctrl.group.id).then(
        function (groupFunds) {
          ctrl.groupFunds = groupFunds;
          resolve(groupFunds);
        },
        function (data) {
          $log.debug('--loadGroupCurrency-error---');
          reject(data);
        }
      );
    });
  };

  ctrl.loadReactAuditLogFlag = function () {
    groupsService.getGroupProductFeatures(ctrl.group.id).then(
      function (features) {
        ctrl.policies.isReactAuditLogEnabled = features?.ReactGroupAuditLog === true;
      },
      function () {
        ctrl.policies.isReactAuditLogEnabled = false;
      }
    );
  };

  ctrl.loadConfigureGroupPolicies = function () {
    ctrl.policies = {};
    if (ctrl.metadata.isDefaultEmblemPolicyEnabled) {
      groupsService.getConfigureGroupRules().then(
        function (response) {
          ctrl.policies = response;
          ctrl.loadReactAuditLogFlag();
        },
        function (err) {
          $log.debug('--loadConfigureGroupPolicies-error---', err);
        }
      );
    } else {
      Object.keys(configureGroupConstants.policies).forEach(item => {
        ctrl.policies[item] = true;
      });
      ctrl.loadReactAuditLogFlag();
    }
  };

  const updateState = function (toState) {
    if (
      ctrl.menuOptionNameValidity[toState.menuOption.name] &&
      (!toState.submenuOption || ctrl.submenuOptionNameValidity[toState.submenuOption.name])
    ) {
      ctrl.currentMenuOption = toState.menuOption;
      ctrl.currentSubmenuOption = toState.submenuOption;
    } else {
      // If we are attempting to access an invalid state, show default page
      ctrl.currentMenuOption = ctrl.menuOptions[0];
      ctrl.currentSubmenuOption = ctrl.submenuOptions ? ctrl.submenuOptions[0] : undefined;
      $location.path(ctrl.currentMenuOption.name).replace();
    }
  };

  $scope.$on('$stateChangeSuccess', function (event, toState) {
    if (ctrl.menuOptions) {
      updateState(toState);
    } else {
      // Need to set up the menu
      configureGroupService.loadGroupMenuOptions(ctrl.group.id).then(
        function (result) {
          ctrl.menuOptions = result.menuOptions;
          ctrl.menuOptionNameValidity = result.menuOptionNameValidity;
          ctrl.submenuOptionNameValidity = result.submenuOptionNameValidity;
          updateState(toState);
        },
        function (error) {
          $log.debug('Unable to build menu');
        }
      );
    }
  });

  ctrl.loadEconomyMetadata = () => {
    configureGroupService.getEconomyMetadata().then(data => {
      ctrl.economyMetadata = data;
    });
  };

  const onJoinRequestsChanged = function (event) {
    const eventGroupId = event && event.detail && event.detail.groupId;
    if (!ctrl.menuOptions || !ctrl.group || eventGroupId !== ctrl.group.id) {
      return;
    }
    configureGroupService.refreshPendingJoinRequestSummary(ctrl.group.id).then(function (summary) {
      const membersOption = ctrl.menuOptions.find(
        option => option.name === configureGroupConstants.menuOptionNames.members
      );
      if (!membersOption) {
        return;
      }
      if (summary && summary.showPill) {
        membersOption.pendingJoinRequestCount = summary.count;
        membersOption.pendingJoinRequestCountText = summary.displayText;
      } else {
        membersOption.pendingJoinRequestCount = 0;
        membersOption.pendingJoinRequestCountText = '';
      }
    });
  };

  $window.addEventListener(JOIN_REQUESTS_CHANGED_EVENT, onJoinRequestsChanged);
  $scope.$on('$destroy', function () {
    $window.removeEventListener(JOIN_REQUESTS_CHANGED_EVENT, onJoinRequestsChanged);
  });

  const init = function () {
    groupUtilityService.redirectToCommunitiesIfNecessary();
    ctrl.group = {
      id: configureGroupUtilityService.parseGroupId($location.absUrl())
    };

    ctrl.layout = {};

    ctrl.menuOptionNames = configureGroupConstants.menuOptionNames;
    ctrl.submenuOptionNames = configureGroupConstants.submenuOptionNames;

    ctrl.relationshipTypes = groupsConstants.relationshipTypes;

    ctrl.loadGroup(ctrl.group.id);
    const membershipPromise = ctrl.loadGroupMembership(ctrl.group.id);
    const metadataPromise = ctrl.loadConfigurationMetadata();
    const economyMetadataPromise = ctrl.loadEconomyMetadata();

    $q.all([membershipPromise, metadataPromise, economyMetadataPromise]).then(
      function () {
        ctrl.layout.isLoadFinished = true;
        ctrl.loadGroupCurrency();
        ctrl.loadConfigureGroupPolicies();

        // Force state refresh to avoid race condition where $stateChangeSuccess won't fire
        if ($state.current.name) {
          $state.go($state.current.name, { success: true }, { reload: true });
        }

        // Set title dynamically, since web apps can't have a dynamic title
        groupUtilityService.setPageTitle(
          languageResource.get(configureGroupConstants.translations.configureCommunityHeading, {
            groupName: ctrl.group.name
          }),
          document
        );
      },
      function () {
        $log.debug('--error waiting for membershipPromise and metadataPromise---');
      }
    );
  };

  ctrl.$onInit = init;
}

configureGroupModule.controller('configureGroupPageController', configureGroupPageController);
export default configureGroupPageController;
