import { CurrentUser, EnvironmentUrls } from 'Roblox';
import {
  JOIN_REQUEST_COUNT_PAGE_SIZE,
  formatJoinRequestCountText
} from '../../../../ts/react/shared/constants/joinRequestsConstants';
import forumsService from '../../../../ts/react/groupForums/services/forumsService';
import configureGroupModule from '../configureGroupModule';
// #region TempForumTabs
// #endregion TempForumTabs

function configureGroupService(
  $q,
  httpService,
  configureGroupConstants,
  $filter,
  groupMembershipService,
  $log,
  languageResource,
  groupsService
) {
  'ngInject';

  let menuOptionsResponse;
  let economyMetadata;
  let getEconomyMetadataPromise;

  function getCanManageRolePermissions(groupId, isUnifiedUIEnabled) {
    if (!isUnifiedUIEnabled) {
      return $q.when(false);
    }
    return httpService
      .httpGet({
        url: `${EnvironmentUrls.groupsApi}/v1/groups/${groupId}/migration`
      })
      .then(migrationStatus => {
        if (migrationStatus.status !== 'Migrated') {
          return false;
        }
        return forumsService
          .getResolvedGroupRolePermissions(groupId)
          .then(resolvedRolePermissions =>
            Object.values(resolvedRolePermissions).some(
              rolePermissions => rolePermissions.canEditPermissions === true
            )
          );
      })
      .catch(error => {
        $log.error('[UnifiedForumPermissions] role management gate failed', {
          groupId,
          error
        });
        return false;
      });
  }

  function getPendingJoinRequestSummary(groupId) {
    const config = {
      url: $filter('formatString')(configureGroupConstants.urls.groupMemberRequestsUrl, {
        groupId
      })
    };
    const params = {
      sortOrder: 'Desc',
      limit: JOIN_REQUEST_COUNT_PAGE_SIZE
    };

    return httpService.httpGet(config, params).then(
      function (response) {
        const data = response?.data ?? [];
        const count = data.length;
        const hasMore = Boolean(response?.nextPageCursor);
        return {
          count,
          hasMore,
          displayText: formatJoinRequestCountText(count, hasMore),
          showPill: count > 0
        };
      },
      function () {
        return null;
      }
    );
  }

  function canViewMenuOption(
    menuOption,
    isOwner,
    permissions,
    policies,
    channelsPermissions,
    canManageRolePermissions
  ) {
    if (
      menuOption.name === configureGroupConstants.menuOptionNames.socialLinks &&
      policies.enforceAgeVerificationForSocialLinks &&
      policies.hideSocialLinksSection
    ) {
      return false;
    }
    if (menuOption.name === configureGroupConstants.menuOptionNames.contentModeration) {
      if (
        !policies.displayContentModerationConfiguration ||
        !permissions.groupContentModerationPermissions // If permissions are not defined, we assume the user's group does not have access yet
      ) {
        return false;
      }
      if (
        permissions.groupContentModerationPermissions?.manageKeywordBlockList ||
        permissions.groupContentModerationPermissions?.viewKeywordBlockList
      ) {
        return true;
      }
    }

    if (menuOption.name === configureGroupConstants.menuOptionNames.forums) {
      if (!policies.displayGroupForumsConfiguration) {
        return false;
      }
      if (canManageRolePermissions) {
        return true;
      }
      // If permissions are not defined, we assume the user's group does not have access to forums yet
      if (!permissions.groupForumsPermissions) {
        return false;
      }
      if (channelsPermissions) {
        // Users with the manageCategories permission in any forum category can go to this page
        if (
          channelsPermissions.some(
            channelPermissions => channelPermissions.groupForumsPermissions.manageCategories
          ) ||
          // If the user has this permissions at the group level then they can still go to this page to add new categories
          permissions.groupForumsPermissions.manageCategories
        ) {
          return true;
        }
      }
      if (permissions.groupForumsPermissions.manageCategories) {
        return true;
      }
    }

    if (menuOption.name === configureGroupConstants.menuOptionNames.analytics) {
      if (!policies.displayGroupAnalyticsConfiguration || !permissions.groupManagementPermissions) {
        return false;
      }
      if (permissions.groupManagementPermissions.viewCommunityAnalytics) {
        return true;
      }
    }

    if (menuOption.name === configureGroupConstants.menuOptionNames.communityTier) {
      if (!policies.displayCommunityTiersConfiguration) {
        return false;
      }
      // Owners only. Every tier requirement is evaluated against the community
      // owner's account, and POST community-tier/evaluate returns 403 for anyone
      // else, so there is nothing a manager can see or do here.
      return isOwner;
    }

    if (isOwner) {
      return true;
    }

    if (menuOption.name === configureGroupConstants.menuOptionNames.settings) {
      if (permissions.groupManagementPermissions.manageRelationships) {
        return true;
      }
    } else if (menuOption.name === configureGroupConstants.menuOptionNames.revenue) {
      if (permissions.groupEconomyPermissions.spendGroupFunds) {
        return true;
      }
    } else if (menuOption.name === configureGroupConstants.menuOptionNames.members) {
      if (
        permissions.groupMembershipPermissions.changeRank ||
        permissions.groupMembershipPermissions.inviteMembers ||
        permissions.groupMembershipPermissions.removeMembers ||
        permissions.groupMembershipPermissions.banMembers
      ) {
        return true;
      }
    } else if (menuOption.name === configureGroupConstants.menuOptionNames.roles) {
      if (permissions.groupMembershipPermissions.changeRank || canManageRolePermissions) {
        return true;
      }
    } else if (menuOption.name === configureGroupConstants.menuOptionNames.affiliates) {
      if (permissions.groupManagementPermissions.manageRelationships) {
        return true;
      }
    } else if (menuOption.name === configureGroupConstants.menuOptionNames.auditLog) {
      if (permissions.groupManagementPermissions.viewAuditLogs) {
        return true;
      }
    }

    return false;
  }

  function canViewSubmenuOption(
    submenuOption,
    isOwner,
    permissions,
    groupAddFundsAllowed,
    commissionsPageAllowed,
    publishingAdvanceRebatesPageAllowed
  ) {
    if (submenuOption.name === configureGroupConstants.submenuOptionNames.commissions) {
      return commissionsPageAllowed && permissions.groupEconomyPermissions.spendGroupFunds;
    }

    if (
      submenuOption.name === configureGroupConstants.submenuOptionNames.publishingAdvanceRebates &&
      !publishingAdvanceRebatesPageAllowed
    ) {
      return false;
    }

    if (isOwner && submenuOption.name === configureGroupConstants.submenuOptionNames.addFunds) {
      if (groupAddFundsAllowed) {
        return true;
      }
      return false;
    }

    if (isOwner) {
      return true;
    }

    if (
      submenuOption.name === configureGroupConstants.submenuOptionNames.summary ||
      submenuOption.name === configureGroupConstants.submenuOptionNames.sales ||
      submenuOption.name === configureGroupConstants.submenuOptionNames.publishingAdvanceRebates
    ) {
      if (permissions.groupEconomyPermissions.spendGroupFunds) {
        return true;
      }
    } else if (
      submenuOption.name === configureGroupConstants.submenuOptionNames.allies ||
      submenuOption.name === configureGroupConstants.submenuOptionNames.enemies
    ) {
      if (permissions.groupManagementPermissions.manageRelationships) {
        return true;
      }
    }

    return false;
  }

  function getEconomyMetadata() {
    if (getEconomyMetadataPromise) {
      return getEconomyMetadataPromise;
    }

    getEconomyMetadataPromise = $q(function (resolve, reject) {
      if (economyMetadata) {
        resolve(economyMetadata);
        return;
      }

      const urlConfig = {
        url: configureGroupConstants.urls.getEconomyMetadataUrl
      };
      httpService.httpGet(urlConfig).then(
        function (response) {
          economyMetadata = response;
          resolve(response);
        },
        function (response) {
          // We never reject EconomyMetadata to not prevent the page from
          // loading. It contains information about enabled features, so worst
          // that can happen is user seeing feature without the latest features.
          resolve(response);
        }
      );
    });
    return getEconomyMetadataPromise;
  }

  return {
    changeName(groupId, name) {
      const config = {
        url: $filter('formatString')(configureGroupConstants.urls.changeNameUrl, {
          groupId
        })
      };

      const request = {
        name
      };

      return httpService.httpPatch(config, request);
    },

    loadGroupMenuOptions(groupId) {
      return $q(function (resolve, reject) {
        const membershipPromise = groupMembershipService.getGroupMembership(groupId);
        const metadataPromise = groupsService.getGroupConfigurationMetadata();
        const addFundsPromise = groupsService.getAddFundsAllowed(groupId);
        const economyMetadataPromise = getEconomyMetadata();
        const policyPromise = groupsService.getConfigureGroupRules();
        const pendingJoinRequestsPromise = membershipPromise.then(function (membership) {
          if (!membership?.permissions?.groupMembershipPermissions?.inviteMembers) {
            return null;
          }
          return getPendingJoinRequestSummary(groupId);
        });
        const groupPromise = groupsService.getGroup(groupId).catch(() => undefined);
        const productFeaturesPromise = groupsService
          .getGroupProductFeatures(groupId)
          .catch(() => ({ IsOwnerRolesetDeprecated: false }));
        const canManageRolePermissionsPromise = productFeaturesPromise.then(productFeatures =>
          getCanManageRolePermissions(groupId, productFeatures?.IsUnifiedUIEnabled === true)
        );

        const menuOptions = [];
        const menuOptionNameValidity = {};
        const submenuOptionNameValidity = {};

        $q.all([
          membershipPromise,
          metadataPromise,
          addFundsPromise,
          economyMetadataPromise,
          policyPromise,
          pendingJoinRequestsPromise,
          groupPromise,
          productFeaturesPromise,
          canManageRolePermissionsPromise
        ]).then(
          function (responses) {
            const { role } = responses[0].userRole;
            const { permissions, channelPermissions } = responses[0];
            const metadata = responses[1];
            const groupAddFundsAllowed = responses[2];
            const commissionsPageAllowed = false;
            const publishingAdvanceRebatesPageAllowed =
              responses[3]?.isPublishingAdvanceRebatePageEnabled;
            const policies = responses[4];
            const pendingJoinRequestSummary = responses[5];
            const group = responses[6];
            const productFeatures = responses[7];
            const canManageRolePermissions = responses[8];

            const currentUserId = Number(CurrentUser.userId);
            const isOwnerRolesetDeprecated = productFeatures?.IsOwnerRolesetDeprecated === true;
            const isOwner = isOwnerRolesetDeprecated
              ? group?.owner?.userId !== undefined && group.owner.userId === currentUserId
              : role.rank === metadata.roleConfiguration.maxRank;

            // Community Tier is gated by the community product features rather than GUAC so
            // it can be enabled per-community, alongside the other CommunityTiers flags.
            // Mirrors how isReactAuditLogEnabled is derived in configureGroupPageController.
            policies.displayCommunityTiersConfiguration = productFeatures?.CommunityTiers === true;

            configureGroupConstants.menuOptions.forEach(function (menuOption) {
              if (
                canViewMenuOption(
                  menuOption,
                  isOwner,
                  permissions,
                  policies,
                  channelPermissions,
                  canManageRolePermissions
                )
              ) {
                const submenuOptions = [];
                menuOption.displayName = languageResource.get(menuOption.translationKey);
                if (
                  menuOption.name === configureGroupConstants.menuOptionNames.members &&
                  pendingJoinRequestSummary?.showPill
                ) {
                  menuOption.pendingJoinRequestCount = pendingJoinRequestSummary.count;
                  menuOption.pendingJoinRequestCountText = pendingJoinRequestSummary.displayText;
                } else {
                  menuOption.pendingJoinRequestCount = 0;
                  menuOption.pendingJoinRequestCountText = '';
                }
                menuOptions.push(menuOption);
                menuOptionNameValidity[menuOption.name] = true;

                menuOption.submenuOptions.forEach(function (submenuOption) {
                  if (
                    canViewSubmenuOption(
                      submenuOption,
                      isOwner,
                      permissions,
                      groupAddFundsAllowed,
                      commissionsPageAllowed,
                      publishingAdvanceRebatesPageAllowed
                    )
                  ) {
                    submenuOption.displayName = languageResource.get(submenuOption.translationKey);
                    submenuOptions.push(submenuOption);
                    submenuOptionNameValidity[submenuOption.name] = true;
                  } else {
                    submenuOptionNameValidity[submenuOption.name] = false;
                  }
                });
                menuOption.submenuOptions = submenuOptions;
              } else {
                menuOptionNameValidity[menuOption.name] = false;
              }
            });
            menuOptionsResponse = {
              menuOptions,
              menuOptionNameValidity,
              submenuOptionNameValidity
            };
            resolve(menuOptionsResponse);
          },
          function (error) {
            $log.debug('--error waiting for membershipPromise and metadataPromise---');
            reject(error);
          }
        );
      });
    },

    getEconomyMetadata,

    refreshPendingJoinRequestSummary(groupId) {
      return getPendingJoinRequestSummary(groupId);
    }
  };
}

configureGroupModule.factory('configureGroupService', configureGroupService);

export default configureGroupService;
