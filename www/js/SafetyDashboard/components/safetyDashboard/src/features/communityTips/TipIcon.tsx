import { Fragment } from "react";
import communityDark from "@rbx/foundation-images/pictograms/community_dark.svg";
import communityLight from "@rbx/foundation-images/pictograms/community_light.svg";
import globeDark from "@rbx/foundation-images/pictograms/globe_dark.svg";
import globeLight from "@rbx/foundation-images/pictograms/globe_light.svg";
import linkAngleDark from "@rbx/foundation-images/pictograms/link_angle_dark.svg";
import linkAngleLight from "@rbx/foundation-images/pictograms/link_angle_light.svg";
import lockDark from "@rbx/foundation-images/pictograms/lock_dark.svg";
import lockLight from "@rbx/foundation-images/pictograms/lock_light.svg";
import magnifyGlassPersonDark from "@rbx/foundation-images/pictograms/magnifyglassperson_dark.svg";
import magnifyGlassPersonLight from "@rbx/foundation-images/pictograms/magnifyglassperson_light.svg";
import speechBubbleCircleSlashDark from "@rbx/foundation-images/pictograms/speechbubblecircleslash_dark.svg";
import speechBubbleCircleSlashLight from "@rbx/foundation-images/pictograms/speechbubblecircleslash_light.svg";
import speechBubbleHeartDark from "@rbx/foundation-images/pictograms/speechbubbleheart_dark.svg";
import speechBubbleHeartLight from "@rbx/foundation-images/pictograms/speechbubbleheart_light.svg";
import thumbsUpDark from "@rbx/foundation-images/pictograms/thumbsup_dark.svg";
import thumbsUpLight from "@rbx/foundation-images/pictograms/thumbsup_light.svg";
import trophyDark from "@rbx/foundation-images/pictograms/trophy_dark.svg";
import trophyLight from "@rbx/foundation-images/pictograms/trophy_light.svg";

interface TipIconProps {
  imageName: string;
}

interface PictogramVariants {
  light: string;
  dark: string;
}

const COMMUNITY_PICTOGRAM: PictogramVariants = { light: communityLight, dark: communityDark };

/**
 * Maps a backend `imageName` directly to its Foundation pictogram SVG. Imports are static so
 * the bundler can resolve each SVG to an asset URL at build time.
 */
const PICTOGRAM_MAP: Record<string, PictogramVariants> = {
  community: COMMUNITY_PICTOGRAM,
  thumbsup: { light: thumbsUpLight, dark: thumbsUpDark },
  globe: { light: globeLight, dark: globeDark },
  link_angle: { light: linkAngleLight, dark: linkAngleDark },
  lock: { light: lockLight, dark: lockDark },
  magnifyglassperson: { light: magnifyGlassPersonLight, dark: magnifyGlassPersonDark },
  speechbubblecircleslash: {
    light: speechBubbleCircleSlashLight,
    dark: speechBubbleCircleSlashDark,
  },
  speechbubbleheart: { light: speechBubbleHeartLight, dark: speechBubbleHeartDark },
  trophy: { light: trophyLight, dark: trophyDark },
};

/**
 * Renders the appropriate pictogram SVG based on the current theme.
 * Unknown image names fall back to `DEFAULT_PICTOGRAM`.
 */
const TipIcon = ({ imageName }: TipIconProps) => {
  const pictogram = PICTOGRAM_MAP[imageName] ?? COMMUNITY_PICTOGRAM;

  return (
    <Fragment>
      <img src={pictogram.light} alt="" className="dark:hidden" />
      <img src={pictogram.dark} alt="" className="hidden dark:block" />
    </Fragment>
  );
};

export default TipIcon;
