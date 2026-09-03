import { authenticatedUser } from 'header-scripts';
import { CurrentUser, DeviceMeta } from 'Roblox';
import groupSearchModule from '../groupSearchModule';

function groupSearchController(
  $q,
  $scope,
  $location,
  $filter,
  cursorPaginationService,
  abpService,
  languageResource,
  groupsConstants,
  groupSearchConstants,
  groupsService,
  groupSearchService,
  groupExperimentsService,
  groupEventLoggingService,
  eventConstants,
  groupUtilityService
) {
  'ngInject';

  $scope.resetGroups = function () {
    $scope.groups = [];
  };

  $scope.createGroupUrl = function () {
    return groupsConstants.absoluteUrls.createGroup;
  };

  $scope.handleCreateGroupClick = () => {
    groupEventLoggingService.logGroupPageClickEvent({
      clickTargetType: 'createGroup',
      context: eventConstants.EventContext.GroupDiscovery
    });
    window.location.href = $scope.createGroupUrl();
  };

  // Per-card entry-point impression ids, keyed by group id, so a card's exposure and its follow-up
  // click share the same id (GRPS-3060). Reset whenever a new search is conducted.
  $scope.entrypointImpressionIds = {};
  // Tracks the current search: id (per conducted search), the 1-based page most recently loaded,
  // and the total result count reported by the last /v1/groups/search response.
  $scope.searchContext = { searchId: null, page: 0, totalResults: 0 };

  $scope.getEntrypointImpressionId = group => {
    if (!$scope.entrypointImpressionIds[group.id]) {
      $scope.entrypointImpressionIds[
        group.id
      ] = groupEventLoggingService.mintEntrypointImpressionId();
    }
    return $scope.entrypointImpressionIds[group.id];
  };

  // searchResults for keyword results, categoryBrowse for the landing/suggested-keyword rows.
  $scope.getEntryPointDetail = () =>
    $scope.layout.showGroupLanding
      ? eventConstants.EntryPointDetail.CategoryBrowse
      : eventConstants.EntryPointDetail.SearchResults;

  // Global index across pages for results; omitted for landing rows (their groups are owned by
  // per-row controllers, so a global index is not available here — TODO once landing is threaded).
  $scope.getResultIndex = group => {
    if ($scope.layout.showGroupLanding) {
      return undefined;
    }
    const indexOnPage = ($scope.groups || []).indexOf(group);
    if (indexOnPage < 0) {
      return undefined;
    }
    const page = Math.max($scope.searchContext.page, 1);
    return (page - 1) * groupSearchConstants.pager.pageSize + indexOnPage;
  };

  // Fire-once exposure per result card (invoked by the cmntyEntrypointExposure directive on-visible).
  // entryPointDetail defaults to the row-derived value (categoryBrowse landing / searchResults
  // keyword); callers can override it (e.g. Friends' Communities -> friendsCommunities).
  $scope.handleResultExposure = (group, entryPointDetail = $scope.getEntryPointDetail()) => {
    if (!group) {
      return;
    }
    const isLanding = $scope.layout.showGroupLanding;
    groupEventLoggingService.logCmntyEntrypointExposureEvent({
      context: eventConstants.EventContext.CommunitiesSearch,
      entryPoint: eventConstants.EntryPoint.CommunitiesSearch,
      entryPointDetail,
      entrypointImpressionId: $scope.getEntrypointImpressionId(group),
      groupId: group.id,
      pageRoute: window.location.pathname,
      resultIndex: $scope.getResultIndex(group),
      ...(isLanding
        ? {}
        : { searchId: $scope.searchContext.searchId, page: Math.max($scope.searchContext.page, 1) })
    });
  };

  // GRPS-3060: migrated from the old `viewGroupDetails` GroupPageClick to the new entry-point click
  // (do NOT also fire GroupPageClick here — that would double-count the result click).
  // entryPointDetail can be overridden by callers (e.g. Friends' Communities -> friendsCommunities).
  $scope.handleViewGroupDetailsClick = (group, entryPointDetail = $scope.getEntryPointDetail()) => {
    if (!group) {
      return;
    }
    const isLanding = $scope.layout.showGroupLanding;
    groupEventLoggingService.logCmntyEntrypointClickEvent({
      context: eventConstants.EventContext.CommunitiesSearch,
      entryPoint: eventConstants.EntryPoint.CommunitiesSearch,
      entryPointDetail,
      entrypointImpressionId: $scope.getEntrypointImpressionId(group),
      groupId: group.id,
      groupSize: group.memberCount,
      pageRoute: window.location.pathname,
      resultIndex: $scope.getResultIndex(group),
      ...(isLanding
        ? {}
        : { searchId: $scope.searchContext.searchId, page: Math.max($scope.searchContext.page, 1) })
    });
  };

  // Friends' Communities carousel (landing row): same exposure/click payload as the other landing
  // rows, but reports entry_point_detail=friendsCommunities so friends' impressions/clicks are
  // distinguishable from categoryBrowse. Reuses getEntrypointImpressionId so exposure<->click
  // stitch on the shared per-card impression id. No double-logging (no GroupPageClick).
  $scope.handleFriendsResultExposure = group =>
    $scope.handleResultExposure(group, eventConstants.EntryPointDetail.FriendsCommunities);

  $scope.handleFriendsGroupClick = group =>
    $scope.handleViewGroupDetailsClick(group, eventConstants.EntryPointDetail.FriendsCommunities);

  $scope.myGroupsUrl = function () {
    // Query param will allow us to bypass experiment re-direct for my/communities
    return `${groupsConstants.absoluteUrls.myGroups}?source=search`;
  };

  $scope.showCreateGroupButton = function () {
    return CurrentUser.isAuthenticated && ($scope.myGroups.length === 0 || $scope.isV2);
  };

  $scope.showMyGroupsButton = function () {
    return !$scope.isV2 && CurrentUser.isAuthenticated && $scope.myGroups.length > 0;
  };

  $scope.setupAds = function () {
    if (!$scope.layout.adsInitialized) {
      $scope.layout.adsInitialized = true;
      abpService.registerAd(abpService.adIds.leaderboardAbp);
    }
  };

  $scope.adRefresh = function () {
    abpService.refreshAllAds();
  };

  function updateFilteredKeyword(filteredKeyword) {
    $scope.keyword.filtered = filteredKeyword;
    $scope.keyword.filteredHtml = `<span class="search-keyword">${$filter('escapeHtml')(
      filteredKeyword
    )}</span>`;
  }

  $scope.setKeyword = function (keyword, isNormalSearch) {
    $scope.pager.setPagingParameter('keyword', keyword);

    if (keyword?.length > 0) {
      groupEventLoggingService.logGroupPageClickEvent({
        clickTargetType: isNormalSearch ? 'search' : 'searchDefaultCategory',
        context: eventConstants.EventContext.GroupDiscovery
      });

      // GRPS-3060: mint a fresh search id per conducted search and emit search-conducted. The
      // per-card impression ids from any previous search are reset so new results get fresh ids.
      $scope.searchContext = {
        searchId: groupEventLoggingService.mintSearchId(),
        page: 0
      };
      $scope.entrypointImpressionIds = {};
      groupEventLoggingService.logCmntySearchConductedEvent({
        searchId: $scope.searchContext.searchId,
        surface: eventConstants.SearchSurface.CommunitiesSearch,
        searchKeyword: keyword,
        pageRoute: window.location.pathname
      });
    }

    $location.path(`/search/${groupsConstants.urlBase}`).search({ keyword });
    Object.assign($scope.keyword, {
      previous: keyword,
      current: keyword,
      urlKeyword: keyword,
      filtered: '',
      filteredHtml: ''
    });
  };

  $scope.pager = cursorPaginationService.createPager({
    pageSize: groupSearchConstants.pager.pageSize,
    loadPageSize: groupSearchConstants.pager.loadPageSize,

    getCacheKeyParameters(params) {
      return {
        keyword: params.keyword
      };
    },

    getRequestUrl() {
      return $filter('formatString')(groupsConstants.urls.searchGroups);
    },

    // /v1/groups/search returns totalResults alongside the page data; capture it so loadSuccess can
    // report the real total. Older cached responses without the field fall back to 0.
    getDataListFromResponse(response) {
      $scope.searchContext.totalResults =
        response && typeof response.totalResults === 'number' ? response.totalResults : 0;
      return $q.when(response.data);
    },

    loadSuccess(groups) {
      $scope.layout.loadErrorMessage = null;
      $scope.groups = groups;
      updateFilteredKeyword($scope.keyword.previous);
      $scope.adRefresh();

      // GRPS-3060: emit search-results-returned for the page that just loaded. Only fires for a
      // conducted keyword search (searchContext.searchId set), not the landing page.
      if ($scope.searchContext.searchId) {
        // Use the pager's authoritative current page so position data stays correct when the user
        // pages backward (loadSuccess fires on every page display, so a monotonic +=1 would drift).
        $scope.searchContext.page = $scope.pager.getCurrentPageNumber();
        const { pageSize } = groupSearchConstants.pager;
        const pageOffset = ($scope.searchContext.page - 1) * pageSize;
        const groupsReturned = (groups || []).map((group, indexOnPage) => ({
          groupId: group.id,
          positionInList: pageOffset + indexOnPage,
          positionOnPage: indexOnPage
        }));
        groupEventLoggingService.logCmntySearchResultsReturnedEvent({
          searchId: $scope.searchContext.searchId,
          surface: eventConstants.SearchSurface.CommunitiesSearch,
          groups: groupsReturned,
          totalResults: $scope.searchContext.totalResults
        });
      }
    },

    loadError(error) {
      if (error && error.length > 0) {
        let message = error[0].userFacingMessage;
        switch (error[0].code) {
          case groupSearchConstants.errorCodes.default:
            message = languageResource.get(groupsConstants.translations.defaultError);
            break;
          case groupSearchConstants.errorCodes.textFiltered:
            $scope.keyword.current = $scope.keyword.current.replace(/[^\s]/g, '#');
            updateFilteredKeyword($scope.keyword.current);
            break;
        }
        $scope.layout.loadErrorMessage = message;
      }
      $scope.resetGroups();
    }
  });

  $scope.searchGroups = function (keyword, isNormalSearch) {
    $scope.setKeyword(keyword, isNormalSearch);
    $scope.pager.setPagingParameter('prioritizeExactMatch', isNormalSearch);

    if (keyword) {
      $scope.layout.isNormalSearch = isNormalSearch;
      $scope.layout.showGroupLanding = false;
      $scope.pager.loadFirstPage();
    } else {
      // Show group landing page
      $scope.resetGroups();
      $scope.layout.showGroupLanding = true;
    }
  };

  $scope.clearSearchGroups = () => $scope.searchGroups('');

  $scope.loadGroups = () => {
    return $q((resolve, reject) => {
      if (!CurrentUser.isAuthenticated) {
        resolve();
      }

      groupSearchService.getGroups(authenticatedUser?.id).then(result => {
        $scope.myGroups = result.data;
        resolve(result);
      }, resolve);
    });
  };

  $scope.loadGroupMetadata = function () {
    return $q((resolve, reject) => {
      groupsService.getGroupMetadata().then(function (result) {
        $scope.metadata = result;
        resolve(result);
      }, resolve);
    });
  };

  $scope.hideHeader = () => {
    if (!$scope.layout.isPageLoadComplete) {
      return false;
    }

    const {
      showAllFriendsGroups,
      showAllMyGroups,
      showGroupLanding,
      isNormalSearch
    } = $scope.layout;
    return (
      $scope.isV2 &&
      (showAllFriendsGroups || showAllMyGroups || (!showGroupLanding && !isNormalSearch))
    );
  };

  function initVariables() {
    $scope.layout = {
      adsInitialized: false,
      showGroupLanding: false,
      isNormalSearch: false,
      showAllFriendsGroups: false,
      showAllMyGroups: false,
      isPageLoadComplete: false,
      isPhone: DeviceMeta && DeviceMeta().isPhone
    };

    $scope.keyword = {
      current: $location.search().keyword,
      previous: '',
      urlKeyword: $location.search().keyword,
      filtered: '',
      filteredHtml: ''
    };

    $scope.groups = [];
    $scope.myGroups = [];
    $scope.metadata = {};
  }

  $scope.fetchAndExposeExperiment = async () => {
    const response = await groupExperimentsService.getLandingPageExperiment();
    $scope.isV2 = response.isSearchV2;

    if ($scope.isV2) {
      // Use different page styling
      document.querySelectorAll('.content')[0].className = 'contentV2';
    }

    groupExperimentsService.exposeLandingPageExperiment();
  };

  $scope.logPageExposure = () => {
    groupEventLoggingService.logGroupPageExposureEvent({
      exposureType: $scope.isV2
        ? eventConstants.ExposureType.GroupDiscoveryV2
        : eventConstants.ExposureType.GroupDiscovery,
      context: eventConstants.EventContext.GroupDiscovery
    });
  };

  $scope.loadGroupSearch = function () {
    groupUtilityService.redirectToCommunitiesIfNecessary();
    initVariables();
    $scope.setupAds();

    const metadataPromise = $scope.loadGroupMetadata();
    const membershipPromise = $scope.loadGroups();
    const fetchAndExposeExperimentPromise = $scope.fetchAndExposeExperiment();

    $q.all([membershipPromise, metadataPromise, fetchAndExposeExperimentPromise]).finally(() => {
      $scope.layout.isPageLoadComplete = true;
      $scope.searchGroups($scope.keyword.current, true);
      $scope.logPageExposure();
    });
  };

  $scope.loadGroupSearch();
}

groupSearchModule.controller('groupSearchController', groupSearchController);
export default groupSearchController;
