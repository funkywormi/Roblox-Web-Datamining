import { EnvironmentUrls } from 'Roblox';
import configureGroupModule from '../configureGroupModule';

function configureGroupRoleSettingsController(
  $log,
  $filter,
  $window,
  groupsService,
  configureGroupUtilityService,
  configureGroupRolesService,
  configureGroupConstants,
  systemFeedbackService,
  modalService,
  languageResource
) {
  'ngInject';

  const ctrl = this;

  ctrl.getCreatorHubGroupRolesUrl = function () {
    if (!ctrl.group || !ctrl.group.id) {
      return '';
    }
    return `https://create.${EnvironmentUrls.domain}/dashboard/group/roles?groupId=${ctrl.group.id}&activeTab=GroupRolesTab`;
  };

  ctrl.showDeleteRoleModal = function () {
    const deleteRoleModal = modalService.open({
      titleText: languageResource.get('Action.DeleteRole'),
      bodyHtmlUnsafe: $filter('escapeHtml')(
        languageResource.get('Message.DeleteRoleset', { role: ctrl.groupRole.name })
      ),
      actionButtonShow: true,
      actionButtonText: languageResource.get('Action.Delete'),
      neutralButtonText: languageResource.get('Action.Cancel')
    });

    deleteRoleModal.result.then(function () {
      configureGroupRolesService.deleteRole(ctrl.group.id, ctrl.groupRole.id).then(
        function success(result) {
          systemFeedbackService.success(languageResource.get('Message.RoleDeleteSuccess'));
          ctrl.deleteRole();
        },
        function (data) {
          systemFeedbackService.warning(languageResource.get('Message.RoleDeleteFail'));
          $log.debug('--buildGroupRolesList-error---');
        }
      );
    });
  };

  ctrl.updateRole = function () {
    configureGroupRolesService
      .updateRole(
        ctrl.group.id,
        ctrl.groupRole.id,
        ctrl.data.newName,
        ctrl.data.newDescription,
        ctrl.data.newRank
      )
      .then(
        function success(result) {
          systemFeedbackService.success(languageResource.get('Message.RoleUpdateSuccess'));

          // Take advantage of two way binding and set values on actual role object
          ctrl.groupRole.name = ctrl.data.newName;
          ctrl.groupRole.description = result.description;
          ctrl.groupRole.rank = ctrl.data.newRank;

          ctrl.setupRoleData();
        },
        function (data) {
          systemFeedbackService.warning(languageResource.get('Message.RoleUpdateFail'));
          $log.debug('--buildGroupRolesList-error---');
        }
      );
  };

  ctrl.togglePermissionValue = function (permissionCategory, permissionName) {
    if (ctrl.isImmutablePermission(permissionCategory, permissionName)) {
      return;
    }

    ctrl.permissions[permissionCategory][permissionName] = !ctrl.permissions[permissionCategory][
      permissionName
    ];
    const value = ctrl.permissions[permissionCategory][permissionName];
    const permissions = {};
    permissions[permissionName] = value;
    const updatePermissionsRequest = { permissions };

    configureGroupRolesService
      .updateGroupRolePermissions(ctrl.group.id, ctrl.groupRole.id, updatePermissionsRequest)
      .then(
        function (result) {
          systemFeedbackService.success(languageResource.get('Message.PermissionUpdateSuccess'));
        },
        function (data) {
          $log.debug('--updateGroupRoleSetPermissions-error---');
          ctrl.permissions[permissionCategory][permissionName] = !ctrl.permissions[
            permissionCategory
          ][permissionName];
          systemFeedbackService.warning(languageResource.get('Message.PermissionUpdateFail'));
        }
      );
  };

  ctrl.isImmutablePermission = function (permissionCategory, permissionName) {
    if (!ctrl.layout.isOwner) {
      return true;
    }

    if (ctrl.layout.isOwnerRole) {
      return true;
    }

    if (ctrl.layout.isGuestRole) {
      if (configureGroupConstants.permissions.guestPermissions[permissionName]) {
        return false;
      }
      if (!ctrl.permissions[permissionCategory][permissionName]) {
        // Allow users to turn off settings that were turned on before guest permissions were limited
        return true;
      }
    }
    return false;
  };

  ctrl.isHiddenPermission = function (permissionName) {
    if (configureGroupConstants.permissions.deprecatedPermissions[permissionName]) {
      return true;
    }

    return false;
  };

  // Returns true if a translation exists for the given permission key
  ctrl.hasTranslation = function (permissionName) {
    const translationKey =
      ctrl.roleSettingsTranslations && ctrl.roleSettingsTranslations[permissionName];
    if (!translationKey) {
      return false;
    }
    // languageResource.get returns empty string when missing
    return !!languageResource.get(translationKey);
  };

  ctrl.togglePermissionCategory = function (permissionType) {
    configureGroupUtilityService.permissionCategoryToggleUtility.showPermissionType[
      permissionType
    ] = !configureGroupUtilityService.permissionCategoryToggleUtility.showPermissionType[
      permissionType
    ];
  };

  ctrl.permissionCategoryToggleLabel = function (permissionType) {
    return configureGroupUtilityService.permissionCategoryToggleUtility.showPermissionType[
      permissionType
    ]
      ? languageResource.get(
          configureGroupUtilityService.permissionCategoryToggleUtility.nameOfOpen
        )
      : languageResource.get(
          configureGroupUtilityService.permissionCategoryToggleUtility.nameOfClose
        );
  };

  ctrl.isPermissionCategoryShown = function (permissionType) {
    return !configureGroupUtilityService.permissionCategoryToggleUtility.showPermissionType[
      permissionType
    ];
  };

  ctrl.rankHasError = function () {
    if (ctrl.layout.isGuestRole || ctrl.layout.isOwnerRole) {
      return false;
    }

    if (ctrl.data.newRank === null) {
      ctrl.layout.rankError = 'The rank field cannot be empty';
      return true;
    }

    if (ctrl.data.newRank === undefined) {
      ctrl.layout.rankError = 'The value you have entered is invalid';
      return true;
    }

    if (
      ctrl.data.newRank === ctrl.metadata.roleConfiguration.minRank ||
      ctrl.data.newRank === ctrl.metadata.roleConfiguration.maxRank
    ) {
      ctrl.layout.rankError = languageResource.get('Message.RankReserved', {
        minRankPlusOne: ctrl.metadata.roleConfiguration.minRank + 1,
        maxRankMinusOne: ctrl.metadata.roleConfiguration.maxRank - 1,
        minRank: ctrl.metadata.roleConfiguration.minRank,
        maxRank: ctrl.metadata.roleConfiguration.maxRank
      });
      return true;
    }

    return false;
  };

  ctrl.isSaveButtonDisabled = function () {
    return !ctrl.data.newName || ctrl.rankHasError() || ctrl.layout.isGuestRole;
  };

  ctrl.isNameFieldDisabled = function () {
    return !ctrl.layout.isOwner || ctrl.layout.isGuestRole;
  };

  ctrl.isDescriptionFieldDisabled = function () {
    return !ctrl.layout.isOwner || ctrl.layout.isGuestRole;
  };

  ctrl.isRankFieldDisabled = function () {
    return (
      !ctrl.layout.isOwner ||
      ctrl.layout.isOwnerRole ||
      ctrl.layout.isGuestRole ||
      ctrl.layout.isBaseMemberRole
    );
  };

  ctrl.showSaveButton = function () {
    return ctrl.layout.isOwner;
  };

  ctrl.showDeleteRole = function () {
    return (
      ctrl.layout.isOwner &&
      !(ctrl.layout.isOwnerRole || ctrl.layout.isGuestRole || ctrl.layout.isBaseMemberRole)
    );
  };

  ctrl.canDeleteRole = function () {
    return ctrl.groupRole.memberCount === 0;
  };

  ctrl.setupRoleData = function () {
    ctrl.data = {
      newName: ctrl.groupRole.name,
      newDescription: ctrl.groupRole.description,
      newRank: ctrl.groupRole.rank
    };
  };

  ctrl.setupRoleSettingsTranslations = function () {
    ctrl.roleSettingsTranslations = { ...configureGroupConstants.roleSettings };
  };

  ctrl.goToForumConfiguration = function () {
    $window.location.hash = '#!/forums';
  };

  const init = function () {
    ctrl.setupRoleSettingsTranslations();
    ctrl.setupRoleData();

    ctrl.layout = {
      isGuestRole: ctrl.groupRole.rank === ctrl.metadata.roleConfiguration.minRank,
      isOwnerRole: ctrl.groupRole.rank === ctrl.metadata.roleConfiguration.maxRank,
      isBaseMemberRole: ctrl.groupRole.isBase,
      isOwner: ctrl.group.role.rank === ctrl.metadata.roleConfiguration.maxRank
    };

    ctrl.updateGroupRolePermissionsRequest = { permissions: {} };
  };

  ctrl.$onInit = init;
}

configureGroupModule.controller(
  'configureGroupRoleSettingsController',
  configureGroupRoleSettingsController
);
export default configureGroupRoleSettingsController;
