import React from "react";
import { getRelativeTimeMaxDays } from "../../utils/relativeTime";
import { Intl, EnvironmentUrls } from "Roblox";
import { Notification } from "@rbx/foundation-ui";
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailFormat,
  DefaultThumbnailSize,
} from "roblox-thumbnails";
import { useNotificationLocalization } from "../../sendrNotificationStream/context/NotificationsLocalization";
import { buildPrivateMessageDescription } from "./privateMessageDescription";
import { PrivateMessageNotificationData } from "./types";

const { websiteUrl } = EnvironmentUrls;

export type PrivateMessageNotificationProps = {
  notificationData: PrivateMessageNotificationData;
};

// Presentational React port of the Angular privateMessage card. Angular keeps the
// whole-card click (clickCard -> inbox) and unread <li> state; this renders content only.
export const PrivateMessageNotification = ({
  notificationData,
}: PrivateMessageNotificationProps): JSX.Element => {
  const translate = useNotificationLocalization();
  const author = notificationData.metadataCollection?.[0];

  const timestamp = notificationData.eventDate
    ? getRelativeTimeMaxDays(new Date(notificationData.eventDate), new Date())
    : undefined;

  // Author's avatar headshot, linked to their profile; icon-nav-group fallback when the
  // author is absent (stacked / empty-metadata case), matching privateMessage.html.
  const media = author ? (
    <a
      className="avatar avatar-headshot-sm"
      href={`${websiteUrl}/users/${author.AuthorUserId}/profile`}
      onClick={e => e.stopPropagation()}
    >
      <Thumbnail2d
        type={ThumbnailTypes.avatarHeadshot}
        size={DefaultThumbnailSize}
        format={ThumbnailFormat.webp}
        targetId={author.AuthorUserId}
        containerClass="avatar-card-image"
      />
    </a>
  ) : (
    <span className="icon-nav-group" />
  );

  return (
    <Notification
      // Override the navbar <li>'s inherited text-align:center (Navigation.css).
      style={{ textAlign: "left" }}
      media={media}
      // Spacer keeps the title slot filled so foundation right-aligns the timestamp.
      title={<span aria-hidden style={{ display: "block", width: "100%" }} />}
      description={buildPrivateMessageDescription(translate, notificationData)}
      timestamp={timestamp}
      hasStatusIndicator={!notificationData.isInteracted}
    />
  );
};

export default PrivateMessageNotification;
