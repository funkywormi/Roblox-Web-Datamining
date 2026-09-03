import { Guac } from 'Roblox';
import $ from 'jquery';
import groupsModule from '../groupsModule';

function groupsService($q, httpService, groupsConstants, $filter) {
  'ngInject';

  let configurationMetadata;
  let settings;
  let configureGroupRules;

  return {
    getGroup(groupId) {
      const config = {
        url: $filter('formatString')(groupsConstants.urls.getGroup, { id: groupId })
      };

      return httpService.httpGet(config, {}).then(result => {
        if (result?.owner) {
          const currentUser = result.owner;
          const { displayName, username } = currentUser;
          currentUser.nameForDisplay = displayName;
        }
        return result;
      });
    },

    getGroupProductFeatures(groupId) {
      const config = {
        url: $filter('formatString')(groupsConstants.urls.getGroupProductFeatures, {
          id: groupId
        })
      };

      return httpService.httpGet(config, {});
    },

    getGroupMetadata() {
      const config = {
        url: $filter('formatString')(groupsConstants.urls.getGroupMetadata)
      };

      return httpService.httpGet(config);
    },

    getGroupConfigurationMetadata() {
      return $q((resolve, reject) => {
        if (configurationMetadata) {
          resolve(configurationMetadata);
          return;
        }

        const config = {
          url: $filter('formatString')(groupsConstants.urls.getGroupConfigurationMetadata)
        };

        httpService.httpGet(config).then(response => {
          configurationMetadata = response;
          resolve(response);
        }, reject);
      });
    },

    getGroupRoles(groupId) {
      const config = {
        url: $filter('formatString')(groupsConstants.urls.getGroupRoles, { id: groupId }),
        retryable: false
      };

      return httpService.httpGet(config);
    },

    getGroupRolePermissions(groupId, roleSetId) {
      const config = {
        url: $filter('formatString')(groupsConstants.urls.getGroupRolePermissions, {
          groupId,
          roleSetId
        })
      };

      return httpService.httpGet(config, {});
    },

    exileUser(groupId, userId) {
      const config = {
        url: $filter('formatString')(groupsConstants.urls.updateUserRole, {
          groupId,
          userId
        })
      };

      return httpService.httpDelete(config);
    },

    banUser(groupId, userId) {
      const config = {
        url: $filter('formatString')(groupsConstants.urls.userGroupBan, {
          groupId,
          userId
        })
      };

      return httpService.httpPost(config);
    },

    fetchUserGroupBan(groupId, userId) {
      const config = {
        url: $filter('formatString')(groupsConstants.urls.userGroupBan, {
          groupId,
          userId
        })
      };

      return httpService.httpGet(config);
    },

    deletePostsByUser(groupId, userId) {
      const forumPostsUrl = $filter('formatString')(groupsConstants.urls.deleteForumPostsByUser, {
        groupId,
        userId
      });

      return new Promise((resolve, reject) => {
        $.ajax({
          method: 'DELETE',
          url: forumPostsUrl,
          contentType: 'application/json',
          timeout: 10000,
          success: resolve,
          error: reject,
          withCredentials: true
        });
      });
    },

    getGroupSettings(groupId) {
      return $q((resolve, reject) => {
        if (settings) {
          resolve(settings);
          return;
        }

        const config = {
          url: $filter('formatString')(groupsConstants.urls.updateGroupSettings, { id: groupId })
        };

        httpService.httpGet(config, {});

        httpService.httpGet(config).then(response => {
          settings = response;
          resolve(settings);
        }, reject);
      });
    },

    updateGroupSettings(groupId, updateGroupSettingsRequest) {
      const config = {
        url: $filter('formatString')(groupsConstants.urls.updateGroupSettings, { id: groupId })
      };

      return httpService.httpPatch(config, updateGroupSettingsRequest);
    },

    getUserIdsFromUsernames(usernames, excludeBannedUsers = false) {
      return $q((resolve, reject) => {
        const config = {
          url: $filter('formatString')(groupsConstants.urls.usernames)
        };

        const request = {
          usernames,
          excludeBannedUsers
        };

        httpService.httpPost(config, request).then(
          result => {
            resolve(result.data);
          },
          error => {
            reject(error);
          }
        );
      });
    },

    getUserRoleInGroup(userId, groupId) {
      return $q((resolve, reject) => {
        const config = {
          url: $filter('formatString')(groupsConstants.urls.getGroupRolesForUser, {
            userId
          })
        };

        httpService.httpGet(config).then(
          result => {
            if (result.data) {
              const currentGroup = result.data.filter(groupData => {
                return groupData.group.id === groupId;
              });
              if (currentGroup && currentGroup.length > 0) {
                resolve(currentGroup[0].role);
              } else {
                resolve(null);
              }
            }
          },
          () => {
            reject('Could not fetch user groups. Please try again.');
          }
        );
      });
    },

    getGroupDetailRules(userId) {
      const params = new URLSearchParams();
      params.append('u', userId);
      return Guac.callBehaviour('group-details-ui', params);
    },

    getConfigureGroupRules() {
      return $q((resolve, reject) => {
        if (configureGroupRules) {
          resolve(configureGroupRules);
          return;
        }

        Guac.callBehaviour('configure-group-ui').then(response => {
          configureGroupRules = response;
          resolve(response);
        }, reject);
      });
    },

    getGroupPolicyInfo(groupIds) {
      const config = {
        url: $filter('formatString')(groupsConstants.urls.getGroupPolicyInfo)
      };

      const request = {
        groupIds
      };

      return httpService.httpPost(config, request);
    },

    getGroupCurrency(groupId) {
      const urlConfig = {
        url: $filter('formatString')(groupsConstants.urls.getCurrency, { groupId })
      };

      return $q((resolve, reject) => {
        return httpService.httpGet(urlConfig).then(
          response => {
            resolve(response.robux);
          },
          response => {
            const errorCodes = httpService.getApiErrorCodes(response);
            reject(errorCodes[0] || 0);
          }
        );
      });
    },

    getUserCurrency(userId) {
      const urlConfig = {
        url: $filter('formatString')(groupsConstants.urls.getUserCurrency, { userId })
      };

      return $q((resolve, reject) => {
        return httpService.httpGet(urlConfig).then(
          response => {
            resolve(response.robux);
          },
          response => {
            const errorCodes = httpService.getApiErrorCodes(response);
            reject(errorCodes[0] || 0);
          }
        );
      });
    },

    getAddFundsAllowed(groupId) {
      const urlConfig = {
        url: $filter('formatString')(groupsConstants.urls.getAddFundsAllowedUrl, {
          groupId
        })
      };

      // Always resolve
      return $q(resolve => {
        return httpService.httpGet(urlConfig).then(
          canAddFunds => {
            resolve(canAddFunds);
          },
          () => {
            resolve(false);
          }
        );
      });
    },

    getPreviousGroupNames(groupId) {
      const config = {
        url: $filter('formatString')(groupsConstants.urls.groupNameHistory, {
          id: groupId
        })
      };

      return httpService.httpGet(config, {});
    },

    getGroupForums(groupId) {
      const urlConfig = {
        url: $filter('formatString')(groupsConstants.urls.getGroupForums, { groupId })
      };
      return httpService.httpGet(urlConfig);
    },

    getGroupEvents(groupId) {
      const urlConfig = {
        url: $filter('formatString')(groupsConstants.urls.getGroupEvents, { groupId })
      };
      return httpService.httpGet(urlConfig);
    },

    getGroupStore(groupId) {
      const urlConfig = {
        url: $filter('formatString')(groupsConstants.urls.getGroupStoreItems, { groupId })
      };
      return httpService.httpGet(urlConfig);
    },

    getGroupAffiliates(groupId) {
      const urlConfig = {
        url: $filter('formatString')(groupsConstants.urls.getGroupAffiliates, { groupId })
      };
      return httpService.httpGet(urlConfig);
    },

    changeOwner(groupId, userId) {
      const config = {
        url: $filter('formatString')(groupsConstants.urls.changeOwner, {
          groupId
        })
      };

      const request = {
        userId
      };

      return httpService.httpPost(config, request);
    }
  };
}

groupsModule.factory('groupsService', groupsService);

export default groupsService;
