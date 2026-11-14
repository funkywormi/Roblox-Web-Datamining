import React, { useState } from "react";
import { useIsMutating, useMutation, useQueryClient } from "@tanstack/react-query";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import GameUpdateNotification from "../../notificationStreamCards/gameUpdate/GameUpdateNotification";
import { GameUpdateViewModel } from "../../notificationStreamCards/gameUpdate/types";
import {
  GAME_UPDATES_QUERY_KEY,
  GameUpdateModel,
} from "../../notificationStreamData/useGameUpdates";
import {
  GameUpdateMetadata,
  GameUpdateNsPage,
  GAME_UPDATE_NOTIF_TYPE,
  GAME_UPDATE_NS_PAGES,
  abuseReportHref,
  openAbuseReport,
  followUniverseUrlConfig,
  gameDetailsHref,
} from "../../notificationStreamData/gameUpdatesApi";
import {
  sendGameUpdateEvent,
  streamEvents,
  type GameUpdateEventParams,
} from "../../notificationStreamData/notificationStreamEvents";
import { reportNotificationStreamError } from "../../notificationStreamData/notificationStreamObservability";
import { streamDelete, streamPost } from "../../notificationStreamData/streamTransport";
import { getNotificationStreamHost } from "../../notificationStreamData/streamHost";
import type { JSX } from "react";

export type GameUpdateShellCardProps = {
  universes: GameUpdateMetadata[];
  models: Map<number, GameUpdateModel>;
  eventDate: string;
  eventCount: number;
  isInteracted: boolean;
  canLaunch: boolean;
  onInteract: () => void;
  onViewUpdates: () => void;
  nsPage?: GameUpdateNsPage;
};

const placeholderModel = (universeId: number): GameUpdateModel => ({
  universeId,
  rootPlaceId: null,
  gameName: "",
  truncatedGameName: "",
  updateMessage: "",
  createdOn: null,
  createdOnKey: undefined,
  isPlayable: null,
});

export const GameUpdateShellCard = ({
  universes,
  models,
  eventDate,
  eventCount,
  isInteracted,
  canLaunch,
  onInteract,
  onViewUpdates,
  nsPage = GAME_UPDATE_NS_PAGES.main,
}: GameUpdateShellCardProps): JSX.Element => {
  const [unfollowed, setUnfollowed] = useState(false);
  const queryClient = useQueryClient();
  const { joinMultiplayerGame } = getNotificationStreamHost();
  const resolved = universes
    .map(meta => models.get(meta?.UniverseId ?? 0))
    .filter((model): model is GameUpdateModel => Boolean(model));
  const isAggregated = resolved.length > 1;
  const isResolved = resolved.length > 0;
  const primary = resolved[0] ?? placeholderModel(universes[0]?.UniverseId ?? 0);

  let state: GameUpdateViewModel["state"] = "single";
  if (isAggregated) {
    state = "aggregated";
  } else if (unfollowed) {
    state = "unfollowed";
  }

  const viewModel: GameUpdateViewModel = {
    state,
    universeId: primary.universeId,
    rootPlaceId: primary.rootPlaceId,
    gameName: primary.truncatedGameName,
    fullGameName: primary.gameName,
    updateMessage: primary.updateMessage,
    // Angular's templates render gameUpdateModel.createdOn, not the stream row's date; the row
    // keeps only a lossy sample so its eventDate can be older than the update being shown.
    eventDate: primary.createdOn != null ? new Date(primary.createdOn).toISOString() : eventDate,
    isInteracted,
    canLaunch: canLaunch && joinMultiplayerGame != null,
    isPlayable: primary.isPlayable,
    isResolved,
    aggregation: isAggregated
      ? {
          gameOne: universes[0]?.GameName ?? "",
          gameTwo: universes[1]?.GameName ?? "",
          otherCount: Math.max(eventCount - 2, 0),
        }
      : undefined,
  };

  const eventParams = (): GameUpdateEventParams => ({
    notificationId: `${primary.rootPlaceId}-${primary.createdOn}`,
    notificationType: GAME_UPDATE_NOTIF_TYPE,
    rootPlaceId: primary.rootPlaceId ?? undefined,
    universeId: primary.universeId,
    isAggregate: isAggregated,
    nsPage,
  });

  const sendEvent = (eventName: string): void => sendGameUpdateEvent(eventName, eventParams());

  const followMutationKey = ["gameUpdateFollow", primary.universeId, nsPage];
  const followMutation = useMutation<unknown, unknown, boolean>({
    mutationKey: followMutationKey,
    mutationFn: (following: boolean) => {
      const userId = authenticatedUser()?.id;
      if (!userId || !primary.universeId) {
        return Promise.resolve(null);
      }
      const config = followUniverseUrlConfig(userId, primary.universeId);
      return following ? streamPost(config, {}) : streamDelete(config, {});
    },
    onSuccess: (_data, following) => {
      setUnfollowed(!following);
      if (following && !primary.updateMessage) {
        queryClient
          .invalidateQueries({ queryKey: [GAME_UPDATES_QUERY_KEY] })
          .catch((error: unknown) => reportNotificationStreamError("gameUpdateRefetch", error));
      }
    },
    onError: (error: unknown) => reportNotificationStreamError("gameUpdateFollow", error),
  });

  const isFollowPending = useIsMutating({ mutationKey: followMutationKey }) > 0;

  const setFollowing = (following: boolean): void => {
    sendEvent(following ? streamEvents.follow : streamEvents.unfollow);
    followMutation.mutate(following);
  };

  const goToDetails = (): void => {
    sendEvent(streamEvents.goToGameDetails);
    onInteract();
    if (primary.rootPlaceId) {
      window.location.href = gameDetailsHref(primary.rootPlaceId, primary.createdOn);
    }
  };

  return (
    <GameUpdateNotification
      viewModel={viewModel}
      handlers={{
        onPlay: () => {
          onInteract();
          if (primary.rootPlaceId) {
            joinMultiplayerGame?.(primary.rootPlaceId);
          }
          sendEvent(streamEvents.launchExperience);
        },
        onUnfollow: () => setFollowing(false),
        onUndo: () => setFollowing(true),
        isFollowPending,
        onReport: () => {
          sendEvent(streamEvents.report);
          openAbuseReport(abuseReportHref(primary.universeId, window.location.href));
        },
        onGoToDetails: goToDetails,
        onViewUpdates: () => {
          onInteract();
          onViewUpdates();
        },
        onMetaActionsOpenChange: (open: boolean) =>
          sendEvent(open ? streamEvents.openMetaActions : streamEvents.closeMetaActions),
      }}
    />
  );
};

export default GameUpdateShellCard;
