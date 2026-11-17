import { JSX } from "react";
import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";
import { Icon, StatusIndicator } from "@rbx/foundation-ui";

const formatFriendRequestBadgeLabel = (count: number): string =>
  count > 99 ? "99+" : String(count);

const AddFriendsTile = ({
  translate,
  badgeCount,
}: {
  translate: TranslateFunction;
  badgeCount: number;
}): JSX.Element => (
  <div className="friends-carousel-tile">
    {/* TODO: old, migrated code */}
    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
    <button type="button" id="friend-tile-button">
      <a href="/users/friends#!/friend-requests" className="flex flex-col gap-xsmall">
        <div className="add-friends-icon-container">
          {badgeCount > 0 && (
            <StatusIndicator
              variant="Numeric"
              size="Large"
              value={formatFriendRequestBadgeLabel(badgeCount)}
              className="absolute top-[var(--size-100)] right-[var(--size-100)] [z-index:1]"
            />
          )}
          <Icon
            className="add-friends-icon content-secondary"
            name="icon-filled-plus-large"
            size="XLarge"
          />
        </div>
        <div
          data-testid="friends-carousel-tile-labels"
          className="max-width-2400 text-title-small text-no-wrap text-truncate-end text-align-x-center"
        >
          {translate("Label.AddFriends")}
        </div>
      </a>
    </button>
  </div>
);

export default AddFriendsTile;
