import { JSX } from "react";
import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";
import { BadgeSizes, VerifiedBadgeIconContainer } from "@rbx/roblox-badges";
import {
  DisplayNameBadges,
  useIsPlusBadgeEnabled,
  PLUS_BADGE_ARIA_LABEL,
  PLUS_BADGE_ARIA_LABEL_KEY,
} from "@rbx/identity-badges";
import AvatarHeadshot from "./AvatarHeadshot";

const FriendTileContent = ({
  id,
  displayName,
  userProfileUrl,
  userPresence,
  hasVerifiedBadge,
  isRobloxPlus,
  sendClickEvent,
  translate,
}: {
  id: number;
  displayName: string;
  userProfileUrl: string;
  userPresence: string | null | undefined;
  hasVerifiedBadge: boolean;
  isRobloxPlus?: boolean;
  sendClickEvent: () => void;
  translate: TranslateFunction;
}): JSX.Element => {
  const showPlus = useIsPlusBadgeEnabled() && isRobloxPlus === true;
  return (
    <div className="friend-tile-content">
      <AvatarHeadshot
        id={id}
        translate={translate}
        userProfileUrl={userProfileUrl}
        handleImageClick={sendClickEvent}
      />

      <a
        href={userProfileUrl}
        onClick={sendClickEvent}
        className="friends-carousel-tile-labels"
        data-testid="friends-carousel-tile-labels"
      >
        <div className="friends-carousel-tile-label">
          <div className="friends-carousel-tile-name">
            <span className="friends-carousel-display-name">{displayName}</span>
            {hasVerifiedBadge && (
              <div className="friend-tile-verified-badge">
                <div className="friend-tile-spacer" />
                <VerifiedBadgeIconContainer
                  size={BadgeSizes.SUBHEADER}
                  additionalContainerClass="verified-badge"
                />
              </div>
            )}
            {showPlus && (
              <DisplayNameBadges
                isRobloxPlus
                size="Small"
                plusBadgeAriaLabel={translate(
                  PLUS_BADGE_ARIA_LABEL_KEY,
                  undefined,
                  PLUS_BADGE_ARIA_LABEL,
                )}
              />
            )}
          </div>
        </div>
        <div className="friends-carousel-tile-sublabel">
          {userPresence != null && (
            <div className="friends-carousel-tile-experience">{userPresence}</div>
          )}
        </div>
      </a>
    </div>
  );
};
export default FriendTileContent;
