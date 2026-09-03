import { AccountIntegrityChallengeService, CurrentUser, DeviceMeta } from 'Roblox';
import { initRobloxBadgesFrameworkAgnostic } from 'roblox-badges';
import { Component } from '@rbx/profile-platform';
import { GROUP_MEMBERSHIP_CHANGED_EVENT } from '../../../../ts/react/shared/constants/groupMembershipConstants';
import groupModule from '../groupModule';

function groupController(
  $scope,
  $rootScope,
  $log,
  $location,
  modalService,
  groupsListService,
  groupDetailsService,
  groupsService,
  groupDetailsConstants,
  groupResources,
  groupUtilityService,
  systemFeedbackService,
  thumbnailConstants,
  $q,
  $uibModal,
  languageResource,
  groupsConstants,
  groupMembershipService,
  groupExperimentsService,
  groupEventLoggingService,
  profilePlatformService,
  eventConstants,
  $state
) {
  'ngInject';

  function loadGroupData() {
    const whenLoadGroupData = $scope.loadGroup($scope.library.currentGroup.id);
    const whenReloadGroupsList = $scope.loadGroupsList(true);
    const whenLoadUserGroupMembership = $scope.loadGroupMembership($scope.library.currentGroup.id);
    const whenLoadProfilePlatform = $scope.refreshProfileHeader($scope.library.currentGroup.id);

    const promises = [
      whenLoadGroupData,
      whenReloadGroupsList,
      whenLoadUserGroupMembership,
      whenLoadProfilePlatform
    ];

    return $q.all(promises);
  }

  function dispatchMembershipChanged(groupId) {
    window.dispatchEvent(
      new CustomEvent(GROUP_MEMBERSHIP_CHANGED_EVENT, {
        detail: { groupId }
      })
    );
  }

  function closePopover() {
    // Click / outsideClick is the best trigger we can come up with for angular
    // bootstrap popover, but what that means is that clicking a menu element that
    // opens a modal leaves the menu open. This sends an outsideClick event to the
    // popover and forces it to close in a safe way, while still leveraging triggers.
    angular.element(document.querySelector('body')).click();
  }

  let hasHandledAboutTabExposure = false;
  const getStateName = state => {
    return groupDetailsConstants.stateToTab[state?.name] ?? state?.name;
  };
  const tryExposeAboutTabExperiment = state => {
    if (hasHandledAboutTabExposure) {
      return;
    }

    if (getStateName(state ?? $state.current) !== groupDetailsConstants.tabs.about.state) {
      return;
    }

    const componentOrdering = $scope.profilePlatform?.componentOrdering;
    const areGroupGamesVisible = $scope.library?.currentGroup?.areGroupGamesVisible;

    if (!Array.isArray(componentOrdering) || typeof areGroupGamesVisible !== 'boolean') {
      return;
    }

    hasHandledAboutTabExposure = true;

    const hasVisibleLinkedExperience =
      componentOrdering.includes(Component.ExperienceServers) && areGroupGamesVisible;

    // eslint-disable-next-line no-void
    void groupExperimentsService.exposeAboutTabExperiment(hasVisibleLinkedExperience);
  };

  $scope.showModal = (titleText, bodyText, actionButtonId) => {
    return modalService.open({
      titleText,
      bodyText,
      actionButtonShow: true,
      actionButtonId,
      neutralButtonText: languageResource.get(groupDetailsConstants.translations.no)
    });
  };

  $scope.showLeaveGroupOrChangeOwnerModal = (groupId, userId) => {
    closePopover();
    const isOwner = $scope.isCurrentUserOwner();

    if (isOwner) {
      const { group } = $scope.library.currentGroup;
      const modalParams = {
        animation: false,
        templateUrl: groupResources.modals.changeOwnerUpsell.templateUrl,
        controller: groupResources.modals.changeOwnerUpsell.controller,
        resolve: {
          modalData: {
            changeOwnerUrl: groupDetailsService.changeOwnerCreatorHubUrl(group.id),
            onLeaveGroup: () => {
              $scope.showLeaveGroupModal(groupId, userId);
            }
          }
        }
      };
      $uibModal.open(modalParams);
    } else if ($scope.hasSocialModules) {
      $scope.showLeaveGroupModal(groupId, userId);
    } else {
      // For non-social communities, bypass showing the leave group modal
      $scope
        .leaveGroup(groupId, userId)
        .then(() => {
          loadGroupData().then(
            () => {
              dispatchMembershipChanged($scope.library.currentGroup.id);
            },
            () => {
              // load failures have their own error feedbacks.
            }
          );
        })
        .catch(() => {
          systemFeedbackService.warning(
            languageResource.get(groupDetailsConstants.translations.unfollowGroupError)
          );
          $log.debug('--leaveGroup-error---');
        });
    }
  };

  $scope.showLeaveGroupModal = (groupId, userId) => {
    closePopover();

    const modalParams = {
      animation: false,
      templateUrl: groupResources.modals.leaveGroup.templateUrl,
      controller: groupResources.modals.leaveGroup.controller,
      resolve: {
        modalData: {
          groupId,
          userId,
          isOwner: $scope.isCurrentUserOwner(),
          refreshGroupData() {
            loadGroupData().then(
              () => {
                dispatchMembershipChanged($scope.library.currentGroup.id);
              },
              () => {
                // load failures have their own error feedbacks.
              }
            );
          },
          leaveGroup() {
            return $scope.leaveGroup(groupId, userId);
          }
        }
      }
    };

    $uibModal.open(modalParams);
  };

  $scope.leaveGroup = (groupId, userId) => {
    return groupMembershipService.leaveGroup(groupId, userId);
  };

  $scope.showChangeOwnerModal = () => {
    closePopover();
    window.location.href = groupDetailsService.changeOwnerCreatorHubUrl(
      $scope.library.currentGroup.id
    );
  };

  $scope.showReportAbuseModal = groupId => {
    closePopover();
    const reportAbuseTypes = { ...groupDetailsConstants.reportAbuseName };
    if (!$scope.canViewAndReportAnnouncement()) {
      delete reportAbuseTypes.announcements;
    }
    if ($scope.library.currentGroup.roles.length === 0) {
      delete reportAbuseTypes.role;
    }

    const openReportAbuseModal = policies => {
      const modalParams = {
        animation: false,
        templateUrl: groupResources.modals.reportAbuse.templateUrl,
        controller: groupResources.modals.reportAbuse.controller,
        resolve: {
          modalData: {
            groupId,
            roles: $scope.library.currentGroup.roles,
            reportAbuseTypes,
            policies
          }
        }
      };
      $uibModal.open(modalParams);
    };

    groupDetailsService
      .getAbuseReportRevampPolicyInfo()
      .then(result => {
        openReportAbuseModal(result);
      })
      .catch(() => {
        openReportAbuseModal({
          EnableGroup: false,
          EnableGroupStatus: false,
          EnableGroupRoleset: false,
          EnableCommunityGroupStatus: false
        });
      });
  };

  $scope.cancelJoinRequest = (groupId, userId) => {
    groupMembershipService.cancelGroupJoinRequest(groupId, userId).then(
      () => {
        loadGroupData();
      },
      () => {
        systemFeedbackService.warning(
          languageResource.get(groupDetailsConstants.translations.defaultError)
        );
        $log.debug('--cancelJoinRequest-error---');
      }
    );
  };

  $scope.makePrimary = groupId => {
    closePopover();
    const modal = $scope.showModal(
      languageResource.get(groupDetailsConstants.translations.makePrimaryGroup),
      languageResource.get(groupDetailsConstants.translations.makePrimaryGroupWarning),
      groupDetailsConstants.makePrimaryActionButtonId
    );

    modal.result.then(() => {
      groupMembershipService.makePrimaryGroup(groupId).then(
        () => {
          // invoke $http calls from service to update data
          loadGroupData();
        },
        () => {
          systemFeedbackService.warning(
            languageResource.get(groupDetailsConstants.translations.makePrimaryError)
          );
          $log.debug('--makePrimary-error---');
        }
      );
    });
  };

  $scope.removePrimary = () => {
    closePopover();
    const modal = $scope.showModal(
      languageResource.get(groupDetailsConstants.translations.removePrimaryGroup),
      languageResource.get(groupDetailsConstants.translations.removePrimaryGroupWarning),
      groupDetailsConstants.removePrimaryActionButtonId
    );

    modal.result.then(() => {
      groupMembershipService.removePrimaryGroup().then(
        () => {
          // invoke $http calls from service to update data
          loadGroupData();
        },
        () => {
          systemFeedbackService.warning(
            languageResource.get(groupDetailsConstants.translations.removePrimaryError)
          );
          $log.debug('--removePrimary-error---');
        }
      );
    });
  };

  $scope.triggerProofOfWorkChallenge = proofOfWorkInputParams => {
    const { ProofOfWork } = AccountIntegrityChallengeService;
    ProofOfWork.renderChallenge({
      containerId: 'pow-popup-container',
      sessionId: proofOfWorkInputParams.sessionId,
      onChallengeCompleted: powData => {
        $scope.joinGroup(
          false,
          {},
          { sessionId: proofOfWorkInputParams.sessionId, redemptionToken: powData.redemptionToken }
        );
      },
      onChallengeInvalidated: () => {
        systemFeedbackService.warning(
          languageResource.get(groupDetailsConstants.translations.joinGroupEr$scope.ror)
        );
        $log.debug('--proof-of-work-challenge-invalidated---');
      },
      onModalChallengeAbandoned: () => {}
    }).catch(() => {
      systemFeedbackService.warning(
        languageResource.get(groupDetailsConstants.translations.joinGroupError)
      );
      $log.debug('--proof-of-work-challenge-error---');
    });
  };

  $scope.joinGroupCaptchaFailed = () => {
    systemFeedbackService.warning(
      languageResource.get(groupDetailsConstants.translations.joinGroupError)
    );
  };

  $scope.joinGroupCaptchaPassed = captchaData => {
    $scope.joinGroup(true, captchaData);
  };

  $scope.triggerCaptcha = () => {
    $scope.captchaReturnTokenInSuccessCb = true;
    $rootScope.captcha.activated = true;
  };

  $scope.isCaptchaActive = () => {
    return $rootScope.captcha.activated;
  };

  $scope.joinGroup = (captchaPassed, captchaData, proofOfWorkData) => {
    if ($scope.isCaptchaActive() && !captchaPassed) {
      return $q((resolve, reject) => reject(new Error('captcha active')));
    }

    groupEventLoggingService.logGroupPageClickEvent({
      clickTargetType: 'joinGroup',
      context: eventConstants.EventContext.GroupHomepage,
      groupId: $scope.library.currentGroup.id,
      // GRPS-3102: carry the community session's enter_from on the join click.
      enterFrom: groupEventLoggingService.getCommunitySessionEnterFrom()
    });

    return $q((resolve, reject) => {
      groupMembershipService
        .joinGroup(
          $scope.library.currentGroup.id,
          captchaData,
          proofOfWorkData || groupDetailsConstants.challengeData.defaultProofOfWorkData
        )
        .then(
          () => {
            loadGroupData().then(
              () => {
                if (
                  $scope.showJoinGroupButtonUI() === groupDetailsConstants.joinStatus.joinPending
                ) {
                  systemFeedbackService.success(
                    languageResource.get(groupDetailsConstants.translations.joinGroupPendingSuccess)
                  );
                } else {
                  const successMessage = $scope.hasSocialModules
                    ? languageResource.get(groupDetailsConstants.translations.joinGroupSuccess)
                    : languageResource.get(groupDetailsConstants.translations.followGroupSuccess, {
                        name: $scope.library.currentGroup.group.name
                      });
                  systemFeedbackService.success(successMessage);
                }
                dispatchMembershipChanged($scope.library.currentGroup.id);
                resolve();
              },
              data => {
                // load failures have their own error feedbacks.
                reject(data);
              }
            );
          },
          data => {
            if (data && data.errors && data.errors[0]) {
              const error = data.errors[0];
              const errorCode = error.code;
              switch (errorCode) {
                case groupsConstants.errorCodes.membership.proofOfWork: {
                  const proofOfWorkInputParams = { sessionId: '' };
                  if (error.fieldData) {
                    const proofOfWorkFields = error.fieldData;
                    let jsonData = '';
                    try {
                      jsonData = JSON.parse(proofOfWorkFields);
                      proofOfWorkInputParams.sessionId = jsonData.sessionId;
                    } catch (e) {
                      // backward compatible with old version that returns string only.
                      proofOfWorkInputParams.sessionId = proofOfWorkFields;
                    }
                    $scope.triggerProofOfWorkChallenge(proofOfWorkInputParams);
                  } else {
                    systemFeedbackService.warning(
                      languageResource.get(groupDetailsConstants.translations.joinGroupError)
                    );
                    $log.debug('--proof-of-work-challenge-error-session-id-missing---');
                  }
                  break;
                }
                case groupsConstants.errorCodes.membership.captcha:
                  $scope.captchaInputParams = { dataExchange: '', unifiedCaptchaId: '' };
                  if (error.fieldData) {
                    const captchaFields = error.fieldData;
                    let jsonData = '';
                    try {
                      jsonData = JSON.parse(captchaFields);
                      $scope.captchaInputParams.dataExchange = jsonData.dxBlob;
                      $scope.captchaInputParams.unifiedCaptchaId = jsonData.unifiedCaptchaId;
                    } catch (e) {
                      // backward compatible with old version that returns string only.
                      $scope.captchaInputParams.dataExchange = captchaFields;
                    }
                  }
                  $scope.triggerCaptcha();
                  break;
                case groupsConstants.errorCodes.membership.operationUnavailable:
                  systemFeedbackService.warning(
                    languageResource.get(
                      groupsConstants.translations.groupMembershipsUnavailableError
                    )
                  );
                  break;
                default:
                  systemFeedbackService.warning(
                    languageResource.get(groupDetailsConstants.translations.joinGroupError)
                  );
                  $log.debug('--joinGroup-error---');
              }
            }
            reject(data);
          }
        );
    });
  };

  $scope.claimOwnership = groupId => {
    closePopover();
    groupMembershipService.claimOwnership(groupId).then(
      () => {
        systemFeedbackService.success(
          languageResource.get(groupDetailsConstants.translations.claimOwnershipSuccess)
        );
        loadGroupData();
      },
      () => {
        systemFeedbackService.warning(
          languageResource.get(groupDetailsConstants.translations.claimOwnershipError)
        );
        $log.debug('--claimOwnership-error---');
      }
    );
  };

  $scope.isCurrentUserOwner = () => {
    return (
      $scope.doesGroupHaveOwner() &&
      $scope.library.currentUser.id === $scope.library.currentGroup.group.owner.userId
    );
  };

  $scope.$on('$stateChangeSuccess', (event, toState) => {
    const stateName = getStateName(toState);
    // Redirect to about tab if user doesn't have access to forums from policy
    // Only redirect if the policy is loaded
    if ($scope.policiesLoaded && stateName === groupDetailsConstants.tabs.forums.state) {
      const canViewForums = $scope.canViewForums();
      if (!canViewForums) {
        $state.go(groupDetailsConstants.tabs.about.state, { success: true }, { reload: true });
        return;
      }
    }
    $scope.layout.activeTab = groupDetailsConstants.tabs[stateName];
    tryExposeAboutTabExperiment(toState);
  });

  $scope.loadGroup = groupId => {
    $scope.layout.isLoadingGroup = true;
    return groupsService
      .getGroup(groupId)
      .then(
        result => {
          if (result) {
            $scope.library.currentGroup.group = result;
          }
        },
        () => {
          $scope.layout.loadGroupError = true;
          $log.debug('--loadGroup-error---');
        }
      )
      .finally(() => {
        $scope.layout.isLoadingGroup = false;
      });
  };

  $scope.loadGroupForums = groupId => {
    return groupsService
      .getGroupForums(groupId)
      .then(result => {
        $scope.library.currentGroup.forumsEnabled = result.data.length > 0;
      })
      .finally(() => {
        // If we are trying to access the forums tab but forums are not enabled, then redirect to about tab
        if (
          $state.current.label === groupDetailsConstants.tabs.forums.label &&
          !$scope.library.currentGroup.forumsEnabled
        ) {
          $state.go(groupDetailsConstants.tabs.about.state, { success: true }, { reload: true });
        }
      });
  };

  $scope.loadGroupEvents = groupId => {
    return groupsService.getGroupEvents(groupId).then(result => {
      $scope.library.currentGroup.eventsEnabled = result?.data?.length > 0;
    });
  };

  $scope.loadGroupStore = groupId => {
    return groupsService.getGroupStore(groupId).then(result => {
      $scope.library.currentGroup.storeEnabled = result?.data?.length > 0;
    });
  };

  $scope.loadGroupAffiliates = groupId => {
    return groupsService.getGroupAffiliates(groupId).then(result => {
      $scope.library.currentGroup.affiliatesEnabled = result?.totalGroupCount > 0;
    });
  };

  $scope.isLockedGroup = () => {
    return (
      ($scope.library &&
        $scope.library.currentGroup &&
        $scope.library.currentGroup.group &&
        $scope.library.currentGroup.group.isLocked) ||
      ($scope.profilePlatform &&
        $scope.profilePlatform.components &&
        $scope.profilePlatform.components.CommunityLocked)
    );
  };

  $scope.isGroupRestrictedByPolicy = () => {
    return (
      $scope.library &&
      $scope.library.currentGroup &&
      $scope.library.currentGroup.group &&
      $scope.library.currentGroup.group.isRestrictedByPolicy
    );
  };

  $scope.loadGroupsList = forceReload => {
    // Only attempt to load groups for authenticated users.
    if (!$scope.isAuthenticatedUser) {
      return;
    }

    // Only show loading indicator if the groups list is empty.
    $scope.library.groupsList.isLoadingGroups = !$scope.library.groupsList.groups;

    if (!$scope.library.groupsList.groups || forceReload) {
      groupsListService
        .getGroups($scope.library.currentUser.id)
        .then(
          result => {
            $scope.library.currentUser.groupCount = result.length;
            $scope.library.groupsList.groups = result;
          },
          () => {
            $scope.library.groupsList.groups = [];
            $scope.library.groupsList.loadFailure = true;
            $log.debug('--loadGroupsList-error---');
          }
        )
        .finally(() => {
          $scope.library.groupsList.isLoadingGroups = false;
        });
    }
  };

  $scope.loadGroupMembership = groupId => {
    $scope.layout.isLoadingGroupMembership = true;
    return $q((resolve, reject) => {
      groupMembershipService
        .getGroupMembership(groupId)
        .then(
          result => {
            if (result) {
              if (result.userRole) {
                $scope.library.currentGroup.role = result.userRole.role;
              }
              $scope.library.currentGroup.isPendingJoin = result.isPendingJoin;
              $scope.library.currentGroup.isPrimary = result.isPrimary;

              if (result.permissions) {
                $scope.library.currentGroup.permissions = result.permissions;
              }
              if (result.channelPermissions) {
                $scope.library.currentGroup.channelPermissions = result.channelPermissions;
              }
              $scope.library.currentGroup.canConfigureGroup = result.canConfigure;
              $scope.library.currentGroup.canViewMemberList = result.canViewMemberList;
              $scope.library.currentGroup.areGroupFundsVisible = result.areGroupFundsVisible;
              $scope.library.currentGroup.areEnemiesAllowed = result.areEnemiesAllowed;
              $scope.library.currentGroup.areGroupGamesVisible = result.areGroupGamesVisible;
              $scope.library.currentGroup.isBannedFromGroup = result.isBannedFromGroup;
            }
            tryExposeAboutTabExperiment();
            resolve(result);
          },
          data => {
            $log.debug('--loadGroupMembership-error---');
            $scope.layout.loadGroupMembershipError = true;
            reject(data);
          }
        )
        .finally(() => {
          $scope.layout.isLoadingGroupMembership = false;
        });
    });
  };

  $scope.loadGroupRoles = groupId => {
    if ($scope.policies?.isGracefulDegradationEnabled) {
      return;
    }
    // Fetch group roles
    groupsService.getGroupRoles(groupId).then(
      result => {
        const { roles } = result;
        if (roles && roles.length > 1) {
          // Remove guest role (lowest rank)
          const rolesWithoutGuest = roles.filter(role => role.rank > 0);
          $scope.library.currentGroup.roles = rolesWithoutGuest;
        }
      },
      () => {
        $scope.library.currentGroup.roles = [];
        $log.debug('--getGroupRoles-error---');
      }
    );
  };

  $scope.getCurrencyIfNeeded = () => {
    if ($scope.library.currentGroup.areGroupFundsVisible) {
      $scope.loadGroupCurrency();
    }
  };

  $scope.loadGroupMetadata = groupId => {
    return $q((resolve, reject) => {
      groupsService
        .getGroupMetadata()
        .then(
          result => {
            if (result) {
              $scope.library.metadata = result;
            }
            $scope.library.metadata.isPhone = DeviceMeta && DeviceMeta().isPhone;
            $scope.library.metadata.isApp = DeviceMeta && DeviceMeta().isInApp;
            resolve(result);
          },
          data => {
            $log.debug('--loadGroupMetadata-error---');
            $scope.layout.loadGroupMetadataError = true;
            reject(data);
          }
        )
        .finally(() => {
          $scope.layout.isMetadataLoaded = true;
        });
    });
  };

  $scope.loadGroupCurrency = () => {
    groupsService.getGroupCurrency($scope.library.currentGroup.id).then(
      robux => {
        $scope.currencyInRobux = robux;
      },
      () => {
        $log.debug('--loadGroupCurrency-error---');
      }
    );
  };

  $scope.isInGroup = () => {
    return (
      $scope.library.currentGroup.role &&
      $scope.library.currentGroup.role.id > 0 &&
      $scope.library.currentGroup.role.rank > 0
    );
  };

  $scope.canConfigureGroup = () => {
    return $scope.library.currentGroup.canConfigureGroup;
  };

  $scope.canViewMemberList = () => {
    return $scope.library.currentGroup.canViewMemberList;
  };

  $scope.doesGroupHaveOwner = () => {
    return (
      $scope.library.currentGroup.group &&
      $scope.library.currentGroup.group.owner &&
      $scope.library.currentGroup.group.owner.userId > 0
    );
  };

  $scope.isGroupPrimary = () => {
    return $scope.library.currentGroup.isPrimary;
  };

  $scope.showJoinGroupButtonUI = () => {
    // Content only valid if not in group yet
    if ($scope.isInGroup()) {
      return groupDetailsConstants.joinStatus.inGroup;
    }

    // Enforce group limits
    if ($scope.library.currentUser.groupCount >= $scope.library.metadata.groupLimit) {
      return groupDetailsConstants.joinStatus.maxGroups;
    }

    // Show pending if join was requested
    if ($scope.library.currentGroup.isPendingJoin) {
      return groupDetailsConstants.joinStatus.joinPending;
    }

    // Show group closed if no owner
    if (!$scope.doesGroupHaveOwner() && !$scope.library.currentGroup.group.publicEntryAllowed) {
      return groupDetailsConstants.joinStatus.groupClosed;
    }

    // No restrictions met
    return groupDetailsConstants.joinStatus.allowed;
  };

  $scope.canViewEvents = () => {
    if ($scope.policies?.isGracefulDegradationEnabled) {
      return false;
    }
    if (!$scope.policies.displayGroupEvents) {
      return false;
    }

    if ($scope.isCurrentUserOwner()) {
      return true;
    }

    if (!$scope.isHidingEmptyCommunityTabsEnabled || $scope.library.currentGroup.eventsEnabled) {
      return true;
    }

    return false;
  };

  $scope.canViewStore = () => {
    if (
      $scope.library.currentGroup.permissions &&
      $scope.library.currentGroup.permissions.groupEconomyPermissions &&
      $scope.library.currentGroup.permissions.groupEconomyPermissions.createItems &&
      $scope.library.currentGroup.permissions.groupEconomyPermissions.manageItems &&
      !$scope.library.metadata.isPhone
    ) {
      return true;
    }

    if (!$scope.isHidingEmptyCommunityTabsEnabled || $scope.library.currentGroup.storeEnabled) {
      return true;
    }

    return false;
  };

  $scope.canViewAffiliates = () => {
    if ($scope.policies?.isGracefulDegradationEnabled) {
      return false;
    }
    if (
      $scope.isHidingEmptyCommunityTabsEnabled &&
      !$scope.library.currentGroup.affiliatesEnabled
    ) {
      return false;
    }

    return true;
  };

  $scope.canViewForums = () => {
    if ($scope.policies?.isGracefulDegradationEnabled) {
      return false;
    }
    return $scope.library.currentGroup.forumsEnabled && $scope.policies.displayGroupForums;
  };

  $scope.canViewGroupDetails = () => {
    return !$scope.library.currentGroup.isBannedFromGroup;
  };

  $scope.canJoinGroup = () => {
    return (
      !$scope.isCaptchaActive() &&
      $scope.canViewGroupDetails() &&
      $scope.library.currentGroup.roles &&
      $scope.library.currentGroup.roles.length > 0
    );
  };

  $scope.canViewCommunityTabs = () => {
    return !($scope.isHidingEmptyCommunityTabsEnabled && $scope.groupDetailsNumTabs() <= 1);
  };

  $scope.groupDetailsTabs = () => {
    const tabs = { ...groupDetailsConstants.tabs };
    if (!$scope.canViewEvents()) {
      delete tabs.events;
    }
    if (!$scope.canViewForums()) {
      delete tabs.forums;
    }
    if (!$scope.canViewStore()) {
      delete tabs.store;
    }
    if (!$scope.canViewAffiliates()) {
      delete tabs.affiliates;
    }

    if ($scope.availableProfilePlatformTabs !== undefined) {
      Object.keys(tabs).forEach(key => {
        if (!$scope.availableProfilePlatformTabs.has(key)) {
          delete tabs[key];
        }
      });
    }

    return tabs;
  };

  $scope.isBannedFromGroup = () => {
    return $scope.library.currentGroup.isBannedFromGroup;
  };

  $scope.groupDetailsNumTabs = () => {
    return Object.keys($scope.groupDetailsTabs()).length;
  };

  $scope.showReactAnnouncement = () => {
    // If either flag is off, don't show react. Always show react to Owner. Always show react if there is a linked community or
    // if we have enabled direct announcement publishing.
    return (
      $scope.policies.displayGroupAnnouncements &&
      ($scope.policies.displayGroupAnnouncementPublishing ||
        ($scope.isCurrentUserOwner() && CurrentUser.is13orOver))
    );
  };

  $scope.onAnnouncementLoaded = () => {
    $scope.$applyAsync(() => {
      $scope.hasAnnouncement = true;
    });
  };

  $scope.canViewAndReportAnnouncement = () => {
    return (
      $scope.showReactAnnouncement() &&
      $scope.policies.displayGroupAnnouncements &&
      $scope.groupAnnouncement?.announcementId
    );
  };

  $scope.canCreateAnnouncements = () => {
    return (
      $scope.library.currentGroup.permissions?.groupPostsPermissions?.postToStatus &&
      $scope.policies.displayGroupAnnouncementPublishing
    );
  };

  $scope.canViewAnnouncements = () => {
    return $scope.library.currentGroup.permissions?.groupPostsPermissions?.viewStatus;
  };

  $scope.canViewMembers = () => {
    if ($scope.policies?.isGracefulDegradationEnabled) {
      return false;
    }
    if ($scope.policies.isMemberListVisibilityEnforced) {
      return $scope.library.currentGroup.canViewMemberList === true;
    }

    return $scope.policies.displayMembers;
  };

  $scope.canViewGroupRank = () => {
    return $scope.isInGroup() && $scope.policies.displayRank;
  };

  $scope.canCreateGroup = () => {
    return (
      !$scope.library.groupsList.groups ||
      $scope.library.groupsList.groups.length < $scope.library.metadata.groupLimit
    );
  };

  $scope.showGroupsList = () => {
    return (
      $scope.isAuthenticatedUser &&
      !$scope.library.metadata.isPhone &&
      $scope.layout.isMetadataLoaded &&
      $scope.isCommunitiesLayoutVisible
    );
  };

  $scope.loadGroupsListRedesignExperiment = () => {
    groupExperimentsService.isGroupsListRedesignExperimentEnabled().then(isEnabled => {
      $scope.isGroupsListRedesignEnabled = isEnabled;
    });
  };

  $scope.profilePageUrl = userId => {
    return groupDetailsService.profilePageUrl(userId);
  };
  $scope.configureGroupUrl = groupId => {
    return groupDetailsService.configureGroupUrl(groupId);
  };
  $scope.changeOwnerCreatorHubUrl = groupId => {
    return groupDetailsService.changeOwnerCreatorHubUrl(groupId);
  };

  $scope.verifyGroupOrigin = () => {
    const groupId = $scope.library.currentGroup.id;
    groupsService.getGroupPolicyInfo([groupId]).then(
      response => {
        const isViewable =
          response &&
          response.groups &&
          response.groups[0] &&
          response.groups[0].canViewGroup === true;
        $scope.library.currentGroup.group.isRestrictedByPolicy = !isViewable;
      },
      () => {
        $log.debug('--checkGroupOrigin-error---');
        $scope.library.currentGroup.group.isRestrictedByPolicy = true;
      }
    );
  };

  $scope.loadHidingEmptyCommunityTabsExperiment = async () => {
    groupExperimentsService.isHidingEmptyCommunityTabsExperimentEnabled().then(isEnabled => {
      $scope.isHidingEmptyCommunityTabsEnabled = isEnabled;
    });
  };

  $scope.loadGroupExperienceServersExperiment = async () => {
    groupExperimentsService.isGroupExperienceServersExperimentEnabled().then(isEnabled => {
      $scope.isGroupExperienceServersExperimentEnabled = isEnabled;
    });
  };

  // Resolve the React-vs-legacy affiliates decision from product features,
  // independent of the guac policy load. Kept off the policies object since
  // the guac response replaces it wholesale.
  $scope.loadReactAffiliatesFlag = groupId => {
    groupsService.getGroupProductFeatures(groupId).then(
      features => {
        $scope.isReactAffiliatesEnabled = features?.ReactGroupAffiliates === true;
        $scope.reactAffiliatesFlagLoaded = true;
      },
      () => {
        $scope.isReactAffiliatesEnabled = false;
        $scope.reactAffiliatesFlagLoaded = true;
      }
    );
  };

  $scope.loadGroupDetailPolicies = groupId => {
    $scope.loadReactAffiliatesFlag(groupId);

    if ($scope.library.metadata.isGroupDetailsPolicyEnabled) {
      groupsService.getGroupDetailRules($scope.library.currentUser.id).then(
        response => {
          $scope.policies = response;
          $scope.policiesLoaded = true;

          // Load profile platform after policies are available
          $scope.loadProfilePlatform(groupId);

          if ($scope.policies.checkGroupOrigin) {
            $scope.verifyGroupOrigin();
          }

          if ($scope.policies.displayGroupForums) {
            $scope.loadGroupForums(groupId);
          } else if ($state.current.label === groupDetailsConstants.tabs.forums.label) {
            $state.go(groupDetailsConstants.tabs.about.state, { success: true }, { reload: true });
          }

          $scope.loadGroupEvents(groupId);
          $scope.loadGroupStore(groupId);
          $scope.loadGroupAffiliates(groupId);
        },
        () => {
          $log.debug('--loadGroupDetailPolicies-error---');
          // Still load profile platform even if policies fail, with defaults
          $scope.loadProfilePlatform(groupId);
        }
      );
    } else {
      Object.keys(groupDetailsConstants.policies).forEach(item => {
        $scope.policies[item] = true;
      });
      $scope.loadProfilePlatform(groupId);
    }
  };

  $scope.initGroupDetails = groupId => {
    $scope.library.currentGroup = {
      id: groupId,
      group: {
        owner: null,
        shout: null
      },
      permissions: null,
      isPrimary: false,
      role: null,
      isPendingJoin: false,
      isLocked: false
    };

    $scope.currencyInRobux = null;

    $scope
      .loadGroup(groupId)
      .then(() => {
        // bootstraps the verified badges component
        initRobloxBadgesFrameworkAgnostic({
          overrideIconClass: 'verified-badge-icon-group-owner'
        });

        initRobloxBadgesFrameworkAgnostic({
          overrideIconClass: 'verified-badge-icon-group-name'
        });
      })
      .catch(() => {
        // noop - if this call fails we want to not render the badge.
      });
    $scope.loadGroupRoles(groupId);
  };

  $scope.updateGroup = groupId => {
    $scope.initGroupDetails(groupId);

    $scope.loadGroupMembership(groupId).then(
      () => {
        $scope.getCurrencyIfNeeded();
      },
      () => {
        $log.debug('--error waiting for membershipPromise and metadataPromise---');
      }
    );
  };

  $scope.doesCurrentGroupHaveVerifiedBadge = () => {
    return $scope?.library?.currentGroup?.group?.hasVerifiedBadge;
  };

  $scope.doesCurrentGroupOwnerHaveVerifiedBadge = () => {
    return $scope?.library?.currentGroup?.group?.owner?.hasVerifiedBadge;
  };

  $scope.fetchAndExposeExperiment = async () => {
    await groupExperimentsService.getLandingPageExperiment();
    groupExperimentsService.exposeLandingPageExperiment();
  };

  $scope.logPageExposure = () => {
    groupEventLoggingService.logGroupPageExposureEvent({
      exposureType: eventConstants.ExposureType.GroupHomepage,
      groupId: $scope.library.currentGroup.id,
      context: eventConstants.EventContext.GroupHomepage
    });
  };

  $scope.loadProfilePlatform = groupId => {
    $scope.hasSocialModules = true;

    $q.when(
      profilePlatformService.initializeProfilePlatform(
        groupId,
        $scope.policies?.isGracefulDegradationEnabled
      )
    )
      .then(data => {
        $scope.profilePlatform = data;

        const hasSocialModules = data?.components?.CommunityProfileHeader?.hasSocialModules;
        if (hasSocialModules !== undefined) {
          $scope.hasSocialModules = hasSocialModules;
        }

        const communityTabs = data?.components?.CommunityTabs?.tabs;
        if (communityTabs !== undefined) {
          $scope.availableProfilePlatformTabs = new Set(
            communityTabs.map(tab => tab.toLowerCase())
          );
        }
        tryExposeAboutTabExperiment();
      })
      .catch(() => {
        // For now, fallback to showing all components if the Profile Platform API call fails
        $scope.profilePlatform = {
          componentOrdering: [
            Component.CommunityProfileHeader,
            Component.About,
            Component.Announcements,
            Component.Events,
            Component.Experiences,
            Component.ForumsDiscovery,
            Component.Members,
            Component.SocialLinks
          ]
        };
        tryExposeAboutTabExperiment();
      });
  };

  $scope.refreshProfileHeader = groupId => {
    profilePlatformService
      .refreshProfilePlatform(groupId, [
        { component: Component.CommunityProfileHeader },
        { component: Component.Actions }
      ])
      .then(data => {
        $scope.mergeAndUpdateProfilePlatformData(data);
      });
  };

  $scope.refreshAnnouncements = () => {
    return profilePlatformService
      .refreshProfilePlatform($scope.library.currentGroup.id, [
        { component: Component.Announcements }
      ])
      .then(data => data?.components?.Announcements ?? null);
  };

  $scope.mergeAndUpdateProfilePlatformData = newData => {
    if (!$scope.profilePlatform) {
      $scope.profilePlatform = newData;
      return;
    }

    const componentOrdering = newData.componentOrdering ?? $scope.profilePlatform.componentOrdering;
    const components = { ...$scope.profilePlatform.components, ...newData.components };
    $scope.profilePlatform = {
      profileType: newData.profileType,
      profileId: newData.profileId,
      componentOrdering,
      components
    };
    tryExposeAboutTabExperiment();
  };

  $scope.updateCommunitiesLayoutVisibility = () => {
    // match "/communities" or "/es/communities" (and similar) for localized paths
    $scope.isCommunitiesLayoutVisible = window.location.pathname.includes('/communities/');
  };

  $scope.init = () => {
    groupUtilityService.redirectToCommunitiesIfNecessary();
    const groupId = groupUtilityService.parseGroupId($location.absUrl());

    $scope.thumbnailTypes = thumbnailConstants.thumbnailTypes;
    $scope.relationshipTypes = groupsConstants.relationshipTypes;
    $scope.groupDetailsConstants = groupDetailsConstants;
    $scope.policies = $scope.groupDetailsConstants.policies;
    $scope.policiesLoaded = false;
    $scope.isReactAffiliatesEnabled = false;
    $scope.reactAffiliatesFlagLoaded = false;
    $scope.isAuthenticatedUser = CurrentUser.isAuthenticated;

    $scope.groupAnnouncement = {};
    $scope.layout = {
      activeTab: 'about'
    };

    $scope.library = {};

    $scope.library.moreGroupsUrl = groupsConstants.absoluteUrls.moreGroups;

    $scope.library.currentUser = {
      id: parseInt(CurrentUser.userId),
      groupCount: null,
      maxGroups: 0
    };

    $scope.library.currentGroup = {
      id: groupId
    };

    $scope.library.groupsList = {
      isLoadingGroups: false
    };

    $scope.library.metadata = {
      groupStatusMaxLength: 0,
      groupPostMaxLength: 0,
      isLoaded: false
    };

    const loadGroupMetadataPromise = $scope.loadGroupMetadata(groupId);
    const fetchAndExposeExperimentPromise = $scope.fetchAndExposeExperiment();

    $q.all([loadGroupMetadataPromise, fetchAndExposeExperimentPromise])
      .then(() => {
        $scope.updateGroup(groupId);
        $scope.logPageExposure();
      })
      .finally(() => {
        $scope.loadGroupDetailPolicies(groupId);
      });

    $scope.loadGroupsList();
    $scope.loadHidingEmptyCommunityTabsExperiment();
    $scope.loadGroupsListRedesignExperiment();
    $scope.loadGroupExperienceServersExperiment();
    $scope.updateCommunitiesLayoutVisibility();

    // Force state refresh to avoid race condition where $stateChangeSuccess won't fire
    if ($state.current.name) {
      $state.go($state.current.name, { success: true }, { reload: true });
    }
  };

  $scope.init();

  $scope.areForumsEnabled = () => {
    return $scope.library.currentGroup.forumsEnabled === true;
  };
}

groupModule.controller('groupController', groupController);
export default groupController;
