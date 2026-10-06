import { authenticatedUser, isBlackbirdUser } from "@rbx/core-scripts/meta/user";
import { useTranslations } from "@rbx/www-common/i18n";

import { Thumbnail2d, ThumbnailTypes } from "@rbx/thumbnails";
import VerifiedBadgeIcon from "@rbx/www-common/components/verified-badge";
import {
  DisplayNameBadges,
  useIsPlusBadgeEnabled,
  PLUS_BADGE_ARIA_LABEL,
  PLUS_BADGE_ARIA_LABEL_KEY,
} from "@rbx/identity-badges";
import links from "../constants/linkConstants";
import { useLiveUserNameForDisplay } from "../hooks/useLiveUserNameForDisplay";
import Link from "./NavLink";

export default function AgeBracketDisplayContent() {
  const tBadges = useTranslations("Feature.ProfileBadges");
  const tSubscription = useTranslations("Feature.RobloxSubscription");
  const user = authenticatedUser();
  const nameForDisplay = useLiveUserNameForDisplay(user);

  const badgeToRender = user?.hasVerifiedBadge ? (
    <section>
      <VerifiedBadgeIcon
        className="verified-badge-icon-header"
        size="Small"
        titleText={tBadges("Creator.VerifiedBadgeIconAccessibilityText")}
      />
    </section>
  ) : null;

  const showPlusBadge = useIsPlusBadgeEnabled() && isBlackbirdUser();

  return (
    <div className="age-bracket-label text-header">
      <Link
        className="text-link dynamic-overflow-container"
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
        <span className="text-overflow age-bracket-label-username font-caption-header">
          {nameForDisplay}
        </span>
        {badgeToRender}
        {showPlusBadge ? (
          <section className="age-bracket-label-plus-badge">
            <DisplayNameBadges
              isRobloxPlus
              size="Small"
              plusBadgeAriaLabel={
                tSubscription.has(PLUS_BADGE_ARIA_LABEL_KEY)
                  ? tSubscription(PLUS_BADGE_ARIA_LABEL_KEY)
                  : PLUS_BADGE_ARIA_LABEL
              }
            />
          </section>
        ) : null}
      </Link>
    </div>
  );
}
