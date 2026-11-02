import React from "react";
import { Thumbnail2d, ThumbnailTypes, ThumbnailAvatarHeadshotSize } from "@rbx/thumbnails";
import type { AccountSwitcherAvatarHeadshotProps } from "./AccountSwitcherAvatar";

// .NET only: @rbx/thumbnails doesn't load on Next, so only .NET entries may import this.
export const ThumbnailsAvatarHeadshot = ({
  userId,
  altName,
  containerClass,
}: AccountSwitcherAvatarHeadshotProps): JSX.Element => (
  <Thumbnail2d
    containerClass={containerClass}
    type={ThumbnailTypes.avatarHeadshot}
    targetId={userId}
    size={ThumbnailAvatarHeadshotSize.size60}
    altName={altName}
    includeProfileFrame
  />
);
