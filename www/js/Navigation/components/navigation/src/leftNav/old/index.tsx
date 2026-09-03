import { useState, useCallback, useEffect } from "react";
import ClassNames from "classnames";
import { useTranslation } from "@rbx/core-scripts/react";
import { Link, ScrollBar } from "@rbx/core-ui";
import { Thumbnail2d, ThumbnailTypes } from "@rbx/thumbnails";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import VerifiedBadgeIcon from "@rbx/www-common/components/verified-badge";
import { UncheckedBadge, showUncheckedBadge } from "@rbx/identity-badges";
import links from "../../constants/linkConstants";
import ScrollListContainer from "./ScrollListContainer";
import { useLiveUserNameForDisplay } from "../../hooks/useLiveUserNameForDisplay";
import layoutConstants from "../../constants/layoutConstants";
import { sendLeftSidebarEvent } from "../../services/eventService";

const { headerMenuIconClickEvent } = layoutConstants;

export default function LeftNavigation() {
  const { translate } = useTranslation();
  const [isLeftNavOpen, setIsLeftNavOpen] = useState(false);
  const user = authenticatedUser();
  const nameForDisplay = useLiveUserNameForDisplay(user);

  const onClickMenuIcon = useCallback(() => {
    setIsLeftNavOpen(isOpen => {
      const open = !isOpen;
      sendLeftSidebarEvent(open, "OLD");
      return open;
    });
  }, [setIsLeftNavOpen]);

  useEffect(() => {
    document.addEventListener(headerMenuIconClickEvent.name, onClickMenuIcon);
    return () => {
      document.removeEventListener(headerMenuIconClickEvent.name, onClickMenuIcon);
    };
  }, [onClickMenuIcon]);

  const showBadge = user?.hasVerifiedBadge ?? false;
  const badgeToRender = showBadge ? (
    <section>
      <VerifiedBadgeIcon
        className="verified-badge-icon-header"
        size="Small"
        titleText={translate("Creator.VerifiedBadgeIconAccessibilityText")}
      />
    </section>
  ) : null;

  const classNames = ClassNames("rbx-left-col", {
    "nav-show": isLeftNavOpen,
  });

  const displayNameDivClasses = ClassNames("font-header-2 dynamic-ellipsis-item", {
    "verified-badge-left-nav": showBadge,
  });

  return (
    <div id="navigation" className={classNames}>
      <ul>
        <li key="username">
          <Link
            className="dynamic-overflow-container text-nav"
            role="link"
            url={links.scrollListItems.profile.url}
          >
            <span className="avatar avatar-headshot-xs">
              <Thumbnail2d
                containerClass="avatar-card-image"
                targetId={user?.id ?? 0}
                type={ThumbnailTypes.avatarHeadshot}
                altName={user?.name ?? undefined}
                includeProfileFrame
              />
            </span>
            <span className="flex flex-col gap-xsmall min-width-0 large:flex-row large:align-items-center">
              <span className="flex gap-xsmall min-width-0 align-items-center">
                <div className={displayNameDivClasses}>{nameForDisplay}</div>
                {badgeToRender}
              </span>
              {showUncheckedBadge() ? (
                <span className="flex items-center large:fill large:basis-auto large:padding-x-small large:justify-end">
                  <UncheckedBadge />
                </span>
              ) : null}
            </span>
          </Link>
        </li>
        <li key="divider" className="rbx-divider" />
      </ul>
      <ScrollBar className="rbx-scrollbar">
        <ScrollListContainer />
      </ScrollBar>
    </div>
  );
}
