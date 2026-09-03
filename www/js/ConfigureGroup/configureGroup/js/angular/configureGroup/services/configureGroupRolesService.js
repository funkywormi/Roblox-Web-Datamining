import configureGroupModule from '../configureGroupModule';

function configureGroupRolesService(httpService, configureGroupConstants, $filter, $q) {
    "ngInject";

    return {
        createRole: function (groupId, name, description, rank, usingGroupFunds = false) {
            var urlConfig = {
                url: $filter("formatString")(configureGroupConstants.urls.createGroupRoleUrl, { groupId: groupId })
            };

            var request = {
                name: name,
                description: description,
                rank: rank,
                usingGroupFunds: usingGroupFunds
            };

            return httpService.httpPost(urlConfig, request);
        },

        updateRole: function (groupId, roleId, name, description, rank) {
            var urlConfig = {
                url: $filter("formatString")(configureGroupConstants.urls.updateGroupRoleUrl, { groupId: groupId, roleId: roleId })
            };

            var request = {
                name: name,
                description: description,
                rank: rank
            };

            return httpService.httpPatch(urlConfig, request);
        },

        deleteRole: function (groupId, roleId) {
            var urlConfig = {
                url: $filter("formatString")(configureGroupConstants.urls.deleteGroupRoleUrl, { groupId: groupId, roleId: roleId })
            };

            return httpService.httpDelete(urlConfig);
        },

        updateGroupRolePermissions: function (groupId, roleSetId, updatePermissionsRequest) {
            var config = {
                url: $filter("formatString")(configureGroupConstants.urls.updateGroupRolePermissions, { groupId: groupId, roleSetId: roleSetId })
            };

            return httpService.httpPatch(config, updatePermissionsRequest);
        },
        
        getAllGroupRolePermissions: function (groupId) {
            var config = {
                url: $filter("formatString")(configureGroupConstants.urls.getAllGroupRolePermissions, { groupId: groupId })
            };
            
            return httpService.httpGet(config);
        }
    }
}

configureGroupModule.factory("configureGroupRolesService", configureGroupRolesService);

export default configureGroupRolesService;
