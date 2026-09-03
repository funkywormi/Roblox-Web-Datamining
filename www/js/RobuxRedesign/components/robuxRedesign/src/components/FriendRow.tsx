import classNames from "classnames";
import { useTranslation } from "@rbx/core-scripts/react";
import { Icon } from "@rbx/foundation-ui";
import { TFriend } from "@rbx/friends-common/types/friendsCarousel";
import {
  DisplayNameBadges,
  useIsPlusBadgeEnabled,
  PLUS_BADGE_ARIA_LABEL,
  PLUS_BADGE_ARIA_LABEL_KEY,
} from "@rbx/identity-badges";
import { BlueCheckIcon } from "./BlueCheckIcon";

type FriendRowProps = {
  friend: TFriend;
  thumbnailUrl: string | undefined;
  onSelectUser: (user: { id: number }) => void;
  isFocused?: boolean;
};

export function FriendRow({
  friend,
  thumbnailUrl,
  onSelectUser,
  isFocused = false,
}: FriendRowProps) {
  const { translate } = useTranslation();
  const handleSelect = () => {
    onSelectUser({ id: friend.id });
  };
  const showPlusBadge = useIsPlusBadgeEnabled() && friend.isRobloxPlus === true;

  return (
    <div
      className={classNames(
        "flex flex-row items-center gap-small padding-small width-full cursor-pointer shrink-0",
        isFocused ? "bg-surface-300" : "bg-none",
      )}
      style={{ borderRadius: 12 }}
      onClick={handleSelect}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleSelect();
        }
      }}
      role="option"
      tabIndex={0}
      aria-selected={isFocused}
      aria-label={friend.combinedName ?? ""}
    >
      <div className="height-800 width-800 radius-circle clip shrink-0 bg-surface-300 flex items-center justify-center">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={friend.combinedName ?? ""}
            className="height-full width-full object-cover"
          />
        ) : (
          <Icon name="icon-regular-person" size="Small" />
        )}
      </div>
      <div className="flex flex-row items-center gap-xsmall">
        <span className="text-body-medium content-emphasis">{friend.combinedName}</span>
        {friend.hasVerifiedBadge && <BlueCheckIcon size={12} />}
        {showPlusBadge && (
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
  );
}
