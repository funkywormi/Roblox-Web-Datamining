import configureGroupModule from '../configureGroupModule';

function configureGroupMembersService(httpService, configureGroupConstants, $filter, groupsConstants) {
    "ngInject";

    function memberRequestUrl(groupId, userId) {
        return $filter("formatString")(configureGroupConstants.urls.groupMemberRequestUrl, { groupId: groupId, userId: userId });
    }

    function memberRequestsUrl(groupId) {
        return $filter("formatString")(configureGroupConstants.urls.groupMemberRequestsUrl, { groupId: groupId });
    }

    function orgRolesUrl(organizationId, userId) {
      return $filter("formatString")(configureGroupConstants.urls.getUserOrgRolesUrl, {
        organizationId,
        userId
      });
    }

    function rolePermissionsUrl(organizationId, roleId) {
      return $filter("formatString")(configureGroupConstants.urls.getRolePermissionsUrl, {
        organizationId,
        roleId
      });
    }

    return {
        updateUserRole: function (groupId, userId, roleId) {
            var config = {
                url: $filter("formatString")(groupsConstants.urls.updateUserRole, { groupId: groupId, userId: userId })
            };

            var params = {
                roleId: roleId
            };

            return httpService.httpPatch(config, params);
        },

        acceptMemberRequests: function (groupId, userIds) {
            var config = {
                url: memberRequestsUrl(groupId)
            };

            var params = {
                userIds: userIds
            };

            return httpService.httpPost(config, params);
        },

        ignoreMemberRequests: function (groupId, userIds) {
            var config = {
                url: memberRequestsUrl(groupId),
                headers: {
                    "Content-Type": "application/json"
                }
            }

            var params = {
                userIds: userIds
            };

            return httpService.httpDelete(config, params);
        },

        getMemberRequest: function (groupId, userId) {
            var config = {
                url: memberRequestUrl(groupId, userId)
            };

            return httpService.httpGet(config);
        },

        acceptMemberRequest: function (groupId, userId) {
            var config = {
                url: memberRequestUrl(groupId, userId)
            };

            return httpService.httpPost(config);
        },

        ignoreMemberRequest: function (groupId, userId) {
            var config = {
                url: memberRequestUrl(groupId, userId)
            };

            return httpService.httpDelete(config);
        },

        getOrganization(groupId) {
          const config = {
            url: configureGroupConstants.urls.getOrganizationUrl
          };

          const params = {
            groupId
          };

          return httpService.httpGet(config, params);
        },

        getOrgRoles(organizationId, userId) {
          const config = {
            url: orgRolesUrl(organizationId, userId)
          };

          return httpService.httpGet(config);
        },

        getRolePermissions(organizationId, role) {
          const config = {
            url: rolePermissionsUrl(organizationId, role.id)
          };

          const params = {
            isDefault: role.name === "Member"
          };

          return httpService.httpGet(config, params);
        }
    };
}

configureGroupModule.factory("configureGroupMembersService", configureGroupMembersService);

export default configureGroupMembersService;
