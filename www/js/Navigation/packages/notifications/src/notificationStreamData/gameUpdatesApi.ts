import environmentUrls from "@rbx/environment-urls";

const { notificationApi, gamesApi, followingsApi, websiteUrl } = environmentUrls;

export const GAME_UPDATE_BATCH_SIZE = 100;
export const PLACE_DETAIL_BATCH_SIZE = 100;
export const GAME_NAME_MAX_LENGTH = 30;

export type GameUpdateMetadata = {
  UniverseId: number;
  GameName?: string;
};

export type LatestGameUpdate = {
  universeId: number;
  rootPlaceId: number | null;
  universeName: string;
  content: string;
  createdOn: string;
  createdOnKey?: string;
};

export type PlaceDetail = {
  placeId: number;
  universeId: number;
  isPlayable: boolean;
};

type UrlConfig = { url: string; withCredentials: boolean; retryable: boolean };

const repeatParams = (name: string, values: (number | string)[]): string => {
  const params = new URLSearchParams();
  values.forEach(value => params.append(name, String(value)));
  return params.toString();
};

export const getLatestGameUpdatesUrlConfig = (universeIds: number[]): UrlConfig => ({
  url: `${notificationApi}/v2/stream-notifications/get-latest-game-updates?${repeatParams(
    "universeIds",
    universeIds,
  )}`,
  withCredentials: true,
  retryable: true,
});

export const multiGetPlaceDetailsUrlConfig = (placeIds: number[]): UrlConfig => ({
  url: `${gamesApi}/v1/games/multiget-place-details?${repeatParams("placeIds", placeIds)}`,
  withCredentials: true,
  retryable: true,
});

export type GameFollowing = { universeId: number };

export const gameFollowingsUrlConfig = (userId: number): UrlConfig => ({
  url: `${followingsApi}/v1/users/${userId}/universes`,
  withCredentials: true,
  retryable: true,
});

export const streamMetadataUrlConfig: UrlConfig = {
  url: `${notificationApi}/v2/stream-notifications/metadata`,
  withCredentials: true,
  retryable: true,
};

export type StreamMetadata = { canLaunchGameFromGameUpdate?: boolean };

export const GAME_UPDATE_NOTIF_TYPE = "gameUpdate";

export const GAME_UPDATE_NS_PAGES = {
  main: "main",
  gameUpdates: "gameUpdates",
} as const;

export type GameUpdateNsPage = (typeof GAME_UPDATE_NS_PAGES)[keyof typeof GAME_UPDATE_NS_PAGES];

export const GAME_UPDATE_INTERACTIONS = {
  seen: "Seen",
  played: "Played",
  unfollowed: "Unfollowed",
} as const;

export type GameUpdateInteraction =
  (typeof GAME_UPDATE_INTERACTIONS)[keyof typeof GAME_UPDATE_INTERACTIONS];

export const gameUpdateInteractedUrlConfig: { url: string; withCredentials: boolean } = {
  url: `${notificationApi}/v2/stream-notifications/game-update-notification-interacted`,
  withCredentials: true,
};

export const followUniverseUrlConfig = (userId: number, universeId: number): UrlConfig => ({
  url: `${followingsApi}/v1/users/${userId}/universes/${universeId}`,
  withCredentials: true,
  retryable: false,
});

export const gameDetailsHref = (rootPlaceId: number, originatorId: number | null): string =>
  `${websiteUrl}/games/${rootPlaceId}?originatorType=GameUpdateNotification&originatorId=${originatorId}`;

type AbuseReportGlobals = {
  AbuseReportDispatcher?: { triggerUrlAction?: (url: string) => void };
};

export const openAbuseReport = (url: string): void => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const globals = (window as unknown as { Roblox?: AbuseReportGlobals }).Roblox ?? {};
  if (globals.AbuseReportDispatcher?.triggerUrlAction) {
    globals.AbuseReportDispatcher.triggerUrlAction(url);
    return;
  }
  window.location.href = url;
};

export const abuseReportHref = (universeId: number, redirectUrl: string): string =>
  `${websiteUrl}/abusereport/gameupdate?id=${universeId}&redirectUrl=${encodeURIComponent(
    redirectUrl,
  )}`;

// The notification API serializes this endpoint's dates as either ISO or "/Date(1479348465027)/",
// so a bare `new Date()` yields NaN on the latter. Mirrors Angular's
// notificationStreamUtility.parseEpochMilliseconds, including the null on unparseable input.
export const parseEpochMilliseconds = (dateTime: string | null | undefined): number | null => {
  if (!dateTime) {
    return null;
  }
  const serialized = /Date\((\d+)\)/.exec(dateTime);
  if (serialized?.[1]) {
    return parseInt(serialized[1], 10);
  }
  return new Date(dateTime).getTime() || null;
};

export const truncateGameName = (gameName: string): string =>
  gameName && gameName.length > GAME_NAME_MAX_LENGTH
    ? `${gameName.substring(0, GAME_NAME_MAX_LENGTH - 3)}...`
    : gameName;
