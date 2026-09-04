import { CurrentUser, DeviceMeta, DisplayNames, EventStream } from 'Roblox';
import Presence from 'roblox-presence';
import { UserProfileField } from 'roblox-user-profiles';
import playerSearchModule from '../playerSearchModule';

function playerSearchController(
  $location,
  $log,
  $scope,
  $window,
  abpService,
  cardLabels,
  chatDispatchService,
  playerSearchService,
  playerSearchConstants,
  googleAnalyticsEventsService,
  realtimeService,
  systemFeedbackService,
  userProfilesService,
  thumbnailConstants
) {
  'ngInject';

  // anything that the view uses
  $scope.layout = { ...playerSearchConstants.layout };
  $scope.thumbnailTypes = thumbnailConstants.thumbnailTypes;

  // data for the page
  $scope.pageData = { ...playerSearchConstants.pageData };
  // data for the search bar
  $scope.formData = { keyword: '' };
  // where the results are stored.
  $scope.results = [];
  // Scope functions
  $scope.labelToShow = function (item) {
    if (item.isCurrentUser) {
      return cardLabels.yourself;
    }
    if (item.MatchingPreviousName) {
      return cardLabels.aka;
    }
    if (item.FriendshipStatus === $scope.layout.friendship.Friends) {
      return cardLabels.friends;
    }
    if (item.isFollowing) {
      return cardLabels.following;
    }
    if (CurrentUser.isAuthenticated) {
      return cardLabels.presence;
    }
  };

  $scope.getUserInfo = function (user) {
    if ($scope.layout.inMobile) {
      return '';
    }
    const info = $scope.layout.userInfo;
    if (user.gameIsPlayable) {
      return info.game;
    }
    if (user.userPresenceType === Presence.PresenceType.Studio) {
      return info.studio;
    }
    if (user.primaryGroup) {
      return info.group;
    }
    return '';
  };

  $scope.showButtonsForFriends = function (user) {
    return (
      user.FriendshipStatus === $scope.layout.friendship.Friends &&
      !user.isCurrentUser &&
      !$scope.layout.isUserGuest
    );
  };

  $scope.showButtonsForNonFriends = function (user) {
    return (
      user.FriendshipStatus !== $scope.layout.friendship.Friends &&
      !user.isCurrentUser &&
      !$scope.layout.isUserGuest
    );
  };

  $scope.showNoMatches = function () {
    return (
      $scope.results.length < 1 &&
      !$scope.layout.resultsLoading &&
      !$scope.layout.isKeywordTooShort &&
      !$scope.layout.unsafeInputDetected
    );
  };

  $scope.openProfile = function (user, event) {
    $window.location.href = user.profileUrl;
    firePlayerClickTileEvent(user);
    event.preventDefault();
    event.stopPropagation();
  };

  $scope.addFriend = function addFriend(user) {
    const targetUser = user;
    const playerId = targetUser.id;
    return playerSearchService.addFriend(playerId).then(
      function res(data) {
        if (data.success) {
          // need to update friendship status we have for this user
          targetUser.FriendshipStatus = $scope.layout.friendship.PendingOnOtherUser;
          firePlayerAddFriendEvent(targetUser);
        } else {
          $log.debug('add friend failed: ', data.message);
          systemFeedbackService.warning(data.message);
        }
      },
      function err(response) {
        const { data } = response;
        if (response.status === 429) {
          systemFeedbackService.warning(response.statusText);
        } else {
          const errMsg = data.errors[0].userFacingMessage;
          $log.debug('add friend failed: ', errMsg);
          if (errMsg) {
            systemFeedbackService.warning(errMsg);
          }
        }
      }
    );
  };

  $scope.acceptFriend = function acceptFriend(user) {
    const targetUser = user;
    const invitationId = $scope.pageData.currentUserId;
    return playerSearchService.acceptFriend(targetUser.id, invitationId).then(
      function res(_data) {
        // need to update friendship status we have for this user
        targetUser.FriendshipStatus = $scope.layout.friendship.Friends;
        firePlayerAcceptFriendEvent(targetUser);
      },
      function err(response) {
        $log.debug('accept friend failed: ', response);
        if (response && response.errors && response.errors[0]) {
          const error = response.errors[0];
          if (error.userFacingMessage) {
            systemFeedbackService.warning(error.userFacingMessage);
          }
        }
      }
    );
  };

  $scope.startChat = function startChat(friendId) {
    const chatPermissionVerifier = chatDispatchService.buildPermissionVerifier($scope.pageData);
    chatDispatchService.startChat(friendId, chatPermissionVerifier);
  };

  $scope.joinGame = function joinGame(user) {
    if (user && user.userId) {
      try {
        Roblox.GameLauncher.followPlayerIntoGame(user.userId);
      } catch (e) {
        googleAnalyticsEventsService.fireEvent('Protocol', 'Launch Failure', 'follow', 0);
      }
    }
  };

  $scope.adRefresh = function adRefresh() {
    abpService.refreshAllAds();
  };

  $scope.startNewSearch = function startNewSearch(event) {
    // remove focus.
    if (event && event.target) {
      event.target.blur();
    }
    const newLoc = $location.search();
    Object.assign(newLoc, {
      keyword: $scope.formData.keyword
    });
    // change the url to trigger new search.
    $location.search(newLoc);
  };

  $scope.getNextScrollResults = function getNextScrollResults() {
    if ($scope.pageData.nextPageCursor && !$scope.layout.resultsLoading) {
      // If we have a next page to load, and we're not already loading the results, start loading them.
      $log.debug('scroll called');
      $scope.layout.resultsLoading = true;
      playerSearchService
        .getSearchResults($scope.pageData.keyword, $scope.pageData.nextPageCursor)
        .then(function success(data) {
          processPageDetails(data);
          processResults(data.processedResult || [], $scope.pageData.keyword);
          $scope.getNextScrollResultsIfEmptySpace();
        });
    }
  };

  $scope.getNextScrollResultsIfEmptySpace = function getNextScrollResultsIfEmptySpace() {
    // Currently we fetch 12 results. Recursively call getNextScrollResults to fill large screens.
    const windowHeight = $window.innerHeight;
    const contentHeight = document.querySelector('body').scrollHeight;
    if (windowHeight * 0.8 > contentHeight) {
      $scope.getNextScrollResults();
    }
  };

  $scope.getSanitizedValue = function getSanitizedValue(val) {
    return val && val.escapeHTML();
  };

  $scope.init = function init() {
    $scope.layout.isDisplayNamesEnabled = DisplayNames.Enabled(); // DisplayNames.Enabled();
    $scope.layout.resultsLoading = true;
    setupAds();

    // reset stuff.
    const { keyword } = $location.search();
    const searchKeyword = keyword || '';
    resetPageValuesOnNewKeyword();
    const deviceMeta = new DeviceMeta();
    $scope.layout.friendship = playerSearchConstants.friendshipStatus;
    $scope.layout.inMobile = deviceMeta.isPhone;
    $scope.layout.isUserGuest = !CurrentUser.isAuthenticated;
    $scope.layout.isKeywordTooShort =
      searchKeyword.length < playerSearchConstants.pageData.keywordMinLength;

    // Trigger search
    if ($scope.layout.isKeywordTooShort) {
      // pass in empty data to processPageDetails so that scope values are set.
      processPageInitData(searchKeyword, {});
    } else {
      playerSearchService.getSearchResults(searchKeyword, '').then(function success(data) {
        processPageInitData(searchKeyword, data);
      });
    }

    const callbacks = {
      [realtimeService.notificationTypes.friendshipNotifications.friendshipRequested]:
        $scope.respondToFriendRequest,
      [realtimeService.notificationTypes.friendshipNotifications.friendshipCreated]:
        $scope.respondToFriendAccepted,
      [realtimeService.notificationTypes.friendshipNotifications.friendshipDestroyed]:
        $scope.respondToRemoveFriend
    };
    realtimeService.listenToNotification(
      realtimeService.realTimeTypes.friendshipNotifications,
      callbacks
    );
  };

  function processPageInitData(keyword, resultData) {
    $scope.pageData.keyword = keyword;
    $scope.formData.keyword = keyword;
    $scope.layout.useInfiniteScroll = resultData.paginationMethod === 'Scroll';
    processPageDetails(resultData);
    processResults(resultData.processedResult || [], keyword);
    if ($scope.layout.useInfiniteScroll) {
      $scope.getNextScrollResultsIfEmptySpace();
    }
    if (!$scope.pageData.initialized) {
      $scope.pageData.initialized = true;
    }
  }

  // detect new searches and page updates.
  $scope.$on('$locationChangeSuccess', function (e, current, prev) {
    $log.debug('url changed: ', e, current, prev);
    // do this only after initial page load.
    if ($scope.pageData.initialized) {
      // we have a new search.
      $scope.init();
      $scope.adRefresh();
    }
  });

  $scope.transitionFriendState = function (targetId, initiatorId, newFriendState) {
    // check that the target of the event is the current user
    if (targetId.toString() === CurrentUser.userId) {
      // check that the iniator of the event is in our freinds search results
      // update the ui with the resulting state if it is
      for (var result of $scope.results) {
        if (result.id === initiatorId) {
          $scope.$evalAsync(() => {
            result.FriendshipStatus = newFriendState;
          });
          break;
        }
      }
    }
  };

  $scope.respondToFriendRequest = function (data) {
    const from = data.EventArgs.UserId1;
    const to = data.EventArgs.UserId2;
    $scope.transitionFriendState(
      to,
      from,
      playerSearchConstants.friendshipStatus.PendingOnCurrentUser
    );
    $scope.transitionFriendState(
      from,
      to,
      playerSearchConstants.friendshipStatus.PendingOnOtherUser
    );
  };

  $scope.respondToFriendAccepted = function (data) {
    const accepter = data.EventArgs.UserId2;
    const requester = data.EventArgs.UserId1;
    $scope.transitionFriendState(
      requester,
      accepter,
      playerSearchConstants.friendshipStatus.Friends
    );
    $scope.transitionFriendState(
      accepter,
      requester,
      playerSearchConstants.friendshipStatus.Friends
    );
  };

  $scope.respondToRemoveFriend = function (data) {
    const target = data.EventArgs.UserId2;
    const requester = data.EventArgs.UserId1;
    $scope.transitionFriendState(
      target,
      requester,
      playerSearchConstants.friendshipStatus.NoFriendship
    );
    $scope.transitionFriendState(
      requester,
      target,
      playerSearchConstants.friendshipStatus.NoFriendship
    );
  };

  $scope.showVerifiedBadge = function (user) {
    return user && user.hasVerifiedBadge && !user.AreNamesLoading;
  };

  // Init
  playerSearchService.isChatEntrypointEnabled().then(function (isEnabled) {
    $scope.layout.isChatEntrypointEnabled = isEnabled;
  });

  $scope.init();
  /* -----------------------
            Utility functions
            -------------------------- */

  function resetPageValuesOnNewKeyword() {
    // we don't want to reset everything, just things that should change
    // when new keyword is searched for.
    $scope.results = [];
    $scope.layout.unsafeInputDetected = false;
    $scope.pageData.nextPageCursor = '';
    $scope.pageData.keyword = null;
  }

  function setupAds() {
    if (!$scope.pageData.adsInitialized) {
      $scope.pageData.adsInitialized = true;
      abpService.registerAd(abpService.adIds.leaderboardAbp);
    }
  }

  // this function handles paging stuff like how many results are showing, etc.
  function processPageDetails(resultData) {
    const deviceMeta = new DeviceMeta();
    const pageData = {
      nextPageCursor: resultData.nextPageCursor,
      currentUserId: CurrentUser.userId,
      inApp: deviceMeta.isInApp,
      inAndroidApp: deviceMeta.isAndroidApp,
      iniOSApp: deviceMeta.isIosApp,
      inUniversalApp: deviceMeta.isUniversalApp,
      inMobileOrTabletBrowser: (deviceMeta.isPhone || deviceMeta.isTablet) && !deviceMeta.isInApp,
      keywordMinLength: playerSearchConstants.pageData.keywordMinLength
    };

    Object.assign($scope.pageData, pageData);
  }

  function getMatchingPreviousName(user, keyword) {
    if (user.previousUsernames.length > 0) {
      const lowerKeyword = keyword.toLowerCase();
      return user.previousUsernames
        .map(function (name) {
          return name.trim().toLowerCase();
        })
        .find(function (name) {
          return name.indexOf(lowerKeyword) === 0 && name !== user.Username;
        });
    }
    return null;
  }

  function processUserProfiles(data, keyword) {
    const userProfileFields = [
      UserProfileField.Names.CombinedName,
      UserProfileField.Names.Username
    ];

    data.forEach(user => {
      // Names should be coming from the user-profile service
      delete user.name;
      delete user.displayName;
      user.AreNamesLoading = true;
    });

    userProfilesService
      .watchUserProfiles(
        data.map(user => user.id),
        userProfileFields
      )
      .subscribe(({ error, data: userProfileData }) => {
        if (error) {
          $log.debug('user profile failure', error);
        }

        data.forEach(user => {
          if (userProfileData) {
            user.PrimaryName = userProfileData[user.id].names.combinedName;
            user.Username = userProfileData[user.id].names.username;
            user.MatchingPreviousName = getMatchingPreviousName(user, keyword);
            user.AreNamesLoading = false;
          }
        });
      });
  }

  function processResults(data, keyword) {
    const existingCount = $scope.results.length;
    data.forEach(function (user, index) {
      if (CurrentUser.isAuthenticated) {
        Presence.getPresenceProvider().subscribeToPresenceChanges(
          [user.id],
          p => {
            $scope.$evalAsync(() => {
              user.gameId = p.gameId;
              user.userPresenceType = p.userPresenceType;
            });
            if (p.universeId) {
              playerSearchService.gamePlayabilityRequest([p.universeId]).then(results => {
                $scope.$evalAsync(() => {
                  user.gameIsPlayable = results[0]?.isPlayable;
                });
              });
            }
          },
          false
        );
      }
      processUserProfiles(data, keyword);

      // status is ambiguous, rename to Friendship status to make more descriptive
      user.FriendshipStatus = user.status;
      delete user.status;

      // absPos is sent with event stream events.
      // It is intended to match the index on the page of where the user is located,
      // so we can determine how many search results a player went through.
      user.absPos = existingCount + index;

      firePlayerTileImpressionEvent(user);
    });

    // assign to scope. or extend it
    $scope.results = $scope.results.concat(data);

    // and then make sure the loading indicator is removed
    $scope.layout.resultsLoading = false;

    $log.debug('my data', $scope.results);
  }

  function firePlayerTileImpressionEvent(targetUser) {
    EventStream.SendEventWithTarget(
      playerSearchConstants.eventNames.playerTileImpression,
      playerSearchConstants.playerSearchEventCtx,
      {
        uid: $scope.pageData.currentUserId,
        playerId: targetUser.id,
        absPos: targetUser.absPos
      },
      EventStream.TargetTypes.WWW
    );
  }

  function firePlayerClickTileEvent(targetUser) {
    EventStream.SendEventWithTarget(
      playerSearchConstants.eventNames.playerTileClick,
      playerSearchConstants.playerSearchEventCtx,
      {
        uid: $scope.pageData.currentUserId,
        playerId: targetUser.id,
        absPos: targetUser.absPos
      },
      EventStream.TargetTypes.WWW
    );
  }

  function firePlayerAcceptFriendEvent(targetUser) {
    EventStream.SendEventWithTarget(
      playerSearchConstants.eventNames.playerFriendAccept,
      playerSearchConstants.playerSearchEventCtx,
      {
        uid: $scope.pageData.currentUserId,
        playerId: targetUser.id,
        absPos: targetUser.absPos
      },
      EventStream.TargetTypes.WWW
    );
  }

  function firePlayerAddFriendEvent(targetUser) {
    EventStream.SendEventWithTarget(
      playerSearchConstants.eventNames.playerFriendAdd,
      playerSearchConstants.playerSearchEventCtx,
      {
        uid: $scope.pageData.currentUserId,
        playerId: targetUser.id,
        absPos: targetUser.absPos
      },
      EventStream.TargetTypes.WWW
    );
  }
}

playerSearchModule.controller('playerSearchController', playerSearchController);
export default playerSearchController;
