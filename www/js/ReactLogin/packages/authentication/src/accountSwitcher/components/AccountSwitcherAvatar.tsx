import React, { createContext, useContext, type ComponentType } from "react";

// The host renders the avatar so @rbx/thumbnails stays out of the shared switcher: .NET entries pass
// ThumbnailsAvatarHeadshot, and Next passes the www-common Thumbnail2d (the nav's AvatarHeadshot).
export type AccountSwitcherAvatarHeadshotProps = {
  userId: number;
  altName?: string;
  containerClass?: string;
};

export type AccountSwitcherAvatarHeadshot = ComponentType<AccountSwitcherAvatarHeadshotProps>;

export const AccountSwitcherAvatarContext = createContext<AccountSwitcherAvatarHeadshot | null>(
  null,
);

export const AccountSwitcherAvatar = ({
  userId,
}: {
  userId: number;
}): React.ReactElement | null => {
  const AvatarHeadshot = useContext(AccountSwitcherAvatarContext);
  return AvatarHeadshot ? (
    <AvatarHeadshot userId={userId} containerClass="avatar-card-image" />
  ) : null;
};
