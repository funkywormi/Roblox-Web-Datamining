import { func } from 'prop-types';
import groupListModule from '../groupListModule';

function groupsListService(
  httpService,
  $filter,
  $q,
  $timeout,
  $rootScope,
  groupsListConstants,
  groupsConstants
) {
  'ngInject';

  function getGroups(userId) {
    return $q(function (resolve, reject) {
      const config = {
        url: $filter('formatString')(groupsListConstants.urls.groupsListUrl, { id: userId }),
        retryable: false
      };
      httpService.httpGet(config, {}).then(
        responseData => {
          if (responseData?.data) {
            processGroups(responseData.data, userId).then(resolve);
          }
        },
        () => {
          httpService.getApiErrorCodeHandler(reject, groupsListConstants.errorCodes.getGroups);
        }
      );
    });
  }

  const processGroups = (data, userId) => {
    if (data) {
      return getVisibleGroups(data).then(
        groups => {
          const mappedGroups = groups.map(group => translateResultToGroup(group, userId));
          mappedGroups.sort((a, b) => {
            if (b.isOwner && a.isOwner) {
              return a.name.localeCompare(b.name, { sensitivity: 'base' });
            }
            if (a.isOwner) {
              return -1;
            }
            if (b.isOwner) {
              return 1;
            }
            return a.name.localeCompare(b.name, { sensitivity: 'base' });
          });
          return mappedGroups;
        },
        () => {
          return [];
        }
      );
    }
  };

  const getVisibleGroups = data => {
    const groupIds = [];
    const groupsDict = {};
    for (let i = 0; i < data.length; i++) {
      groupsDict[data[i].group.id] = data[i];
      groupIds.push(data[i].group.id);
    }

    return getGroupPolicyInfo(groupIds).then(
      result => {
        const visibleGroups = [];
        if (result?.groups) {
          const groupPolicies = result.groups;
          for (let i = 0; i < groupPolicies.length; i++) {
            // FIXME: should I have the second check?
            if (groupPolicies[i].canViewGroup && groupsDict[groupPolicies[i].groupId]) {
              visibleGroups.push(groupsDict[groupPolicies[i].groupId]);
            }
          }
        }
        return visibleGroups;
      },
      () => {
        $log.debug('--getGroupPolicies-error--');
        // FIXME: should I throw the error instead? Can I log it better? Is
        // it auto-logged?
        return [];
      }
    );
  };

  const translateResultToGroup = (result, userId) => {
    return {
      id: result.group.id,
      name: result.group.name,
      description: result.group.description,
      members: result.group.memberCount,
      role: result.role,
      isPrimary: result.isPrimaryGroup || false,
      isOwner: !!result.group.owner && String(result.group.owner.userId) === String(userId),
      groupUrl: $filter('seoUrl')(groupsConstants.urlBase, result.group.id, result.group.name),
      groupHasVerifiedBadge: result.group.hasVerifiedBadge,
      ownerHasVerifiedBadge: result.group.owner && result.group.owner.hasVerifiedBadge,
      hasSocialModules: result.group.hasSocialModules
    };
  };

  const getPrimaryGroup = userId => {
    const config = {
      url: $filter('formatString')(groupsListConstants.urls.primaryGroupUrl, { id: userId })
    };
    return httpService.httpGet(config);
  };

  const getGroupPolicyInfo = groupIds => {
    const config = {
      url: $filter('formatString')(groupsListConstants.urls.getGroupPolicyInfo)
    };

    const request = {
      groupIds
    };

    return httpService.httpPost(config, request);
  };

  const buildScrollbar = className => {
    const scrollbarElm = angular.element(document.querySelector(className));
    if (scrollbarElm && scrollbarElm.length > 0) {
      // Reset the height to be the max height, before the scrollbar is re-created
      const scrollbarChild = scrollbarElm[0].firstElementChild;
      if (scrollbarChild) {
        scrollbarChild.style['max-height'] = '700px';
      }

      scrollbarElm.mCustomScrollbar({
        autoExpandScrollbar: false,
        scrollInertia: 500,
        contentTouchScroll: 1,
        mouseWheel: {
          preventDefault: true,
          scrollAmount: 208,
          deltaFactor: 208
        }
      });
    }
  };

  const lazyImageRefresh = () => {
    $timeout(() => {
      $rootScope.$emit('lazyImg:refresh');
    });
  };

  return {
    getGroups,
    getPrimaryGroup,
    buildScrollbar,
    lazyImageRefresh
  };
}

groupListModule.factory('groupsListService', groupsListService);

export default groupsListService;
