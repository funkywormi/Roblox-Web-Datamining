import { useLayoutEffect, useRef, useState } from "react";
import classNames from "classnames";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { CommonGameSorts, FeatureGamePage } from "../constants/translationConstants";
import GamesInfoTooltip from "./GamesInfoTooltip";
import { SponsoredFooterAdLabelText } from "../types/sponsoredTileTypes";

/*
 * WideGameTileSponsoredFooter variants
 * - default: "Sponsored" + info tooltip (active when sponsoredFooterAdLabelText
 *   is not provided and isSponsoredFooterAllowed is true)
 * - override:
 *   - Text: "Ad" or "Sponsored" controlled by sponsoredFooterAdLabelText
 *   - Secondary Content: Element passed in as secondaryContent prop, currently
 *     used for rating element
 *   - Order: Controlled by sponsoredFooterAdLabelFirst prop, by default order
 *     is text then secondary content separated by a bullet
 *
 * Secondary content (bullet + secondary element) is always rendered in the DOM
 * but dynamically shown/hidden via CSS class based on whether the full footer
 * fits within the container. A hidden shadow element (position: absolute,
 * visibility: hidden) is used to measure the natural content width without
 * affecting layout, since the footer uses a flex layout where scrollWidth
 * always equals clientWidth. The ad label is always visible.
 */
const BUFFER_PX = 2;

const WideGameTileSponsoredFooter = ({
  sponsoredFooterAdLabelText,
  sponsoredFooterAdLabelFirst,
  secondaryContent,
  translate,
}: {
  sponsoredFooterAdLabelText?: string;
  sponsoredFooterAdLabelFirst?: boolean;
  secondaryContent?: JSX.Element;
  translate: TranslateFunction;
}): JSX.Element => {
  const isLegacySponsoredFooter = !sponsoredFooterAdLabelText;

  const adLabel =
    sponsoredFooterAdLabelText === SponsoredFooterAdLabelText.Ad
      ? FeatureGamePage.LabelAd
      : FeatureGamePage.LabelSponsoredAd;

  const containerRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const hasSecondaryContent = !!secondaryContent;
  const [shouldShowSecondary, setShouldShowSecondary] = useState(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const shadow = shadowRef.current;
    if (!container || !shadow || !hasSecondaryContent) return undefined;

    const checkOverflow = () => {
      const availableWidth = container.clientWidth;
      const neededWidth = shadow.clientWidth;
      setShouldShowSecondary(neededWidth + BUFFER_PX <= availableWidth);
    };

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(container);
    return () => observer.disconnect();
  }, [hasSecondaryContent]);

  const adLabelElement = (
    <span className="info-label sponsored-ad-label">{translate(adLabel)}</span>
  );
  const secondaryElement = secondaryContent ? (
    <span className="secondary-content">{secondaryContent}</span>
  ) : null;
  const bulletElement = <span className="bullet secondary-content info-label ">•</span>;

  const firstElement = sponsoredFooterAdLabelFirst ? adLabelElement : secondaryElement;
  const secondElement = sponsoredFooterAdLabelFirst ? secondaryElement : adLabelElement;

  return (
    <div
      ref={containerRef}
      className={classNames("game-card-info", "sponsored-footer", {
        "show-secondary": shouldShowSecondary && hasSecondaryContent,
      })}
      data-testid="wide-game-tile-sponsored-footer"
    >
      {firstElement}
      {secondaryContent && bulletElement}
      {secondElement}
      {isLegacySponsoredFooter && (
        <GamesInfoTooltip
          tooltipText={
            translate(CommonGameSorts.LabelSponsoredAdsDisclosureStatic) ||
            "Sponsored experiences are paid for by Creators. They may be shown to you based on general information about your device type, location, and demographics."
          }
          placement="right"
          sizeInPx={16}
        />
      )}
      {/* Hidden shadow element for measuring natural content width. Used to determine whether or not to collapse the footer to just the ad label when secondary content exists. */}
      {hasSecondaryContent && (
        <div
          ref={shadowRef}
          className="game-card-info sponsored-footer show-secondary"
          style={{
            position: "absolute",
            visibility: "hidden",
            width: "max-content",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        >
          {firstElement}
          {bulletElement}
          {secondElement}
        </div>
      )}
    </div>
  );
};

export default WideGameTileSponsoredFooter;
