import groupsModule from '../groupsModule';

function groupMembershipService($q, httpService, groupsConstants, $filter) {
    "ngInject";
    var userGroupMembershipCache = {};

    return {
        getGroupMembership: function (groupId) {
            return $q(function (resolve, reject) {
                if (userGroupMembershipCache[groupId]) {
                    resolve(userGroupMembershipCache[groupId]);
                    return;
                }

                var config = {
                    url: $filter("formatString")(groupsConstants.urls.getGroupMembership, { id: groupId })
                };

                return httpService.httpGet(config).then(function (response) {
                    userGroupMembershipCache[groupId] = response;
                    resolve(response);
                }, reject);
            });
        },

        joinGroup: function (groupId, captchaData, proofOfWorkData) {
            return $q(function (resolve, reject) {
                var config = {
                    url: $filter("formatString")(groupsConstants.urls.joinGroup, { id: groupId })
                };

                const combinedChallengeData = {
                    ...captchaData,
                    ...proofOfWorkData
                  };
          
                return httpService.httpPost(config, combinedChallengeData).then(function (response) {
                    userGroupMembershipCache = {};
                    resolve(response);
                }, reject);
            });
        },

        claimOwnership: function (groupId) {
            return $q(function (resolve, reject) {
                var config = {
                    url: $filter("formatString")(groupsConstants.urls.claimOwnership, { groupId: groupId })
                };

                return httpService.httpPost(config, {}).then(function (response) {
                    userGroupMembershipCache = {};
                    resolve(response);
                }, reject);
            });
        },

        makePrimaryGroup: function (groupId) {
            return $q(function (resolve, reject) {
                var params = {
                    groupId: groupId
                };

                var config = {
                    url: groupsConstants.urls.updatePrimaryGroup
                };

                return httpService.httpPost(config, params).then(function (response) {
                    userGroupMembershipCache = {};
                    resolve(response);
                }, reject);
            });
        },

        removePrimaryGroup: function () {
            return $q(function (resolve, reject) {
                var config = {
                    url: groupsConstants.urls.updatePrimaryGroup
                };

                return httpService.httpDelete(config, {}).then(function (response) {
                    userGroupMembershipCache = {};
                    resolve(response);
                }, reject);
            });
        },

        leaveGroup: function (groupId, userId) {
            return $q(function (resolve, reject) {
                var config = {
                    url: $filter("formatString")(groupsConstants.urls.updateUserRole, { groupId: groupId, userId: userId })
                };

                return httpService.httpDelete(config, {}).then(function (response) {
                    userGroupMembershipCache = {};
                    resolve(response);
                }, reject);
            });
        },

        cancelGroupJoinRequest: function (groupId, userId) {
            return $q(function (resolve, reject) {
                var config = {
                    url: $filter("formatString")(groupsConstants.urls.deleteGroupJoinRequest, { groupId: groupId, userId: userId })
                };

                return httpService.httpDelete(config, {}).then(function (response) {
                    userGroupMembershipCache = {};
                    resolve(response);
                }, reject);
            });
        }
    }
}

groupsModule.factory("groupMembershipService", groupMembershipService);

export default groupMembershipService;
