import React from "react";
import { Avatar } from "@rbx/foundation-ui";
import { VisualItemThumbnail, ThumbnailType } from "../types/NotificationTemplateTypes";
import {
  getNotificationStreamHost,
  type StreamThumbnailType,
} from "../../notificationStreamData/streamHost";
import type { JSX } from "react";

export const ThumbnailData: {
  [key: string]: {
    type: StreamThumbnailType;
    class: string;
  };
} = {
  [ThumbnailType.User]: {
    type: "avatarHeadshot",
    class: "avatar-icon-container",
  },
  [ThumbnailType.Game]: {
    type: "gameIcon",
    class: "game-icon-container",
  },
  [ThumbnailType.Group]: {
    type: "groupIcon",
    class: "group-icon-container",
  },
  [ThumbnailType.Asset]: {
    type: "assetThumbnail",
    class: "asset-icon-container",
  },
  [ThumbnailType.Bundle]: {
    type: "bundleThumbnail",
    class: "asset-icon-container",
  },
  [ThumbnailType.GamePass]: {
    type: "gamePassIcon",
    class: "asset-icon-container",
  },
  [ThumbnailType.AvatarImageUrl]: {
    type: "avatarImageUrl" as StreamThumbnailType,
    class: "avatar-icon-container",
  },
};

export const iconClassMap: { [icon: string]: string } = {
  reported: "icon-status-alert-xl",
  roblox: "app-icon-bluebg app-icon-windows size-1200",
  premium: "icon-default-premium",
  safety: "icon-default-safety",
};

export type NotificationThumbnailProps = {
  thumbnailItem: VisualItemThumbnail | undefined;
};

export const NotificationThumbnail = ({
  thumbnailItem,
}: NotificationThumbnailProps): JSX.Element | null => {
  if (thumbnailItem && thumbnailItem.idType === ThumbnailType.Icon) {
    return <span className={iconClassMap[thumbnailItem.id] || ""} />;
  }

  const thumbnailSettings = thumbnailItem && ThumbnailData[thumbnailItem.idType];
  if (!thumbnailItem || !thumbnailSettings) {
    return null;
  }

  if (thumbnailItem.idType === ThumbnailType.AvatarImageUrl) {
    return <Avatar src={thumbnailItem.id} alt="Avatar" size="Large" />;
  }

  const { Thumbnail } = getNotificationStreamHost();

  return thumbnailItem.idType === ThumbnailType.User ? (
    <div className="avatar avatar-headshot-sm avatar-sndr-overides">
      <div className="avatar-card-image">
        {/* includeProfileFrame: render a subscriber's frame around their headshot in
          notifications (user avatars only). Shared thumbnails CSS handles the framed
          derivative; other idTypes (game/group/asset) never get a frame. */}
        <Thumbnail
          type={thumbnailSettings.type}
          targetId={parseFloat(thumbnailItem.id)}
          containerClass={thumbnailSettings.class}
          includeProfileFrame
        />
      </div>
    </div>
  ) : (
    <Thumbnail
      type={thumbnailSettings.type}
      targetId={parseFloat(thumbnailItem.id)}
      containerClass={thumbnailSettings.class}
    />
  );
};

export default NotificationThumbnail;
