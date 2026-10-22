import {
  authenticatedUser,
  isBlackbirdUser,
  type AuthenticatedUser,
} from "@rbx/core-scripts/meta/user";
import { useTranslations } from "@rbx/www-common/i18n";

import VerifiedBadgeIcon from "@rbx/www-common/components/verified-badge";
import DisplayNameBadges from "@rbx/identity-badges/DisplayNameBadges";
import { PLUS_BADGE_ARIA_LABEL, PLUS_BADGE_ARIA_LABEL_KEY } from "@rbx/identity-badges/constants";
import links from "../constants/linkConstants";
import { getNavCapability } from "../util/navCapabilities";
import Link from "./NavLink";

const useDisplayName = (user: AuthenticatedUser) => user.displayName ?? "";
const useVerifiedBadge = (user: AuthenticatedUser) => user.hasVerifiedBadge;
const usePlusBadgeDisabled = () => false;

function AgeBracketDisplayContent({ user }: { user: AuthenticatedUser }) {
  const tBadges = useTranslations("Feature.ProfileBadges");
  const tSubscription = useTranslations("Feature.RobloxSubscription");
  const AvatarHeadshot = getNavCapability("AvatarHeadshot");
  const nameForDisplay = (getNavCapability("useLiveUserNameForDisplay") ?? useDisplayName)(user);
  const hasVerifiedBadge = (getNavCapability("useHasVerifiedBadge") ?? useVerifiedBadge)(user);
  const isPlusBadgeEnabled = (getNavCapability("useIsPlusBadgeEnabled") ?? usePlusBadgeDisabled)();

  const badgeToRender = hasVerifiedBadge ? (
    <section>
      <VerifiedBadgeIcon
        className="verified-badge-icon-header"
        size="Small"
        titleText={tBadges("Creator.VerifiedBadgeIconAccessibilityText")}
      />
    </section>
  ) : null;

  const showPlusBadge = isPlusBadgeEnabled && isBlackbirdUser();

  return (
    <li className="age-bracket-label text-header">
      <Link
        className="text-link dynamic-overflow-container"
        url={links.scrollListItems.profile.url}
      >
        <span className="avatar avatar-headshot-xs">
          {AvatarHeadshot ? (
            <AvatarHeadshot
              containerClass="avatar-card-image"
              userId={user.id ?? 0}
              altName={user.name ?? undefined}
            />
          ) : null}
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
    </li>
  );
}

export default function AgeBracketDisplay() {
  const user = authenticatedUser();
  return user == null ? null : <AgeBracketDisplayContent user={user} />;
}
