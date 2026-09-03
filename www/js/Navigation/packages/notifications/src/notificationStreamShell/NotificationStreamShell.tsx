import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import environmentUrls from "@rbx/environment-urls";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@rbx/core-scripts/react";
import NotificationStreamBanner from "./NotificationStreamBanner";
import {
  NotificationLocalizationProvider,
  useNotificationLocalization,
} from "../sendrNotificationStream/context/NotificationsLocalization";
import { NotificationStreamList } from "../notificationStreamList";
import {
  useGetRecentNotifications,
  useMarkInteracted,
  useRemoveNotification,
  useNotificationStreamRealtime,
  useNotificationStreamConnection,
  sendUnreadCta,
  sendStreamEvent,
  sendRecentGameUpdateRetrieved,
  sendPageChanged,
  streamEvents,
  streamContexts,
} from "../notificationStreamData";
import {
  GAME_UPDATE_NS_PAGES,
  GameUpdateMetadata,
  GameUpdateNsPage,
} from "../notificationStreamData/gameUpdatesApi";
import { useGameUpdates, markGameUpdateSeenOnce } from "../notificationStreamData/useGameUpdates";
import { aggregateGameUpdates } from "../notificationStreamData/aggregateGameUpdates";
import { useStreamMetadata } from "../notificationStreamData/useStreamMetadata";
import GameUpdatesPanel from "./GameUpdatesPanel";
import { NotificationStreamCardRouter } from "./NotificationStreamCardRouter";
import { reportNotificationStreamError } from "../notificationStreamData/notificationStreamObservability";
import NotificationStreamModalContainer from "../sendrNotificationStream/containers/NotificationStreamModalContainer";
import { SendrTemplateContext } from "../sendrNotificationStream/context/SendrTemplateContext";
import "./notificationStreamShell.scss";

const { websiteUrl } = environmentUrls;
const SETTINGS_LINK = `${websiteUrl}/my/account#!/notifications`;
const MAX_HEIGHT = 600;
const RECENT_GAME_UPDATE_WINDOW_MS = 86400 * 14 * 1000;

const NotificationStreamShellInner = (): JSX.Element => {
  const translate = useNotificationLocalization();
  const {
    notifications,
    gameUpdates,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useGetRecentNotifications();
  const { models: gameUpdateModels, isLoading: isResolvingGameUpdates } =
    useGameUpdates(gameUpdates);
  const { canLaunchGameFromGameUpdate } = useStreamMetadata();
  const [showGameUpdates, setShowGameUpdates] = useState(false);

  const selectContentView = useCallback(
    (view: GameUpdateNsPage): void => {
      const current = showGameUpdates
        ? GAME_UPDATE_NS_PAGES.gameUpdates
        : GAME_UPDATE_NS_PAGES.main;
      if (current === view) {
        return;
      }
      sendPageChanged(view);
      setShowGameUpdates(view === GAME_UPDATE_NS_PAGES.gameUpdates);
    },
    [showGameUpdates],
  );

  const aggregatedGameUpdate = useMemo(
    () => aggregateGameUpdates(gameUpdates, gameUpdateModels, isResolvingGameUpdates),
    [gameUpdates, gameUpdateModels, isResolvingGameUpdates],
  );

  const rows = useMemo(() => {
    if (!aggregatedGameUpdate) {
      return notifications;
    }
    const stamp = new Date(aggregatedGameUpdate.eventDate).getTime();
    const merged = [...notifications];
    const at = merged.findIndex(n => new Date(n.eventDate).getTime() < stamp);
    merged.splice(at === -1 ? merged.length : at, 0, aggregatedGameUpdate);
    return merged;
  }, [notifications, aggregatedGameUpdate]);

  const loggedRetrievalRef = useRef("");
  useEffect(() => {
    if (!aggregatedGameUpdate || isResolvingGameUpdates || gameUpdateModels.size === 0) {
      return;
    }
    const universeIds = (aggregatedGameUpdate.metadataCollection as GameUpdateMetadata[]).map(
      meta => meta.UniverseId,
    );
    const signature = `${aggregatedGameUpdate.id}:${universeIds.join(",")}`;
    if (loggedRetrievalRef.current === signature) {
      return;
    }
    loggedRetrievalRef.current = signature;

    const cutoff = Date.now() - RECENT_GAME_UPDATE_WINDOW_MS;
    const recentGroupedNotificationCount = [...gameUpdateModels.values()].filter(
      model => (model.createdOn ?? 0) >= cutoff,
    ).length;
    sendRecentGameUpdateRetrieved(aggregatedGameUpdate.id, recentGroupedNotificationCount);

    const onlyUniverseId = universeIds.length === 1 ? universeIds[0] : undefined;
    if (onlyUniverseId != null) {
      const model = gameUpdateModels.get(onlyUniverseId);
      if (model) {
        markGameUpdateSeenOnce(model);
      }
    }
  }, [aggregatedGameUpdate, gameUpdateModels, isResolvingGameUpdates]);
  const { isConnectionLost } = useNotificationStreamConnection();
  const markInteracted = useMarkInteracted();
  const removeNotification = useRemoveNotification();
  const [bannerVisible, setBannerVisible] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [errorDismissed, setErrorDismissed] = useState(false);

  const fireAndReport = useCallback((run: () => Promise<unknown>, scope: string) => {
    try {
      Promise.resolve(run()).catch((error: unknown) => reportNotificationStreamError(scope, error));
    } catch (error) {
      reportNotificationStreamError(scope, error);
    }
  }, []);

  useNotificationStreamRealtime({
    onNewNotification: () => {
      setNewCount(count => {
        const next = count + 1;
        sendUnreadCta(next, true);
        return next;
      });
      setBannerVisible(true);
    },
    onNotificationRevoked: () => {
      fireAndReport(refetch, "streamRevokedRefetch");
    },
  });

  const dismissBanner = useCallback(() => {
    setBannerVisible(false);
    setNewCount(0);
  }, []);

  const reload = useCallback(() => {
    dismissBanner();
    fireAndReport(refetch, "streamBannerReload");
  }, [dismissBanner, refetch, fireAndReport]);

  // A dismissed error banner must reappear on the next disconnect, so reset once reconnected.
  useEffect(() => {
    if (!isConnectionLost) {
      setErrorDismissed(false);
    }
  }, [isConnectionLost]);

  const renderItem = useCallback(
    (notification: (typeof rows)[number]) => (
      <div style={{ marginBottom: 8 }}>
        <NotificationStreamCardRouter
          notification={notification}
          onInteract={(id: string) => markInteracted.mutate(id)}
          onRemove={removeNotification}
          onActionFailed={() => {
            fireAndReport(refetch, "streamActionFailedRefetch");
          }}
          gameUpdateModels={gameUpdateModels}
          onViewGameUpdates={() => selectContentView(GAME_UPDATE_NS_PAGES.gameUpdates)}
          canLaunchGameFromGameUpdate={canLaunchGameFromGameUpdate}
        />
      </div>
    ),
    [
      markInteracted,
      removeNotification,
      refetch,
      fireAndReport,
      gameUpdateModels,
      canLaunchGameFromGameUpdate,
      selectContentView,
    ],
  );

  return (
    <SendrTemplateContext.Provider value>
      <div>
        <div className="notification-stream-base builder-font">
          {showGameUpdates ? (
            <GameUpdatesPanel
              models={gameUpdateModels}
              onBack={() => selectContentView(GAME_UPDATE_NS_PAGES.main)}
              onInteract={() => undefined}
              canLaunch={canLaunchGameFromGameUpdate}
            />
          ) : (
            <React.Fragment>
              <div className="notification-stream-header">
                <span className="text-label font-caption-header">
                  {translate("Label.Notifications")}
                </span>
                <a
                  className="text-link font-caption-header"
                  href={SETTINGS_LINK}
                  onClick={() =>
                    sendStreamEvent(streamEvents.goToSettingPage, streamContexts.click, {
                      sendrVersion: 0,
                    })
                  }
                >
                  {translate("Label.Settings")}
                </a>
              </div>

              {bannerVisible && (
                <NotificationStreamBanner
                  variant="new"
                  message={translate("Message.NumberofNewNotifications", {
                    notificationCount: newCount,
                  })}
                  onClick={reload}
                  onDismiss={dismissBanner}
                />
              )}

              {isConnectionLost && !errorDismissed && (
                <NotificationStreamBanner
                  variant="error"
                  message={translate("Label.NoNetworkConnectionText")}
                  onDismiss={() => setErrorDismissed(true)}
                />
              )}

              <div style={{ position: "relative" }}>
                <NotificationStreamList
                  className="notification-stream-scroll"
                  items={rows}
                  getKey={notification => notification.id}
                  renderItem={renderItem}
                  hasMore={Boolean(hasNextPage)}
                  isLoading={isLoading || isFetchingNextPage}
                  onLoadMore={() => {
                    fireAndReport(fetchNextPage, "streamFetchNextPage");
                  }}
                  loadingIndicator={<span className="spinner spinner-sm" />}
                  emptyState={<span className="text">{translate("Label.AllCaughtUp")}</span>}
                  maxHeight={MAX_HEIGHT}
                  ariaLabel={translate("Label.Notifications")}
                />
                <NotificationStreamModalContainer />
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
    </SendrTemplateContext.Provider>
  );
};

export const NotificationStreamShell = (): JSX.Element => (
  <QueryClientProvider client={queryClient}>
    <NotificationLocalizationProvider>
      <NotificationStreamShellInner />
    </NotificationLocalizationProvider>
  </QueryClientProvider>
);

export default NotificationStreamShell;
