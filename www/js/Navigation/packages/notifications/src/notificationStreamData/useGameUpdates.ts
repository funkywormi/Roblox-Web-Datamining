import { useQuery } from "@tanstack/react-query";
import { batchQuery } from "@rbx/core-lib/promise";
import { httpService } from "core-utilities";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { StreamNotification } from "./notificationStreamApi";
import { reportNotificationStreamError } from "./notificationStreamObservability";
import {
  GameFollowing,
  GameUpdateMetadata,
  LatestGameUpdate,
  PlaceDetail,
  GAME_UPDATE_BATCH_SIZE,
  GAME_UPDATE_INTERACTIONS,
  GameUpdateInteraction,
  gameUpdateInteractedUrlConfig,
  PLACE_DETAIL_BATCH_SIZE,
  gameFollowingsUrlConfig,
  getLatestGameUpdatesUrlConfig,
  multiGetPlaceDetailsUrlConfig,
  parseEpochMilliseconds,
  truncateGameName,
} from "./gameUpdatesApi";

export type GameUpdateModel = {
  universeId: number;
  rootPlaceId: number | null;
  gameName: string;
  truncatedGameName: string;
  updateMessage: string;
  createdOn: number | null;
  createdOnKey?: string;
  isPlayable: boolean | null;
};

export const markGameUpdateInteracted = (
  model: Pick<GameUpdateModel, "universeId" | "createdOnKey">,
  interactionType: GameUpdateInteraction,
): void => {
  const userId = authenticatedUser()?.id;
  if (!userId || !model.universeId) {
    return;
  }
  httpService
    .post(gameUpdateInteractedUrlConfig, {
      universeId: model.universeId,
      createdOnKey: model.createdOnKey,
      interactionType,
      currentUserId: userId,
    })
    .catch((error: unknown) => reportNotificationStreamError("gameUpdateInteracted", error));
};

const seenWrites = new Set<string>();

export const markGameUpdateSeenOnce = (
  model: Pick<GameUpdateModel, "universeId" | "createdOnKey">,
): void => {
  const key = `${model.universeId}:${model.createdOnKey ?? ""}`;
  if (seenWrites.has(key)) {
    return;
  }
  seenWrites.add(key);
  markGameUpdateInteracted(model, GAME_UPDATE_INTERACTIONS.seen);
};

export const GAME_UPDATES_QUERY_KEY = "notification-stream-game-updates";

export const universeIdsFrom = (notifications: StreamNotification[]): number[] => {
  const ids = new Set<number>();
  notifications.forEach(n => {
    (n.metadataCollection as GameUpdateMetadata[] | undefined)?.forEach(m => {
      if (typeof m?.UniverseId === "number") {
        ids.add(m.UniverseId);
      }
    });
  });
  return [...ids];
};

const fetchGameUpdate = batchQuery<number, LatestGameUpdate[], LatestGameUpdate | undefined>(
  { delay: 0, maxSize: GAME_UPDATE_BATCH_SIZE },
  universeIds =>
    httpService
      .get<LatestGameUpdate[]>(getLatestGameUpdatesUrlConfig(universeIds))
      .then(({ data }) => data ?? []),
  (updates, universeId) => updates.find(update => update.universeId === universeId),
);

const fetchGameUpdates = async (universeIds: number[]): Promise<LatestGameUpdate[]> => {
  const updates = await Promise.all(universeIds.map(fetchGameUpdate));
  return updates.filter((update): update is LatestGameUpdate => update != null);
};

const fetchFollowedUniverseIds = async (userId: number): Promise<number[]> => {
  const { data } = await httpService.get<GameFollowing[] | { data: GameFollowing[] }>(
    gameFollowingsUrlConfig(userId),
  );
  const followings = Array.isArray(data) ? data : (data?.data ?? []);
  return followings
    .map(following => following?.universeId)
    .filter((id): id is number => typeof id === "number");
};

const fetchPlaceDetail = batchQuery<number, PlaceDetail[], PlaceDetail | undefined>(
  { delay: 0, maxSize: PLACE_DETAIL_BATCH_SIZE },
  placeIds =>
    httpService
      .get<PlaceDetail[]>(multiGetPlaceDetailsUrlConfig(placeIds))
      .then(({ data }) => data ?? []),
  (details, placeId) => details.find(detail => detail?.placeId === placeId),
);

const fetchPlayability = async (rootPlaceIds: number[]): Promise<Map<number, boolean>> => {
  const byUniverse = new Map<number, boolean>();
  if (rootPlaceIds.length === 0) {
    return byUniverse;
  }
  const details = await Promise.all(rootPlaceIds.map(fetchPlaceDetail));
  details.forEach(detail => {
    if (detail) {
      byUniverse.set(detail.universeId, detail.isPlayable);
    }
  });
  return byUniverse;
};

const newestEventStamp = (notifications: StreamNotification[]): number =>
  notifications.reduce((newest, notification) => {
    const stamp = new Date(notification.eventDate).getTime();
    return Number.isNaN(stamp) ? newest : Math.max(newest, stamp);
  }, 0);

export const useGameUpdates = (
  gameUpdateNotifications: StreamNotification[],
): { models: Map<number, GameUpdateModel>; isLoading: boolean; isError: boolean } => {
  const rowUniverseIds = universeIdsFrom(gameUpdateNotifications);
  const revision = newestEventStamp(gameUpdateNotifications);
  const userId = authenticatedUser()?.id ?? undefined;

  const query = useQuery<Map<number, GameUpdateModel>>({
    queryKey: [GAME_UPDATES_QUERY_KEY, revision, ...rowUniverseIds],
    enabled: rowUniverseIds.length > 0,
    staleTime: Infinity,
    queryFn: async () => {
      const followed = userId ? await fetchFollowedUniverseIds(userId) : [];
      const universeIds = [...new Set([...followed, ...rowUniverseIds])];
      const updates = await fetchGameUpdates(universeIds);
      const rootPlaceIds = updates
        .map(u => u.rootPlaceId)
        .filter((id): id is number => typeof id === "number");
      const playability = await fetchPlayability(rootPlaceIds);

      const models = new Map<number, GameUpdateModel>();
      updates.forEach(update => {
        models.set(update.universeId, {
          universeId: update.universeId,
          rootPlaceId: update.rootPlaceId,
          gameName: update.universeName,
          truncatedGameName: truncateGameName(update.universeName),
          updateMessage: update.content,
          createdOn: parseEpochMilliseconds(update.createdOn),
          createdOnKey: update.createdOnKey,
          isPlayable: playability.get(update.universeId) ?? null,
        });
      });
      return models;
    },
    onError: error => reportNotificationStreamError("gameUpdates", error),
  });

  return {
    models: query.data ?? new Map(),
    isLoading: rowUniverseIds.length > 0 && query.isLoading,
    isError: query.isError,
  };
};

export default useGameUpdates;
