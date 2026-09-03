import React from "react";
import { Avatar } from "@rbx/foundation-ui";
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailFormat,
  DefaultThumbnailSize,
} from "roblox-thumbnails";
import { VisualItemThumbnail, ThumbnailType } from "../types/NotificationTemplateTypes";

export const ThumbnailData: {
  [key: string]: {
    type: ThumbnailTypes;
    class: string;
    format: ThumbnailFormat;
  };
} = {
  [ThumbnailType.User]: {
    type: ThumbnailTypes.avatarHeadshot,
    class: "avatar-icon-container",
    format: ThumbnailFormat.webp,
  },
  [ThumbnailType.Game]: {
    type: ThumbnailTypes.gameIcon,
    class: "game-icon-container",
    format: ThumbnailFormat.webp,
  },
  [ThumbnailType.Group]: {
    type: ThumbnailTypes.groupIcon,
    class: "group-icon-container",
    format: ThumbnailFormat.webp,
  },
  [ThumbnailType.Asset]: {
    type: ThumbnailTypes.assetThumbnail,
    class: "asset-icon-container",
    format: ThumbnailFormat.webp,
  },
  [ThumbnailType.Bundle]: {
    type: ThumbnailTypes.bundleThumbnail,
    class: "asset-icon-container",
    format: ThumbnailFormat.webp,
  },
  [ThumbnailType.GamePass]: {
    type: ThumbnailTypes.gamePassIcon,
    class: "asset-icon-container",
    format: ThumbnailFormat.webp,
  },
  [ThumbnailType.AvatarImageUrl]: {
    type: "avatarImageUrl" as ThumbnailTypes,
    class: "avatar-icon-container",
    format: ThumbnailFormat.webp,
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

  return thumbnailItem.idType === ThumbnailType.User ? (
    <div className="avatar avatar-headshot-sm avatar-sndr-overides">
      <div className="avatar-card-image">
        <Thumbnail2d
          type={thumbnailSettings.type}
          size={DefaultThumbnailSize}
          format={ThumbnailFormat.webp}
          targetId={parseFloat(thumbnailItem.id)}
          containerClass={thumbnailSettings.class}
        />
      </div>
    </div>
  ) : (
    <Thumbnail2d
      type={thumbnailSettings.type}
      size={DefaultThumbnailSize}
      format={thumbnailSettings.format}
      targetId={parseFloat(thumbnailItem.id)}
      containerClass={thumbnailSettings.class}
    />
  );
};

export default NotificationThumbnail;
