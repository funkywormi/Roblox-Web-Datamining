import React from "react";
import { getRelativeTimeMaxDays } from "../../utils/relativeTime";
import environmentUrls from "@rbx/environment-urls";
import { Notification } from "@rbx/foundation-ui";
import { useNotificationLocalization } from "../../sendrNotificationStream/context/NotificationsLocalization";
import { buildPrivateMessageDescription } from "../../notificationStreamCards/privateMessage/privateMessageDescription";
import { PrivateMessageNotificationData } from "../../notificationStreamCards/privateMessage/types";
import { getNotificationStreamHost } from "../../notificationStreamData/streamHost";
import {
  sendStreamEvent,
  streamContexts,
  streamEvents,
} from "../../notificationStreamData/notificationStreamEvents";
import type { JSX } from "react";

const { websiteUrl } = environmentUrls;

export type PrivateMessageShellCardProps = {
  notificationData: PrivateMessageNotificationData;
};

export const PrivateMessageShellCard = ({
  notificationData,
}: PrivateMessageShellCardProps): JSX.Element => {
  const translate = useNotificationLocalization();
  const { Thumbnail } = getNotificationStreamHost();
  const author = notificationData.metadataCollection?.[0];

  const timestamp = notificationData.eventDate
    ? getRelativeTimeMaxDays(new Date(notificationData.eventDate), new Date())
    : undefined;

  const media = author ? (
    <a
      href={`${websiteUrl}/users/${author.AuthorUserId}/profile`}
      onClick={e => {
        e.stopPropagation();
        sendStreamEvent(streamEvents.goToProfilePage, streamContexts.click, {
          sendrVersion: 0,
          notificationType: notificationData.notificationSourceType,
          notificationId: notificationData.id,
        });
      }}
      style={{ display: "block", width: 48, height: 48, borderRadius: "50%", overflow: "hidden" }}
    >
      <Thumbnail
        type="avatarHeadshot"
        targetId={author.AuthorUserId}
        containerClass="notification-icon"
      />
    </a>
  ) : undefined;

  return (
    <Notification
      // Override the navbar <li>'s inherited text-align:center (Navigation.css).
      style={{ textAlign: "start" }}
      media={media}
      // No headline on this card type; foundation collapses the title row only when the prop is falsy,
      // and it is not optional, so absence has to be stated.
      title={undefined}
      description={buildPrivateMessageDescription(translate, notificationData)}
      timestamp={timestamp}
      hasStatusIndicator={!notificationData.isInteracted}
    />
  );
};

export default PrivateMessageShellCard;
