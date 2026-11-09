import { JSX } from "react";
import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";
import { Icon } from "@rbx/foundation-ui";
import { Badge } from "@rbx/foundation-ui-old-badge";

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
            <Badge
              className="friend-request-badge"
              variant="Alert"
              label={formatFriendRequestBadgeLabel(badgeCount)}
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
