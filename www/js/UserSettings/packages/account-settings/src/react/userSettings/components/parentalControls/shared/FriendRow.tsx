import React from "react";
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailAvatarHeadshotSize,
  ThumbnailFormat,
} from "roblox-thumbnails";
import VerifiedBadgeIcon, {
  VERIFIED_BADGE_ARIA_LABEL,
  VERIFIED_BADGE_ARIA_LABEL_KEY,
} from "@rbx/www-common/components/verified-badge";
import { TFriendResponse } from "../../../../../types/friendsTypes";
import { getProfileUrl } from "../../../constants/urlConstants";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import { useWrappedTranslation } from "../../../hooks/useWrappedTranslation";

export const FriendRow = ({
  friend,
  displayName,
  userName,
  isTrusted = false,
  trailing,
}: {
  friend: TFriendResponse;
  displayName: string;
  userName: string;
  isTrusted?: boolean;
  trailing?: React.ReactNode;
}): JSX.Element => {
  const { translate } = useWrappedTranslation();

  const atUsername = isTrusted
    ? `@${userName} • ${translate(parentalControlsTranslationConstants.friendManagement.trustedLabel)}`
    : `@${userName}`;

  return (
    <li className="friend-card-list-item">
      <a
        className="friend-card"
        href={getProfileUrl(friend.id)}
        // TODO ACCMAN-2256: Integrate deep linking
      >
        <div className="friend-thumbnails-container">
          <Thumbnail2d
            containerClass="friend-thumbnail"
            type={ThumbnailTypes.avatarHeadshot}
            size={ThumbnailAvatarHeadshotSize.size150}
            targetId={friend.id}
            format={ThumbnailFormat.webp}
            imgClassName="friend-card-image"
          />
        </div>
        <div className="friend-name-parent-container">
          <div className="friend-name-container">
            <div className="display-name text-name">{displayName}</div>
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
          <div className="user-name">{atUsername}</div>
        </div>
      </a>

      {trailing}
    </li>
  );
};

export default FriendRow;
