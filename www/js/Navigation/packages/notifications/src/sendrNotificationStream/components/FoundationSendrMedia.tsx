import React from "react";
import { Avatar } from "@rbx/foundation-ui";
import { Thumbnail2d, ThumbnailFormat, DefaultThumbnailSize } from "roblox-thumbnails";
import { ThumbnailType, VisualItemThumbnail } from "../types/NotificationTemplateTypes";
import { ThumbnailData, iconClassMap } from "./NotificationThumbnail";

const MEDIA_SIZE = 48;

export type FoundationSendrMediaProps = {
  thumbnailItem: VisualItemThumbnail;
};

export const FoundationSendrMedia = ({
  thumbnailItem,
}: FoundationSendrMediaProps): JSX.Element | null => {
  if (thumbnailItem.idType === ThumbnailType.Icon) {
    return <span className={iconClassMap[thumbnailItem.id] || ""} />;
  }
  if (thumbnailItem.idType === ThumbnailType.AvatarImageUrl) {
    return <Avatar src={thumbnailItem.id} alt="" size="Large" />;
  }

  const thumbnailSettings = ThumbnailData[thumbnailItem.idType];
  if (!thumbnailSettings) {
    return null;
  }

  const isRound = thumbnailItem.idType === ThumbnailType.User;
  return (
    <span
      style={{
        display: "block",
        width: MEDIA_SIZE,
        height: MEDIA_SIZE,
        borderRadius: isRound ? "50%" : 8,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <Thumbnail2d
        type={thumbnailSettings.type}
        size={DefaultThumbnailSize}
        format={ThumbnailFormat.webp}
        targetId={parseFloat(thumbnailItem.id)}
        containerClass="notification-icon"
      />
    </span>
  );
};

export default FoundationSendrMedia;
