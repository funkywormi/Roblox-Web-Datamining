import { type ReactElement } from "react";
import { clsx, Icon, type TIconSize } from "@rbx/foundation-ui";

export type VerifiedBadgeIconProps = {
  /** Accessible label for the badge (e.g. a localized "Verified Badge"). */
  titleText: string;
  /** Foundation icon size. Defaults to XSmall (inline, next to a creator name). */
  size?: TIconSize;
  /** Extra classes on the wrapper (e.g. spacing). */
  className?: string;
};

// Next-clean verified badge — the slice the avatar editor's item cards need (injected as ItemCard's
// `iconToRender`). Renders Foundation UI's two-tone verified glyph (blue backplate + white check
// stacked, as in @rbx/identity-badges) instead of @rbx/badge-components, so there's no MUI /
// React-17 / inlined-SVG dependency. `content-system-emphasis` is the verified-blue color token.
const VerifiedBadgeIcon = ({
  titleText,
  size = "XSmall",
  className,
}: VerifiedBadgeIconProps): ReactElement => (
  <span
    className={clsx("relative inline-flex items-center justify-center", className)}
    role="img"
    aria-label={titleText}
    title={titleText}
  >
    <Icon name="icon-filled-verified-backplate" className="content-system-emphasis" size={size} />
    <Icon name="icon-filled-verified-check" className="absolute content-[white]" size={size} />
  </span>
);

export default VerifiedBadgeIcon;
