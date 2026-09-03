import type React from "react";
import classNames from "classnames";
import { useTranslation } from "@rbx/core-scripts/react";
import { Avatar } from "@rbx/foundation-ui";
import type { TFriend } from "@rbx/friends-common/types/friendsCarousel";
import {
  DisplayNameBadges,
  PLUS_BADGE_ARIA_LABEL,
  PLUS_BADGE_ARIA_LABEL_KEY,
  useIsPlusBadgeEnabled,
} from "@rbx/identity-badges";
import { BlueCheckIcon } from "./BlueCheckIcon";

type UserSearchRowProps = {
  displayName: string;
  username?: string;
  thumbnailUrl?: string;
  badges?: React.ReactNode;
  isFocused?: boolean;
  onSelect: () => void;
};

export function UserSearchRow({
  displayName,
  username,
  thumbnailUrl,
  badges,
  isFocused = false,
  onSelect,
}: UserSearchRowProps) {
  const usernameDisplay = username ? `@${username}` : undefined;

  return (
    <div
      className={classNames(
        "flex flex-row items-center gap-medium padding-x-none send-robux-user-row width-full cursor-pointer shrink-0 radius-medium",
        isFocused ? "bg-surface-300" : "bg-none",
        !isFocused && "hover:bg-shift-200",
      )}
      onClick={onSelect}
      onKeyDown={event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      role="option"
      tabIndex={0}
      aria-selected={isFocused}
      aria-label={usernameDisplay ? `${displayName} ${usernameDisplay}` : displayName}
    >
      <Avatar src={thumbnailUrl} alt={displayName} size="Large" className="bg-shift-200" />
      <div
        className="flex flex-col min-width-0 width-full padding-y-xsmall"
        data-testid="user-row-text"
      >
        {/* `width-full` + `clip` bound the name row to the column so the title
            ellipsizes instead of widening the row and scrolling the sheet. */}
        <span
          className="inline-flex items-center gap-xsmall content-emphasis min-width-0 width-full clip"
          data-testid="user-row-name"
        >
          <span className="min-width-0 text-title-medium text-truncate-end text-no-wrap">
            {displayName}
          </span>
          {badges}
        </span>
        {usernameDisplay && (
          <span className="text-body-medium content-default text-truncate-end text-no-wrap width-full">
            {usernameDisplay}
          </span>
        )}
      </div>
    </div>
  );
}

type InlineFriendRowProps = {
  friend: TFriend;
  thumbnailUrl?: string;
  onSelectUser: (user: { id: number }) => void;
};

export function InlineFriendRow({ friend, thumbnailUrl, onSelectUser }: InlineFriendRowProps) {
  const { translate } = useTranslation();
  const showPlusBadge = useIsPlusBadgeEnabled() && friend.isRobloxPlus === true;
  const badges = [
    friend.hasVerifiedBadge ? <BlueCheckIcon key="verified" size={12} /> : null,
    showPlusBadge ? (
      <DisplayNameBadges
        key="roblox-plus"
        isRobloxPlus
        size="Small"
        plusBadgeAriaLabel={translate(PLUS_BADGE_ARIA_LABEL_KEY, undefined, PLUS_BADGE_ARIA_LABEL)}
      />
    ) : null,
  ];

  return (
    <UserSearchRow
      displayName={friend.combinedName ?? ""}
      thumbnailUrl={thumbnailUrl}
      badges={badges}
      onSelect={() => {
        onSelectUser({ id: friend.id });
      }}
    />
  );
}
