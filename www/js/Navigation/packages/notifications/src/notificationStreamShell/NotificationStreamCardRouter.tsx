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
import type { JSX } from "react";

const { websiteUrl } = environmentUrls;

type CardMetadata = Array<Record<string, unknown>>;

const INBOX_PATH = "/my/messages/#!/inbox";

const getCardPath = (n: StreamNotification): string | null => {
  const meta = (n.metadataCollection ?? []) as CardMetadata;
  switch (n.notificationSourceType) {
    case "GroupJoinRequestAccepted":
      return meta.length === 0
        ? "/my/communities"
        : `/communities/${String(meta[0]?.AccepterGroupId ?? "")}`;
    case "PrivateMessageReceived":
      return (n.eventCount ?? 0) > 1 || meta.length === 0
        ? INBOX_PATH
        : `${INBOX_PATH}?conversationId=${String(meta[0]?.MessageId ?? "")}`;
    default:
      return null;
  }
};

// notificationsController.js clickCard: the source type is the event context, plus a per-type key.
const sendCardClickEvent = (n: StreamNotification, path: string | null): void => {
  const meta = (n.metadataCollection ?? []) as CardMetadata;
  switch (n.notificationSourceType) {
    case "GroupJoinRequestAccepted":
      sendCardClick(
        streamEvents.goToGroupPage,
        n,
        { groupId: meta.length === 0 ? 0 : (meta[0]?.AccepterGroupId as number) },
        n.notificationSourceType,
      );
      break;
    case "PrivateMessageReceived":
      sendCardClick(
        streamEvents.goToMessages,
        n,
        { targetUrl: path ?? undefined },
        n.notificationSourceType,
      );
      break;
    default:
      break;
  }
};

export const getNotificationHref = (n: StreamNotification): string | null => {
  const path = getCardPath(n);
  return path == null ? null : `${websiteUrl}${path}`;
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
  const path = getCardPath(notification);
  const href = path == null ? null : `${websiteUrl}${path}`;

  const handleClick = (): void => {
    sendCardClickEvent(notification, path);
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
