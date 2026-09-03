import { useCallback, useMemo } from "react";
import classNames from "classnames";
import { useTranslation } from "@rbx/core-scripts/react";
import { DisplayNameBadges, PLUS_BADGE_ARIA_LABEL_KEY, usePlusStatus } from "@rbx/identity-badges";
import { useAvatarThumbnails } from "../hooks/useAvatarThumbnails";
import { OmniSearchUser } from "../services/userSearchService";
import { trackCounter } from "../observability";
import { BlueCheckIcon } from "./BlueCheckIcon";
import { UserSearchRow } from "./UserSearchRow";

type PeopleSearchResultsProps = {
  users: OmniSearchUser[];
  onSelectUser: (user: OmniSearchUser) => void;
  /**
   * Separates this section from the friends list above it. When People is the
   * only section, the search block's own bottom padding is the whole gap.
   */
  hasSectionAbove?: boolean;
};

export function PeopleSearchResults({
  users,
  onSelectUser,
  hasSectionAbove = false,
}: PeopleSearchResultsProps) {
  const { translate } = useTranslation();
  const plusBadgeAriaLabel = translate(PLUS_BADGE_ARIA_LABEL_KEY);
  const thumbnails = useAvatarThumbnails(users);

  const userIds = useMemo(() => users.map(user => user.contentId), [users]);
  const { data: plusStatusByUserId } = usePlusStatus(userIds);

  const handleSelectUser = useCallback(
    (user: OmniSearchUser) => {
      trackCounter("UserSearchUserSelected");
      onSelectUser(user);
    },
    [onSelectUser],
  );

  if (users.length === 0) {
    return null;
  }

  const heading = translate("Label.PeopleWithCount", { count: users.length });

  return (
    <div
      className={classNames("flex flex-col", hasSectionAbove && "padding-top-large")}
      data-testid="people-search-results"
    >
      <h2
        className="text-title-large content-emphasis bg-surface-100 send-robux-section-heading"
        style={{ position: "sticky", top: 0, zIndex: 1 }}
      >
        {heading}
      </h2>
      <div role="listbox" aria-label={heading}>
        {users.map(user => {
          const badges = [
            user.hasVerifiedBadge ? <BlueCheckIcon key="verified" size={12} /> : null,
            plusStatusByUserId[user.contentId] === true ? (
              <DisplayNameBadges
                key="roblox-plus"
                isRobloxPlus
                size="Small"
                plusBadgeAriaLabel={plusBadgeAriaLabel}
              />
            ) : null,
          ];
          return (
            <UserSearchRow
              key={user.contentId}
              displayName={user.displayName}
              username={user.username}
              thumbnailUrl={thumbnails[user.contentId]}
              badges={badges}
              onSelect={() => {
                handleSelectUser(user);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
