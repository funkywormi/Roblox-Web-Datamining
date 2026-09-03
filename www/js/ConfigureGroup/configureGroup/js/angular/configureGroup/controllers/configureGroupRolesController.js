import { EnvironmentUrls } from 'Roblox';
import configureGroupModule from '../configureGroupModule';

function configureGroupRolesController(
  groupsService,
  $log,
  languageResource,
  groupsConstants,
  configureGroupRolesService,
  $uibModal
) {
  'ngInject';

  const ctrl = this;

  ctrl.getCreatorHubGroupRolesUrl = function () {
    if (!ctrl.group || !ctrl.group.id) {
      return '';
    }
    return `https://create.${EnvironmentUrls.domain}/dashboard/group/roles?groupId=${ctrl.group.id}&activeTab=GroupRolesTab`;
  };

  ctrl.showCreateRoleModal = function () {
    const modalParams = {
      animation: false,
      templateUrl: 'create-role-modal',
      controller: 'createRoleModalController',
      resolve: {
        modalData: {
          groupId: ctrl.group.id,
          metadata: ctrl.metadata,
          addRole(newRole) {
            groupsService
              .getGroupRolePermissions(ctrl.group.id, newRole.id)
              .then(function success(result) {
                if (result.role && typeof result.role.memberCount === 'undefined') {
                  result.role.memberCount = 0;
                }

                ctrl.roles.push(result);
                ctrl.activateRole(result.role);
                ctrl.reloadGroupFunds();
              });
          }
        }
      }
    };

    $uibModal.open(modalParams);
  };

  ctrl.canCreateRole = function () {
    return ctrl.roles.length < ctrl.metadata.roleConfiguration.limit;
  };

  ctrl.activateRole = function (role) {
    ctrl.activeRole.isActive = false;
    role.isActive = true;
    ctrl.activeRole = role;
  };

  ctrl.deleteRoleAtIndex = function (index) {
    // This will delete the active role
    if (
      ctrl.activeRole.rank === ctrl.metadata.roleConfiguration.maxRank ||
      ctrl.activeRole.rank === ctrl.metadata.roleConfiguration.minRank
    ) {
      // Should never get here, owner and guest are undeletable
      return;
    }
    ctrl.activeRole = ctrl.roles[index - 1].role;
    ctrl.activeRole.isActive = true;
    ctrl.roles.splice(index, 1);
  };

  ctrl.buildGroupRolesList = function () {
    configureGroupRolesService.getAllGroupRolePermissions(ctrl.group.id).then(
      function success(result) {
        if (result.data && result.data.length > 1) {
          const roles = result.data;
          // Sort by rank (lowest to highest)
          roles.sort(function (a, b) {
            if (a.role.rank === b.role.rank) {
              return b.role.id - a.role.id;
            }
            return b.role.rank - a.role.rank;
          });
          ctrl.activeRole = roles[0].role;
          ctrl.activeRole.isActive = true;
          ctrl.roles = roles;
        }
      },
      function (data) {
        ctrl.layout.rolesError = languageResource.get(
          groupsConstants.translations.buildGroupRolesListError
        );
        $log.debug('--buildGroupRolesList-error---');
      }
    );
  };

  const init = function () {
    ctrl.layout = {
      isOwner: ctrl.group.role.rank === ctrl.metadata.roleConfiguration.maxRank
    };

    ctrl.permissionsConfig = {};

    ctrl.buildGroupRolesList();
  };

  ctrl.$onInit = init;
}

configureGroupModule.controller('configureGroupRolesController', configureGroupRolesController);
export default configureGroupRolesController;
