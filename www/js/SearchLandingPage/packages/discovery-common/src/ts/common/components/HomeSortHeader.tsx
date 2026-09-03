import React, { ComponentType, useMemo } from "react";
import { useTokens } from "@rbx/core-scripts/react";
import { SectionHeader, TLinkComponentProps } from "@rbx/discovery-sdui-components";
import GamesInfoTooltip from "./GamesInfoTooltip";
import "../../sdui/style/_sduiIcons.scss";

type THomeSortHeaderProps = {
  // Text to display in the title
  titleText: string;

  // Function to send telemetry for a navigateToSortLink event
  // If there is not a See All link override, the function is a no-op
  sendNavigateToSortLinkEvent: (() => void) | undefined;

  // Link to navigate to when the title is clicked
  titleLink: string | undefined;

  // Whether the titleLink is overridden with an arbitrary link (not a See All page navigation link)
  isSortLinkOverrideEnabled: boolean;

  // Text to display in the subtitle
  subtitleText: string | undefined;

  // Link to navigate to when the subtitle is clicked (or titleLink, if shouldShowSeparateSubtitleLink is false)
  subtitleLink: string | undefined;

  // Whether the subtitle link is separate from the title link
  shouldShowSeparateSubtitleLink: boolean;

  // Optional callback for when the subtitle is activated. If provided, takes precedence over subtitle link navigation
  subtitleAction?: () => void;

  // Whether there is a background mural on the sort
  hasBackgroundMural: boolean;

  // Text to display in the tooltip
  tooltipText: string | undefined;

  // Whether to hide the See All button and seeAllLink
  hideSeeAll: boolean | undefined;

  // Custom title link component (e.g. React Router's Link) that is rendered instead of plain <a> tags
  titleLinkComponent?: ComponentType<TLinkComponentProps>;

  // Custom subtitle link component (e.g. React Router's Link) that is rendered instead of plain <a> tags
  subtitleLinkComponent?: ComponentType<TLinkComponentProps>;

  // When true, allows click event to bubble up from both title and subtitle links
  permitLinkClickPropagation?: boolean;
};

/**
 * Experimental version of sort header for Home page.
 * Uses the presentational SectionHeader component, but hardcodes the values
 * to match the values expected from backend with the SduiSectionHeader.
 */
const HomeSortHeader = ({
  titleText,
  sendNavigateToSortLinkEvent,
  titleLink,
  isSortLinkOverrideEnabled,
  subtitleText,
  subtitleLink,
  shouldShowSeparateSubtitleLink,
  subtitleAction,
  hasBackgroundMural,
  tooltipText,
  hideSeeAll,
  titleLinkComponent,
  subtitleLinkComponent,
  permitLinkClickPropagation,
}: THomeSortHeaderProps): JSX.Element => {
  const tokens = useTokens();

  const hasSubtitleLink =
    !subtitleAction &&
    (isSortLinkOverrideEnabled || shouldShowSeparateSubtitleLink) &&
    subtitleLink &&
    subtitleText;

  const subtitleTextColor = useMemo(() => {
    if (subtitleText) {
      return hasBackgroundMural
        ? tokens.Color.Extended.Gray.Gray_100
        : tokens.Color.Content.Emphasis;
    }

    return undefined;
  }, [
    subtitleText,
    hasBackgroundMural,
    tokens.Color.Extended.Gray.Gray_100,
    tokens.Color.Content.Emphasis,
  ]);

  const subtitleIconClassName = useMemo(() => {
    if (hasSubtitleLink) {
      // Force icon to dark mode if there is a background mural
      return hasBackgroundMural ? "icon-chevron-right-dark" : "icon-chevron-right";
    }

    return undefined;
  }, [hasSubtitleLink, hasBackgroundMural]);

  const onSubtitleActivated = useMemo(() => {
    if (subtitleAction) {
      return subtitleAction;
    }
    if (hasSubtitleLink) {
      return sendNavigateToSortLinkEvent;
    }
    return undefined;
  }, [subtitleAction, hasSubtitleLink, sendNavigateToSortLinkEvent]);

  return (
    <div className="home-sort-header-container" style={{ marginBottom: tokens.Gap.Large }}>
      <SectionHeader
        titleText={titleText}
        onTitleActivated={hideSeeAll ? undefined : sendNavigateToSortLinkEvent}
        titleLinkPath={hideSeeAll ? undefined : titleLink}
        permitLinkClickPropagation={permitLinkClickPropagation}
        titleLinkComponent={titleLinkComponent}
        // Force text color to dark mode token (white) if there is a background mural
        titleTextColor={
          hasBackgroundMural ? tokens.Color.Extended.Gray.Gray_100 : tokens.Color.Content.Emphasis
        }
        titleFontStyle={tokens.Typography.HeadingSmall}
        titleGap={hideSeeAll ? undefined : tokens.Gap.XSmall}
        titleIconClassName={hideSeeAll ? undefined : "sdui-icon icon-push-right-16x16"}
        titleIconWidth={hideSeeAll ? undefined : 16}
        titleIconFirst={false}
        subtitleText={subtitleText || undefined}
        // Force text color to dark mode token (white) if there is a background mural
        subtitleTextColor={subtitleTextColor}
        subtitleFontStyle={subtitleText ? tokens.Typography.BodyMedium : undefined}
        subtitleGap={hasSubtitleLink ? tokens.Gap.XXSmall : undefined}
        onSubtitleActivated={onSubtitleActivated}
        subtitleLinkPath={hasSubtitleLink ? subtitleLink : undefined}
        subtitleLinkComponent={subtitleLinkComponent}
        subtitleIconClassName={hasSubtitleLink ? subtitleIconClassName : undefined}
        subtitleIconWidth={hasSubtitleLink ? 22 : undefined}
        subtitleIconFirst={false}
        verticalGap={tokens.Gap.XXSmall}
        iconComponent={
          tooltipText ? (
            <GamesInfoTooltip tooltipText={tooltipText} placement="left" centerIcon />
          ) : undefined
        }
        containerOverrides={
          hasBackgroundMural
            ? {
                // Ensure that the sort header appears above the background mural
                zIndex: 1,
              }
            : undefined
        }
      />
    </div>
  );
};

export default HomeSortHeader;
