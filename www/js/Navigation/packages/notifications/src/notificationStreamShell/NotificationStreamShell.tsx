import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import environmentUrls from "@rbx/environment-urls";
import NotificationStreamBanner from "./NotificationStreamBanner";
import { useNotificationLocalization } from "../sendrNotificationStream/context/NotificationsLocalization";
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
import { useGameUpdates } from "../notificationStreamData/useGameUpdates";
import { aggregateGameUpdates } from "../notificationStreamData/aggregateGameUpdates";
import { useStreamMetadata } from "../notificationStreamData/useStreamMetadata";
import { streamGet } from "../notificationStreamData/streamTransport";
import { unreadCountUrlConfig } from "../notificationStreamData/notificationStreamApi";
import { getNotificationStreamHost } from "../notificationStreamData/streamHost";
import GameUpdatesPanel from "./GameUpdatesPanel";
import { NotificationStreamCardRouter } from "./NotificationStreamCardRouter";
import { reportNotificationStreamError } from "../notificationStreamData/notificationStreamObservability";
import NotificationStreamModalContainer from "../sendrNotificationStream/containers/NotificationStreamModalContainer";
import { SendrTemplateContext } from "../sendrNotificationStream/context/SendrTemplateContext";
import "./notificationStreamShell.css";
import type { JSX } from "react";

const { websiteUrl } = environmentUrls;
const SETTINGS_LINK = `${websiteUrl}/my/account#!/notifications`;
const MAX_HEIGHT = 600;
const RECENT_GAME_UPDATE_WINDOW_MS = 86400 * 14 * 1000;

const NotificationStreamShellInner = (): JSX.Element => {
  const translate = useNotificationLocalization();
  const { callGuacBehaviour, getDeviceMeta } = getNotificationStreamHost();
  const isPhone = getDeviceMeta()?.isPhone ?? false;
  const { data: accountSettingsPolicy } = useQuery({
    queryKey: ["notification-stream-account-settings-ui"],
    queryFn: () =>
      callGuacBehaviour<{ displayReactNotificationsTab?: boolean }>("account-settings-ui"),
    staleTime: Infinity,
  });
  const showSettingsLink = Boolean(accountSettingsPolicy?.displayReactNotificationsTab);
  const {
    notifications,
    gameUpdates,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    reload: resetStream,
  } = useGetRecentNotifications();
  const { models: gameUpdateModels, isLoading: isResolvingGameUpdates } =
    useGameUpdates(gameUpdates);
  const { canLaunchGameFromGameUpdate, disconnectionDelayMs } = useStreamMetadata();
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
  }, [aggregatedGameUpdate, gameUpdateModels, isResolvingGameUpdates]);
  const { isConnectionLost } = useNotificationStreamConnection(disconnectionDelayMs);
  const markInteracted = useMarkInteracted();
  const removeNotification = useRemoveNotification();
  const [bannerVisible, setBannerVisible] = useState(false);
  const [newCount, setNewCount] = useState<number | null>(null);
  const [errorDismissed, setErrorDismissed] = useState(false);

  const fireAndReport = useCallback((run: () => Promise<unknown>, scope: string) => {
    try {
      Promise.resolve(run()).catch((error: unknown) => reportNotificationStreamError(scope, error));
    } catch (error) {
      reportNotificationStreamError(scope, error);
    }
  }, []);

  const dismissBanner = useCallback(() => {
    setBannerVisible(false);
    setNewCount(null);
  }, []);

  const reload = useCallback(() => {
    setBannerVisible(false);
    setNewCount(null);
    document.dispatchEvent(new CustomEvent("Roblox.NotificationStream.ClearUnreadNotifications"));
    fireAndReport(resetStream, "streamBannerReload");
  }, [resetStream, fireAndReport]);

  // notificationStreamBodyDirective.js: true while the last click or touch landed in the stream body,
  // which excludes the header.
  const bodyRef = useRef<HTMLDivElement>(null);
  const bodyInteractedRef = useRef(false);
  useEffect(() => {
    const onPointer = (event: Event) => {
      const { target } = event;
      // .NET's React 17 has already removed a target its own click handler unmounts; React 19 commits in a microtask
      queueMicrotask(() => {
        bodyInteractedRef.current =
          target instanceof Element &&
          Boolean(bodyRef.current?.contains(target)) &&
          !target.closest(".notification-stream-header");
      });
    };
    document.addEventListener("click", onPointer);
    document.addEventListener("touchstart", onPointer);
    return () => {
      document.removeEventListener("click", onPointer);
      document.removeEventListener("touchstart", onPointer);
    };
  }, []);

  const refreshUnreadCount = useCallback(() => {
    streamGet<{ unreadNotifications?: number }>(unreadCountUrlConfig)
      .then(data => {
        const count = data?.unreadNotifications;
        if (typeof count !== "number") {
          return;
        }
        setNewCount(count);
        if (count > 0) {
          sendUnreadCta(count, true);
        }
      })
      .catch(() => undefined);
  }, []);

  useNotificationStreamRealtime({
    onNewNotification: () => {
      refreshUnreadCount();
      setBannerVisible(true);
    },
    onNotificationRevoked: () => {
      refreshUnreadCount();
      if (!bodyInteractedRef.current) {
        reload();
      }
    },
  });

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
          gameUpdateModels={gameUpdateModels}
          onViewGameUpdates={() => selectContentView(GAME_UPDATE_NS_PAGES.gameUpdates)}
          canLaunchGameFromGameUpdate={canLaunchGameFromGameUpdate}
        />
      </div>
    ),
    [
      markInteracted,
      removeNotification,
      gameUpdateModels,
      canLaunchGameFromGameUpdate,
      selectContentView,
    ],
  );

  return (
    <SendrTemplateContext.Provider value>
      <div>
        <div ref={bodyRef} className="notification-stream-base builder-font">
          {showGameUpdates ? (
            <GameUpdatesPanel
              models={gameUpdateModels}
              onBack={() => selectContentView(GAME_UPDATE_NS_PAGES.main)}
              onInteract={() => undefined}
              canLaunch={canLaunchGameFromGameUpdate}
            />
          ) : (
            <React.Fragment>
              {!isPhone && (
                <div className="notification-stream-header">
                  <span className="text-label font-caption-header">
                    {translate("Label.Notifications")}
                  </span>
                  {showSettingsLink && (
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
                  )}
                </div>
              )}

              {bannerVisible && (
                <NotificationStreamBanner
                  variant="new"
                  message={
                    newCount == null
                      ? ""
                      : translate("Message.NumberofNewNotifications", {
                          notificationCount: newCount,
                        })
                  }
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
                    fireAndReport(
                      () => fetchNextPage({ cancelRefetch: false }),
                      "streamFetchNextPage",
                    );
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

export const NotificationStreamShell = (): JSX.Element => <NotificationStreamShellInner />;

export default NotificationStreamShell;
