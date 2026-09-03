import { JSX } from "react";
import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";
import { Icon } from "@rbx/foundation-ui";
import { Badge } from "@rbx/foundation-ui-old-badge";

const ADD_FRIENDS_URL = "/users/friends#!/friend-requests";

const ADD_FRIENDS_TRANSLATIONS_KEY = "Label.AddFriends";

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
      <a href={ADD_FRIENDS_URL}>
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
        <div className="friends-carousel-tile-labels" data-testid="friends-carousel-tile-labels">
          <div className="friends-carousel-tile-label">
            <div className="friends-carousel-tile-name">
              <span className="friends-carousel-display-name">
                {translate(ADD_FRIENDS_TRANSLATIONS_KEY)}
              </span>
            </div>
          </div>
        </div>
      </a>
    </button>
  </div>
);
export default AddFriendsTile;
