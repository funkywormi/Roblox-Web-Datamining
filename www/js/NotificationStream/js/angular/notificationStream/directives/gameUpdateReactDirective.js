import { GameLauncher, NotificationStreamService } from 'Roblox';
import { urlService } from 'core-utilities';
import angular from 'angular';
import notificationStreamModule from '../notificationStreamModule';

// Bridge for the React gameUpdate card. Unlike group/PM, the notification carries only a
// UniverseId; Angular resolves the gameUpdateModel (library.gameUpdateModels, populated
// async by buildGameUpdateNotifications) and injects a view-model + action handlers into
// the React mount. Action logic stays Angular's during migration (mirrors gameUpdateDirective);
// React renders + triggers. Re-renders when the async model resolves or state changes.
function gameUpdateReact(
  $window,
  $filter,
  gameUpdatesService,
  gameUpdatesUtility,
  gameUpdatesConstants,
  notificationStreamUtility,
  hybridService,
  eventStreamService
) {
  'ngInject';

  const { gameUpdateInteractions } = gameUpdatesConstants;
  const notificationType = 'gameUpdate';

  return {
    restrict: 'A',
    scope: {
      library: '=',
      appMeta: '=',
      contentViewManager: '=',
      notification: '='
    },
    link(scope, element) {
      const metaData = scope.notification.metadataCollection;
      if (!metaData || metaData.length === 0) {
        return;
      }
      const model = scope.library.gameUpdateModels[metaData[0].UniverseId];
      if (!model) {
        return;
      }

      const isAggregated = metaData.length > 1;
      const notificationId = `${model.rootPlaceId}-${model.createdOn}`;

      const getEventExtraParams = () => ({
        notifId: notificationId,
        notifType: notificationType,
        pid: model.rootPlaceId,
        sourceId: model.universeId,
        isAggregate: isAggregated,
        nsPage: scope.contentViewManager.getCurrentContentViewId(),
        sendrVersion: 0
      });

      const goToGameDetails = () => {
        eventStreamService.sendEventWithTarget(
          eventStreamService.eventNames.notificationStream.goToGameDetails,
          eventStreamService.context.click,
          getEventExtraParams()
        );
        if (scope.library.inApp) {
          hybridService.navigateToFeature({ feature: 'GameDetails', urlPath: model.gameLinkUrlForApp });
        } else {
          $window.location.href = urlService.getAbsoluteUrl(model.gameLinkUrl);
        }
      };

      const playButtonHandler = () => {
        gameUpdatesService.markGameUpdateInteractedAsync(
          model.universeId,
          model.createdOnKey,
          gameUpdateInteractions.played,
          scope.library.currentUserId
        );
        if (scope.library.inApp) {
          hybridService.launchGame({ placeId: model.rootPlaceId, requestType: 'RequestGame', isPartyLeader: false });
        } else {
          GameLauncher.joinMultiplayerGame(model.rootPlaceId, true, false);
        }
        eventStreamService.sendEventWithTarget(
          eventStreamService.eventNames.notificationStream.launchExperience,
          eventStreamService.context.click,
          getEventExtraParams()
        );
      };

      const viewGameUpdates = () => {
        // Invoked from a React click (no digest). $apply so the ng-show drilldown switch takes
        // effect immediately, even on repeat clicks where every model is already seen.
        scope.$apply(() => {
          scope.contentViewManager.selectContentView(scope.library.notificationContentViews.gameUpdates);
          angular.forEach(scope.library.gameUpdateModels, function (m) {
            if (!m.seen) {
              gameUpdatesService
                .markGameUpdateInteractedAsync(m.universeId, m.createdOnKey, gameUpdateInteractions.seen, scope.library.currentUserId)
                .then(function () {
                  m.seen = true;
                });
            }
          });
        });
      };

      const unfollowGame = () => {
        eventStreamService.sendEventWithTarget(
          eventStreamService.eventNames.notificationStream.unfollow,
          eventStreamService.context.click,
          getEventExtraParams()
        );
        gameUpdatesService.unfollowGameAsync(scope.library.currentUserId, model.universeId).then(function () {
          model.isUnfollowed = true;
          gameUpdatesService.markGameUpdateInteractedAsync(
            model.universeId,
            model.createdOnKey,
            gameUpdateInteractions.unfollowed,
            scope.library.currentUserId
          );
          renderNow();
        });
      };

      const followGame = () => {
        eventStreamService.sendEventWithTarget(
          eventStreamService.eventNames.notificationStream.follow,
          eventStreamService.context.click,
          getEventExtraParams()
        );
        gameUpdatesService.followGameAsync(scope.library.currentUserId, model.universeId).then(function () {
          model.isUnfollowed = false;
          if (!model.updateMessage) {
            gameUpdatesUtility.getGameUpdatesAsync([model.universeId], scope.library.gameUpdateModels, null);
          }
          renderNow();
        });
      };

      const reportAbuse = () => {
        gameUpdatesService.reportAbuse(model.universeId, new Date(model.createdOn));
        eventStreamService.sendEventWithTarget(
          eventStreamService.eventNames.notificationStream.report,
          eventStreamService.context.click,
          getEventExtraParams()
        );
      };

      const metaActionsOpenChange = isOpen => {
        eventStreamService.sendEventWithTarget(
          isOpen
            ? eventStreamService.eventNames.notificationStream.openMetaActions
            : eventStreamService.eventNames.notificationStream.closeMetaActions,
          eventStreamService.context.click,
          getEventExtraParams()
        );
      };

      const handlers = {
        onPlay: playButtonHandler,
        onUnfollow: unfollowGame,
        onReport: reportAbuse,
        onGoToDetails: goToGameDetails,
        onViewUpdates: viewGameUpdates,
        onUndo: followGame,
        onMetaActionsOpenChange: metaActionsOpenChange
      };

      function buildViewModel() {
        let state = 'single';
        if (isAggregated) {
          state = 'aggregated';
        } else if (model.isUnfollowed) {
          state = 'unfollowed';
        }
        return {
          state,
          universeId: model.universeId,
          rootPlaceId: model.rootPlaceId,
          gameName: model.truncatedGameName,
          updateMessage: model.updateMessage,
          timestamp: model.createdOn ? $filter('datetime')(model.createdOn, 'full') : '',
          isInteracted: !!scope.notification.isInteracted,
          canLaunch: !!scope.library.canLaunchGameFromGameUpdate,
          isPlayable: model.isPlayable !== false,
          // Raw game names; React escapes + bolds them (Angular pre-formatted HTML for ng-bind-html).
          aggregation: isAggregated
            ? {
                gameOne: metaData[0].GameName,
                gameTwo: metaData[1].GameName,
                otherCount: scope.notification.eventCount - 2
              }
            : undefined
        };
      }

      function renderNow() {
        NotificationStreamService?.renderGameUpdateNotification(element[0], buildViewModel(), handlers);
      }

      // Render once the async model has content, and again whenever it resolves/changes.
      scope.$watch(
        () => `${model.updateMessage}|${model.isUnfollowed}|${model.createdOn}|${model.isPlayable}`,
        () => {
          if (model.updateMessage || model.isUnfollowed) {
            renderNow();
          }
        }
      );
    }
  };
}

notificationStreamModule.directive('gameUpdateReact', gameUpdateReact);

export default gameUpdateReact;
