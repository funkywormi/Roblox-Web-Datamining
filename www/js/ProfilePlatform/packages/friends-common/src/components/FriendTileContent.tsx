import { JSX } from "react";
import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";
import VerifiedBadgeIcon, {
  VERIFIED_BADGE_ARIA_LABEL,
  VERIFIED_BADGE_ARIA_LABEL_KEY,
} from "@rbx/www-common/components/verified-badge";
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
    <div className="flex flex-col gap-xsmall hover:underline">
      <AvatarHeadshot
        id={id}
        translate={translate}
        userProfileUrl={userProfileUrl}
        handleImageClick={sendClickEvent}
      />
      <a
        href={userProfileUrl}
        onClick={sendClickEvent}
        data-testid="friends-carousel-tile-labels"
        className="flex flex-col items-center gap-xxsmall max-width-2400 text-no-wrap"
      >
        <div className="width-full flex justify-center items-center gap-xxsmall text-title-small">
          <span className="text-truncate-end">{displayName}</span>
          {hasVerifiedBadge && (
            <div className="friend-tile-verified-badge">
              <div className="friend-tile-spacer" />
              <VerifiedBadgeIcon
                size="Medium"
                className="verified-badge"
                titleText={translate(
                  VERIFIED_BADGE_ARIA_LABEL_KEY,
                  undefined,
                  VERIFIED_BADGE_ARIA_LABEL,
                )}
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
        {userPresence != null && (
          <div className="width-full content-muted text-label-small text-truncate-end">
            {userPresence}
          </div>
        )}
      </a>
    </div>
  );
};
export default FriendTileContent;
