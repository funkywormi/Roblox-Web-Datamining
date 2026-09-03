import { EnvironmentUrls } from 'Roblox';
import { initRobloxBadgesFrameworkAgnostic } from 'roblox-badges';
import configureGroupModule from '../../configureGroupModule';

function configureGroupMemberCardController(
  thumbnailConstants,
  configureGroupUtilityService,
  groupsService,
  $uibModal,
  configureGroupMembersService,
  systemFeedbackService,
  languageResource,
  $log
) {
  'ngInject';

  const ctrl = this;

  ctrl.canExileUser = function () {
    return (
      ctrl.group.permissions.groupMembershipPermissions.removeMembers && ctrl.isHigherRankThanUser()
    );
  };

  ctrl.canBanUser = function () {
    return (
      ctrl.group.permissions.groupMembershipPermissions.banMembers &&
      ctrl.policies.displayGroupBans &&
      ctrl.isHigherRankThanUser()
    );
  };

  ctrl.canModerateUser = function () {
    return ctrl.canExileUser() || ctrl.canBanUser();
  };

  ctrl.canChangeRankOfUser = function () {
    return (
      ctrl.group.permissions.groupMembershipPermissions.changeRank && ctrl.isHigherRankThanUser()
    );
  };

  ctrl.isHigherRankThanUser = function () {
    return ctrl.group.role.rank > ctrl.member.role.rank;
  };

  ctrl.profilePageUrl = function () {
    return configureGroupUtilityService.profilePageUrl(ctrl.member.userId);
  };

  ctrl.loadConfigureGroupPolicies = function () {
    if (ctrl.policies.length > 0) {
      return;
    }

    groupsService.getConfigureGroupRules().then(
      response => {
        ctrl.policies = response;
      },
      () => {
        $log.debug('--loadConfigureGroupPolicies-error---');
      }
    );
  };

  ctrl.showChangeUserDialog = async function (user, role) {
    if (user.role.rank <= role.rank) {
      return false;
    }

    try {
      const organization = await configureGroupMembersService.getOrganization(ctrl.group.id);
      const orgRoles = await configureGroupMembersService.getOrgRoles(organization.id, user.userId);
      const rolePermissionsList = await Promise.all(
        orgRoles.roles.map(orgRole =>
          configureGroupMembersService.getRolePermissions(organization.id, orgRole)
        )
      );
      for (const rolePermissions of rolePermissionsList) {
        if (Object.values(rolePermissions.permissions).some(p => p.isGranted)) {
          return true;
        }
      }

      return false;
    } catch {
      return true;
    }
  };

  const getCreatorHubGroupRolesUrl = groupId =>
    `https://create.${EnvironmentUrls.domain}/dashboard/group/roles?groupId=${groupId}&activeTab=GroupRolesTab`;

  ctrl.clickUpdateUserRole = async function (user, role, index) {
    if (await ctrl.showChangeUserDialog(user, role)) {
      const modalParams = {
        animation: false,
        templateUrl: 'change-role-modal',
        controller: 'changeRoleModalController',
        resolve: {
          modalData: {
            user,
            newRole: role,
            groupId: ctrl.group.id,
            index,
            updateUserRole: ctrl.updateUserRole,
            creatorHubGroupRolesUrl: getCreatorHubGroupRolesUrl(ctrl.group.id)
          }
        }
      };
      $uibModal.open(modalParams);
    } else {
      ctrl.updateUserRole(ctrl.member, role, ctrl.index);
    }
  };

  ctrl.setup = function () {
    ctrl.isOwner = ctrl.member.role.rank === ctrl.metadata.roleConfiguration.maxRank;
    ctrl.thumbnailTypes = thumbnailConstants.thumbnailTypes;
    ctrl.memberProfileUrl = ctrl.profilePageUrl();
    ctrl.policies = {};

    ctrl.loadConfigureGroupPolicies();

    try {
      initRobloxBadgesFrameworkAgnostic({
        overrideIconClass: 'verified-badge-icon-member-card'
      });
    } catch (e) {
      // noop
    }
  };

  const init = function () {
    ctrl.setup();
  };

  ctrl.$onInit = init;
}

configureGroupModule.controller(
  'configureGroupMemberCardController',
  configureGroupMemberCardController
);

export default configureGroupMemberCardController;
