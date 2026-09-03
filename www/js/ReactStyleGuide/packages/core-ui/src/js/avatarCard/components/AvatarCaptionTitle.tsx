import classNames from "classnames";
import type { ComponentType, JSX } from "react";
import { Icon } from "@rbx/foundation-ui";

const ROBLOX_PLUS_BADGE_ARIA_LABEL = "Roblox Plus subscriber";

type VerifiedBadgeData = {
  hasVerifiedBadge?: boolean;
  titleText?: string;
};

// Narrow window-global type for the optional `roblox-badges` external.
// The component is consumed on devops surfaces where this global may be
// missing, so we keep the runtime guard.
type VerifiedBadgeIconContainerProps = {
  overrideImgClass?: string;
  size?: unknown;
  titleText?: string;
};
type RobloxBadgesGlobal = {
  VerifiedBadgeIconContainer: ComponentType<VerifiedBadgeIconContainerProps>;
  BadgeSizes: { CAPTIONHEADER: unknown };
};
declare global {
  interface Window {
    RobloxBadges?: RobloxBadgesGlobal;
  }
}

export type AvatarCaptionTitleProps = {
  title?: string;
  titleLink?: string;
  verifiedBadgeData?: VerifiedBadgeData;
  /** SUBS-5048: when true, render the Roblox Plus subscriber badge after the title. */
  isRobloxPlus?: boolean;
};

const AvatarCaptionTitle = ({
  title = "",
  titleLink = "",
  verifiedBadgeData = {},
  isRobloxPlus = false,
}: AvatarCaptionTitleProps): JSX.Element => {
  // Can't use the normal `import { VerifiedBadgeIcon } from 'roblox-badges'`
  // here because this component renders on the devops site where
  // roblox-badges does not exist.
  let verifiedIcon: JSX.Element | null = null;

  if (window.RobloxBadges && verifiedBadgeData.hasVerifiedBadge === true) {
    const { VerifiedBadgeIconContainer, BadgeSizes } = window.RobloxBadges;

    verifiedIcon = (
      <VerifiedBadgeIconContainer
        overrideImgClass="verified-badge-friends-img"
        size={BadgeSizes.CAPTIONHEADER}
        titleText={verifiedBadgeData.titleText}
      />
    );
  }

  const plusIcon: JSX.Element | null = isRobloxPlus ? (
    <Icon
      name="icon-regular-roblox-plus"
      size="Small"
      className="icon-display-name-badge-plus"
      aria-label={ROBLOX_PLUS_BADGE_ARIA_LABEL}
    />
  ) : null;

  return (
    <div
      className={classNames("avatar-name-container", {
        verified: verifiedBadgeData.hasVerifiedBadge,
        shimmer: !title,
      })}
    >
      {titleLink ? (
        <a href={titleLink} className="text-overflow avatar-name">
          {title}
        </a>
      ) : (
        <div className="text-overflow avatar-name">{title}</div>
      )}
      {verifiedIcon}
      {plusIcon}
    </div>
  );
};

export default AvatarCaptionTitle;
