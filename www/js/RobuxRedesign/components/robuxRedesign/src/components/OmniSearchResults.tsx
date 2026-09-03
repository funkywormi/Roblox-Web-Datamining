import { useCallback, useMemo } from "react";
import classNames from "classnames";
import { useTranslation } from "@rbx/core-scripts/react";
import { Icon } from "@rbx/foundation-ui";
import {
  DisplayNameBadges,
  usePlusStatus,
  PLUS_BADGE_ARIA_LABEL,
  PLUS_BADGE_ARIA_LABEL_KEY,
} from "@rbx/identity-badges";
import { useAvatarThumbnails } from "../hooks/useAvatarThumbnails";
import { OmniSearchUser } from "../services/userSearchService";
import { trackCounter } from "../observability";

type OmniSearchResultsProps = {
  users: OmniSearchUser[];
  isSearching: boolean;
  searchText: string;
  focusedIndex: number;
  onSelectUser: (user: OmniSearchUser) => void;
};

export function OmniSearchResults({
  users,
  isSearching,
  searchText,
  focusedIndex,
  onSelectUser,
}: OmniSearchResultsProps) {
  const { translate } = useTranslation();
  const plusBadgeAriaLabel = translate(PLUS_BADGE_ARIA_LABEL_KEY, undefined, PLUS_BADGE_ARIA_LABEL);
  const thumbnails = useAvatarThumbnails(users);
  const userIds = useMemo(() => users.map(u => u.contentId), [users]);
  const { data: plusStatusByUserId } = usePlusStatus(userIds);

  const handleSelectUser = useCallback(
    (user: OmniSearchUser) => {
      trackCounter("UserSearchUserSelected");
      onSelectUser(user);
    },
    [onSelectUser],
  );

  return (
    <div
      className="flex flex-col width-full overflow-hidden"
      role="combobox"
      tabIndex={-1}
      aria-haspopup="listbox"
      aria-controls="user-search-listbox"
      aria-expanded={users.length > 0}
    >
      {users.length > 0 ? (
        <div
          id="user-search-listbox"
          role="listbox"
          className="flex flex-col bg-surface-200 overflow-y-auto padding-small"
          style={{
            minHeight: 0,
            borderRadius: 16,
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)",
          }}
        >
          {users.map((user, index) => {
            const usernameDisplay = `@${user.username}`;
            return (
              <div
                key={user.contentId}
                className={classNames(
                  "flex flex-row items-center gap-small padding-small width-full cursor-pointer shrink-0",
                  focusedIndex === index ? "bg-surface-300" : "bg-transparent",
                )}
                style={{ borderRadius: 12 }}
                onClick={() => {
                  handleSelectUser(user);
                }}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectUser(user);
                  }
                }}
                role="option"
                tabIndex={0}
                id={`user-${user.contentId}`}
                aria-selected={focusedIndex === index}
                aria-label={`${user.displayName} @${user.username}`}
              >
                <div className="height-800 width-800 radius-circle clip shrink-0 bg-surface-300 flex items-center justify-center">
                  {thumbnails[user.contentId] ? (
                    <img
                      src={thumbnails[user.contentId]}
                      alt={user.displayName}
                      className="height-full width-full object-cover"
                    />
                  ) : (
                    <Icon name="icon-regular-person" size="Small" />
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <span className="inline-flex items-center gap-xxsmall text-body-medium content-emphasis">
                    <span>{user.displayName}</span>
                    {plusStatusByUserId[user.contentId] === true && (
                      <DisplayNameBadges
                        isRobloxPlus
                        size="Small"
                        plusBadgeAriaLabel={plusBadgeAriaLabel}
                      />
                    )}
                  </span>
                  <span className="text-body-small content-muted">{usernameDisplay}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        !isSearching &&
        searchText.length > 0 && (
          <div
            className="flex items-center justify-center padding-small bg-surface-200"
            style={{ borderRadius: 16, boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)" }}
          >
            <span className="text-body-medium content-muted">
              {translate("Label.NoResultsFound")}
            </span>
          </div>
        )
      )}
    </div>
  );
}
