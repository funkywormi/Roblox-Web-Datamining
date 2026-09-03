import React from "react";
import environmentUrls from "@rbx/environment-urls";
import GroupShellCard from "./shellCards/GroupShellCard";
import PrivateMessageShellCard from "./shellCards/PrivateMessageShellCard";
import TestShellCard from "./shellCards/TestShellCard";
import GameUpdateShellCard from "./shellCards/GameUpdateShellCard";
import { GameUpdateModel } from "../notificationStreamData/useGameUpdates";
import { GameUpdateMetadata } from "../notificationStreamData/gameUpdatesApi";
import SendrNotification from "../sendrNotificationStream/components/SendrNotification";
import SendrNotificationsBundle from "../sendrNotificationStream/components/SendrNotificationsBundle";
import { GroupMembershipNotificationData } from "../notificationStreamCards/groupMembership/types";
import { PrivateMessageNotificationData } from "../notificationStreamCards/privateMessage/types";
import { TestNotificationData } from "../notificationStreamCards/test/types";
import {
  NotificationData,
  NotificationsBundle,
} from "../sendrNotificationStream/types/NotificationTemplateTypes";
import { StreamNotification, sendCardClick, streamEvents } from "../notificationStreamData";

const { websiteUrl } = environmentUrls;

const isStacked = (n: StreamNotification): boolean => {
  const meta = n.metadataCollection ?? [];
  return (n.eventCount ?? meta.length) > 1 || meta.length === 0;
};

const getCardClickEvent = (n: StreamNotification): string | null => {
  switch (n.notificationSourceType) {
    case "GroupJoinRequestAccepted":
      return streamEvents.goToGroupPage;
    case "PrivateMessageReceived":
      return streamEvents.goToMessages;
    default:
      return null;
  }
};

export const getNotificationHref = (n: StreamNotification): string | null => {
  const meta = (n.metadataCollection ?? []) as Array<Record<string, unknown>>;
  switch (n.notificationSourceType) {
    case "GroupJoinRequestAccepted":
      return isStacked(n)
        ? `${websiteUrl}/my/communities`
        : `${websiteUrl}/communities/${String(meta[0]?.AccepterGroupId ?? "")}`;
    case "PrivateMessageReceived":
      return `${websiteUrl}/my/messages/#!/inbox`;
    default:
      return null;
  }
};

export type NotificationStreamCardRouterProps = {
  notification: StreamNotification;
  onInteract: (id: string) => void;
  /** Drops a dismissed notification from the stream so its row leaves the list. */
  onRemove?: (id: string) => void;
  onActionFailed?: () => void;
  /** Resolved game-update content, keyed by universe id. */
  gameUpdateModels?: Map<number, GameUpdateModel>;
  /** Opens the game-updates drill-down from the aggregated card. */
  onViewGameUpdates?: () => void;
  /** From stream metadata; Angular gates Play and the not-playable message on this. */
  canLaunchGameFromGameUpdate?: boolean;
};

export const NotificationStreamCardRouter = ({
  notification,
  onInteract,
  onRemove,
  onActionFailed,
  gameUpdateModels,
  onViewGameUpdates,
  canLaunchGameFromGameUpdate,
}: NotificationStreamCardRouterProps): JSX.Element | null => {
  const href = getNotificationHref(notification);

  const handleClick = (): void => {
    const clickEvent = getCardClickEvent(notification);
    if (clickEvent) {
      sendCardClick(clickEvent, notification);
    }
    if (!notification.isInteracted) {
      onInteract(notification.id);
    }
    if (href) {
      window.location.href = href;
    }
  };

  let card: JSX.Element | null = null;
  switch (notification.notificationSourceType) {
    case "GroupJoinRequestAccepted":
      card = (
        <GroupShellCard
          notificationData={notification as unknown as GroupMembershipNotificationData}
        />
      );
      break;
    case "PrivateMessageReceived":
      card = (
        <PrivateMessageShellCard
          notificationData={notification as unknown as PrivateMessageNotificationData}
        />
      );
      break;
    case "Test":
      card = <TestShellCard notificationData={notification as unknown as TestNotificationData} />;
      break;
    case "GameUpdate":
      return (
        <GameUpdateShellCard
          universes={(notification.metadataCollection as GameUpdateMetadata[] | undefined) ?? []}
          models={gameUpdateModels ?? new Map()}
          eventDate={notification.eventDate}
          eventCount={notification.eventCount ?? 1}
          isInteracted={Boolean(notification.isInteracted)}
          canLaunch={Boolean(canLaunchGameFromGameUpdate)}
          onInteract={() => {
            // The aggregated row stands for every GameUpdate row, and its own isInteracted is
            // the AND over them, so marking only one leaves the dot on.
            const members = notification.notifications ?? [notification];
            members.forEach(member => {
              if (!member.isInteracted) {
                onInteract(member.id);
              }
            });
          }}
          onViewUpdates={() => onViewGameUpdates?.()}
        />
      );
    case "Sendr":
      return (
        <SendrNotification
          notificationData={notification as unknown as NotificationData}
          onRemoved={() => onRemove?.(notification.id)}
          onActionFailed={onActionFailed}
        />
      );
    case "SendrBundle": {
      const bundled = notification.notifications ?? [];
      if (bundled.length > 1) {
        return (
          <SendrNotificationsBundle
            notificationsBundle={notification as unknown as NotificationsBundle}
            onRemoveNotification={onRemove}
            onActionFailed={onActionFailed}
          />
        );
      }
      const single = bundled[0];
      return (
        <SendrNotification
          notificationData={single as unknown as NotificationData}
          onRemoved={() => {
            if (single) {
              onRemove?.(single.id);
            }
          }}
          onActionFailed={onActionFailed}
        />
      );
    }
    default:
      return null;
  }

  if (!href) {
    return card;
  }
  return (
    <div
      role="button"
      tabIndex={0}
      style={{ cursor: "pointer" }}
      onClick={handleClick}
      onKeyDown={event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleClick();
        }
      }}
    >
      {card}
    </div>
  );
};

export default NotificationStreamCardRouter;
