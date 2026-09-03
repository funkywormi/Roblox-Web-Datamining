import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";

export const streamEvents = {
  openContent: "nsOpenContent",
  openCTA: "nsOpenCTAShown",
  refreshCTA: "nsRefreshCTAShown",
  notificationRetrieved: "nsNotificationRetrieved",
  notificationsBundleCreated: "nsNotificationBundleCreated",
  recentGameUpdateRetrieved: "nsRecentGameUpdateRetrieved",
  pageChanged: "nsPageChanged",
  acceptFriendRequest: "nsAcceptFriendRequest",
  ignoreFriendRequest: "nsIgnoreFriendRequest",
  viewAllFriendRequests: "nsViewAllFriendRequests",
  chat: "nsChat",
  goToProfilePage: "nsGoToProfilePage",
  goToSettingPage: "nsGoToSettingPage",
  goToMessages: "nsGoToMessages",
  goToGroupPage: "nsGoToGroup",
  goToGameDetails: "nsGoToGameDetails",
  launchExperience: "nsLaunchExperience",
  follow: "nsFollow",
  unfollow: "nsUnfollow",
  report: "nsReport",
  openMetaActions: "nsOpenMetaActions",
  closeMetaActions: "nsCloseMetaActions",
  viewDeveloperMetrics: "nsViewDevMetrics",
} as const;

export const streamContexts = {
  seen: "seen",
  click: "click",
  fetched: "fetched",
  inApp: "inApp",
} as const;

type EventProperties = Record<string, string | number | boolean | undefined>;

const eventStreamMetaData = (): EventProperties => ({
  userId: authenticatedUser()?.id ?? undefined,
  inApp: getDeviceMeta()?.isInApp ?? false,
});

export const sendStreamEvent = (
  eventName: string,
  context: string,
  properties: EventProperties = {},
): void => {
  try {
    sendEventWithTarget(eventName, context, { ...eventStreamMetaData(), ...properties });
  } catch {
    // Logging must never break the stream.
  }
};

const joinIds = (ids: string[]): string => ids.join(",");

export const sendOpenContent = (unreadCount: number, inApp = false): void =>
  sendStreamEvent(streamEvents.openContent, inApp ? streamContexts.inApp : streamContexts.click, {
    countOfUnreadNotification: unreadCount,
    sendrVersion: 0,
  });

export const sendUnreadCta = (count: number, isStreamOpen: boolean): void =>
  sendStreamEvent(
    isStreamOpen ? streamEvents.refreshCTA : streamEvents.openCTA,
    streamContexts.seen,
    { count, sendrVersion: 0 },
  );

// Angular fired this on a content-view switch, not on pagination; unused until tabs land.
export const sendPageChanged = (targetPage: string): void =>
  sendStreamEvent(streamEvents.pageChanged, streamContexts.click, { targetPage, sendrVersion: 0 });

type RetrievedNotification = {
  id: string;
  notificationSourceType?: string;
  content?: Record<string, unknown>;
};

const asString = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

const asProperties = (value: unknown): EventProperties => {
  if (typeof value !== "object" || value === null) {
    return {};
  }
  const out: EventProperties = {};
  Object.entries(value).forEach(([key, entry]) => {
    if (typeof entry === "string" || typeof entry === "number" || typeof entry === "boolean") {
      out[key] = entry;
    }
  });
  return out;
};

export const sendNotificationRetrieved = (notification: RetrievedNotification): void => {
  const { content } = notification;
  const notificationType = asString(content?.notificationType);
  const minVersion = content?.minVersion;
  // content.minVersion is a string ("1.0"); INotificationContentDefinition declares it string.
  const sendrVersion =
    typeof minVersion === "string" || typeof minVersion === "number" ? String(minVersion) : "0";
  sendStreamEvent(streamEvents.notificationRetrieved, streamContexts.fetched, {
    ...asProperties(content?.clientEventsPayload),
    sendrVersion: notificationType ? sendrVersion : "0",
    notificationType: notificationType ?? notification.notificationSourceType,
    notificationId: notification.id,
  });
};

export const sendBundleCreated = (
  bundleKey: string,
  bundleId: string,
  notificationIds: string[],
  clientEventsPayload?: Record<string, string>,
): void =>
  sendStreamEvent(streamEvents.notificationsBundleCreated, streamContexts.fetched, {
    ...clientEventsPayload,
    bundleKey,
    bundleId,
    totalNotifications: notificationIds.length,
    notificationIds: joinIds(notificationIds),
  });

export const sendCardClick = (
  eventName: string,
  notification: { id: string; notificationSourceType?: string },
  extra: EventProperties = {},
): void =>
  sendStreamEvent(eventName, streamContexts.click, {
    notificationType: notification.notificationSourceType,
    notificationId: notification.id,
    sendrVersion: 0,
    ...extra,
  });

export type GameUpdateEventParams = {
  notificationId: string;
  notificationType: string;
  rootPlaceId?: number | string;
  universeId?: number | string;
  isAggregate?: boolean;
  nsPage?: string | number;
};

export const sendGameUpdateEvent = (eventName: string, params: GameUpdateEventParams): void =>
  sendStreamEvent(eventName, streamContexts.click, {
    notifId: params.notificationId,
    notifType: params.notificationType,
    pid: params.rootPlaceId,
    sourceId: params.universeId,
    isAggregate: Boolean(params.isAggregate),
    nsPage: params.nsPage,
    sendrVersion: 0,
  });

export const sendRecentGameUpdateRetrieved = (
  notificationId: string,
  recentGroupedNotificationCount: number,
): void =>
  sendStreamEvent(streamEvents.recentGameUpdateRetrieved, streamContexts.fetched, {
    sendrVersion: "0",
    notificationType: "GameUpdate",
    notificationId,
    recentGroupedNotificationCount,
  });

export const sendDeveloperMetricsEvent = (
  eventName: string,
  notificationType: string,
  universeId: number | string,
): void =>
  sendStreamEvent(eventName, streamContexts.click, {
    notificationType,
    universeId,
    sendrVersion: 0,
  });
