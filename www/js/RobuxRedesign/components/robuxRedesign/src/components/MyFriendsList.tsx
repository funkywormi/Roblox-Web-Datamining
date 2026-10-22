import classNames from "classnames";
import { useTranslation } from "@rbx/core-scripts/react";
import { TFriend } from "@rbx/friends-common/types/friendsCarousel";
import { useAvatarThumbnails } from "../hooks/useAvatarThumbnails";
import { FriendRow } from "./FriendRow";
import { InlineFriendRow } from "./UserSearchRow";

type MyFriendsListProps = {
  friends: TFriend[];
  isLoading: boolean;
  error: Error | null;
  ariaLabel: string;
  onSelectUser: (user: { id: number }) => void;
  showEmptyState?: boolean;
  rowVariant?: "Dropdown" | "InlineFilter";
  useInternalScroll?: boolean;
};

export function MyFriendsList({
  friends,
  isLoading,
  error,
  ariaLabel,
  onSelectUser,
  showEmptyState = true,
  rowVariant = "Dropdown",
  useInternalScroll = true,
}: MyFriendsListProps) {
  const { translate } = useTranslation();
  const thumbnails = useAvatarThumbnails(friends);
  const listClassName = classNames(
    "flex flex-col",
    useInternalScroll && "overflow-y-auto hide-scrollbar friends-listbox-cap",
  );

  // Logging + counter for the error path live in useMyFriends; the hook surfaces
  // the error here only so the UI can fall through to the empty-state copy.
  if (showEmptyState && (error || (!isLoading && friends.length === 0))) {
    return (
      <div className="flex items-center justify-center padding-medium">
        <span className="text-body-medium content-muted">{translate("EmptyState.NoFriends")}</span>
      </div>
    );
  }

  if (!isLoading && friends.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={classNames(listClassName, "gap-small")} role="listbox" aria-label={ariaLabel}>
        <div className="flex flex-row items-center gap-small padding-small" aria-busy="true">
          <div
            className={classNames(
              "radius-circle shrink-0",
              rowVariant === "InlineFilter"
                ? "height-1200 width-1200 bg-shift-200"
                : "height-800 width-800 bg-surface-300",
            )}
          />
          <div className="height-xsmall width-full bg-surface-300 radius-medium" />
        </div>
      </div>
    );
  }

  return (
    <div className={listClassName} role="listbox" aria-label={ariaLabel}>
      {friends.map(friend =>
        rowVariant === "InlineFilter" ? (
          <InlineFriendRow
            key={friend.id}
            friend={friend}
            thumbnailUrl={thumbnails[friend.id]}
            onSelectUser={onSelectUser}
          />
        ) : (
          <FriendRow
            key={friend.id}
            friend={friend}
            thumbnailUrl={thumbnails[friend.id]}
            onSelectUser={onSelectUser}
          />
        ),
      )}
    </div>
  );
}
