import { StreamNotification } from "./notificationStreamApi";
import { GameUpdateMetadata } from "./gameUpdatesApi";
import { GameUpdateModel } from "./useGameUpdates";

export type AggregatedGameUpdate = StreamNotification & {
  metadataCollection: GameUpdateMetadata[];
};

export const aggregateGameUpdates = (
  gameUpdates: StreamNotification[],
  models: Map<number, GameUpdateModel>,
  isResolving = false,
): AggregatedGameUpdate | null => {
  if (gameUpdates.length === 0) {
    return null;
  }

  const metadataCollection: GameUpdateMetadata[] = [];
  const seen = new Set<number>();
  let maxEventDate: string | undefined;
  let maxStamp = -Infinity;
  let totalEventCount = 0;
  let isInteracted = true;

  gameUpdates.forEach(update => {
    const stamp = new Date(update.eventDate).getTime();
    if (!Number.isNaN(stamp) && stamp > maxStamp) {
      maxStamp = stamp;
      maxEventDate = update.eventDate;
    }
    totalEventCount += update.eventCount ?? 0;
    if (!update.isInteracted) {
      isInteracted = false;
    }
    (update.metadataCollection as GameUpdateMetadata[] | undefined)?.forEach(meta => {
      const universeId = meta?.UniverseId;
      if (typeof universeId === "number" && models.has(universeId) && !seen.has(universeId)) {
        seen.add(universeId);
        metadataCollection.push(meta);
      }
    });
  });

  if (metadataCollection.length === 0 && isResolving) {
    gameUpdates.forEach(update => {
      (update.metadataCollection as GameUpdateMetadata[] | undefined)?.forEach(meta => {
        const universeId = meta?.UniverseId;
        if (typeof universeId === "number" && !seen.has(universeId)) {
          seen.add(universeId);
          metadataCollection.push(meta);
        }
      });
    });
  }

  if (metadataCollection.length === 0) {
    return null;
  }

  return {
    // Angular uses the first row's id, and it has to be a REAL id: mark-interacted matches
    // rows by id, so a synthetic one marks nothing and the unread dot cannot clear.
    id: gameUpdates[0]?.id ?? "",
    notificationSourceType: "GameUpdate",
    eventDate: maxEventDate ?? gameUpdates[0]?.eventDate ?? "",
    eventCount: Math.max(totalEventCount, metadataCollection.length),
    isInteracted,
    metadataCollection,
    notifications: gameUpdates,
  };
};

export default aggregateGameUpdates;
