import React from "react";
import { useTranslation } from "react-utilities";
import VerifiedBadgeIcon, {
  VERIFIED_BADGE_ARIA_LABEL,
  VERIFIED_BADGE_ARIA_LABEL_KEY,
} from "@rbx/www-common/components/verified-badge";
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailAvatarHeadshotSize,
  ThumbnailFormat,
} from "roblox-thumbnails";
import { TFriendResponse } from "../../../../../types/friendsTypes";
import { getProfileUrl } from "../../../constants/urlConstants";

export const FriendItem = ({
  friend,
  userName,
}: {
  friend: TFriendResponse;
  userName: string;
}): JSX.Element => {
  const { translate } = useTranslation();

  const getThumbnail = (): JSX.Element => {
    const thumbnail = (
      <Thumbnail2d
        containerClass="friend-thumbnail"
        type={ThumbnailTypes.avatarHeadshot}
        size={ThumbnailAvatarHeadshotSize.size150}
        targetId={friend.id}
        format={ThumbnailFormat.webp}
        imgClassName="friend-carousel-image"
      />
    );

    return thumbnail;
  };

  return (
    <a className="friend-item" href={getProfileUrl(friend.id)}>
      <div className="friend-thumbnails-container">{getThumbnail()}</div>
      <div className="friend-name-parent-container">
        <div className="friend-name-container">
          <span className="friend-name">{userName}</span>
          {friend.hasVerifiedBadge && (
            <VerifiedBadgeIcon
              size="Medium"
              className="verified-badge"
              titleText={translate(
                VERIFIED_BADGE_ARIA_LABEL_KEY,
                undefined,
                VERIFIED_BADGE_ARIA_LABEL,
              )}
            />
          )}
        </div>
      </div>
    </a>
  );
};

export default FriendItem;
