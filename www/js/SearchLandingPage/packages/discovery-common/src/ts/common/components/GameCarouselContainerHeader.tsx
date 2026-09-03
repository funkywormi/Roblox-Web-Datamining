import React, { ComponentType, useCallback, useMemo } from "react";
import { Link } from "@rbx/core-ui";
import { Link as RouterLink } from "react-router-dom";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { TLinkComponentProps } from "@rbx/discovery-sdui-components";
import { sendEvent } from "@rbx/core-scripts/event-stream";
import GamesInfoTooltip from "./GamesInfoTooltip";
import {
  CommonGameSorts,
  FeatureGameDetails,
  FeaturePlacesList,
} from "../constants/translationConstants";
import eventStreamConstants, {
  TBuildNavigateToSortLinkEventProperties,
} from "../constants/eventStreamConstants";
import GameCarouselSubtitle from "./GameCarouselSubtitle";
import HomeSortHeader from "./HomeSortHeader";

type TGameCarouselContainerHeaderProps = {
  sortTitle: string;
  sortSubtitle?: string;
  seeAllLink: string | undefined;
  subtitleLink: string | undefined;
  shouldShowSeparateSubtitleLink: boolean;
  isSortLinkOverrideEnabled: boolean;
  buildNavigateToSortLinkEventProperties?: TBuildNavigateToSortLinkEventProperties;
  // subtitleAction takes precedence over the subtitleLink
  subtitleAction?: () => void;
  shouldShowSponsoredTooltip: boolean | undefined;
  tooltipInfoText?: string;
  titleContainerClassName: string;
  hideSeeAll?: boolean;
  endTimestamp?: string;
  countdownString?: string;
  backgroundImageAssetId?: number;
  isNewSortHeaderEnabled?: boolean;
  useRouterLink?: boolean;
  permitLinkClickPropagation?: boolean;
  translate: TranslateFunction;
};

const GameCarouselContainerHeader = ({
  sortTitle,
  sortSubtitle,
  seeAllLink,
  subtitleLink,
  shouldShowSeparateSubtitleLink,
  isSortLinkOverrideEnabled,
  buildNavigateToSortLinkEventProperties,
  subtitleAction,
  shouldShowSponsoredTooltip,
  tooltipInfoText,
  titleContainerClassName,
  hideSeeAll,
  endTimestamp,
  countdownString,
  backgroundImageAssetId,
  isNewSortHeaderEnabled,
  useRouterLink,
  permitLinkClickPropagation,
  translate,
}: TGameCarouselContainerHeaderProps): JSX.Element => {
  const tooltipText = useMemo(() => {
    if (tooltipInfoText) {
      return tooltipInfoText;
    }

    if (shouldShowSponsoredTooltip) {
      return (
        translate(CommonGameSorts.LabelSponsoredAdsDisclosureStatic) ||
        "Sponsored experiences are paid for by Creators. They may be shown to you based on general information about your device type, location, and demographics."
      );
    }

    return undefined;
  }, [shouldShowSponsoredTooltip, tooltipInfoText, translate]);

  const seeAllButtonText = useMemo(() => {
    if (isSortLinkOverrideEnabled) {
      return translate(FeatureGameDetails.LabelLearnMore);
    }

    return translate(FeaturePlacesList.ActionSeeAll);
  }, [isSortLinkOverrideEnabled, translate]);

  const handleSeeAllLinkClick = useCallback(() => {
    if (isSortLinkOverrideEnabled && buildNavigateToSortLinkEventProperties) {
      const params = buildNavigateToSortLinkEventProperties();
      const eventStreamParams = eventStreamConstants.navigateToSortLink(params);
      sendEvent(...eventStreamParams);
    }
  }, [isSortLinkOverrideEnabled, buildNavigateToSortLinkEventProperties]);

  const sortTitleComponent = useMemo(() => {
    if (hideSeeAll || !seeAllLink) {
      return <span>{sortTitle}</span>;
    }
    if (useRouterLink) {
      return <RouterLink to={seeAllLink}>{sortTitle}</RouterLink>;
    }
    return <Link url={seeAllLink}>{sortTitle}</Link>;
  }, [hideSeeAll, seeAllLink, useRouterLink, sortTitle]);

  const seeAllLinkComponent = useMemo(() => {
    if (hideSeeAll || !seeAllLink) {
      return null;
    }
    return useRouterLink ? (
      <RouterLink
        to={seeAllLink}
        onClick={handleSeeAllLinkClick}
        className="btn-secondary-xs see-all-link-icon btn-more"
      >
        {seeAllButtonText}
      </RouterLink>
    ) : (
      <Link
        url={seeAllLink}
        onClick={handleSeeAllLinkClick}
        className="btn-secondary-xs see-all-link-icon btn-more"
      >
        {seeAllButtonText}
      </Link>
    );
  }, [hideSeeAll, seeAllLink, useRouterLink, seeAllButtonText, handleSeeAllLinkClick]);

  // URL.canParse is used here because we want to detect absolute URLs that are already directly navigable.
  // These should use a standard anchor tag downstream rather than RouterLink, which is only appropriate for relative URLs.
  const getRouterLink = (
    link: string | undefined | null,
  ): ComponentType<TLinkComponentProps> | undefined => {
    if (!useRouterLink || !link || URL.canParse(link)) {
      return undefined;
    }
    return RouterLink as ComponentType<TLinkComponentProps>;
  };

  if (isNewSortHeaderEnabled) {
    return (
      <HomeSortHeader
        titleText={sortTitle}
        sendNavigateToSortLinkEvent={handleSeeAllLinkClick}
        subtitleAction={subtitleAction}
        titleLink={seeAllLink}
        isSortLinkOverrideEnabled={isSortLinkOverrideEnabled}
        subtitleText={sortSubtitle}
        subtitleLink={subtitleLink}
        shouldShowSeparateSubtitleLink={shouldShowSeparateSubtitleLink}
        hasBackgroundMural={!!backgroundImageAssetId}
        tooltipText={tooltipText}
        hideSeeAll={hideSeeAll}
        titleLinkComponent={getRouterLink(seeAllLink)}
        subtitleLinkComponent={getRouterLink(subtitleLink)}
        permitLinkClickPropagation={permitLinkClickPropagation}
      />
    );
  }

  return (
    <div className="game-sort-header-container">
      <div className={titleContainerClassName}>
        <h2 className="sort-header">
          {sortTitleComponent}
          {tooltipText && <GamesInfoTooltip tooltipText={tooltipText} placement="right" />}
        </h2>
        {seeAllLinkComponent}
      </div>
      <GameCarouselSubtitle
        defaultSubtitle={sortSubtitle}
        endTimestamp={endTimestamp}
        countdownString={countdownString}
        formatSubtitleLink={isSortLinkOverrideEnabled || shouldShowSeparateSubtitleLink}
        subtitleLink={subtitleLink}
        handleSeeAllLinkClick={handleSeeAllLinkClick}
        backgroundImageAssetId={backgroundImageAssetId}
      />
    </div>
  );
};

GameCarouselContainerHeader.defaultProps = {
  sortSubtitle: undefined,
  tooltipInfoText: undefined,
  hideSeeAll: undefined,
  endTimestamp: undefined,
  countdownString: undefined,
  buildNavigateToSortLinkEventProperties: undefined,
  backgroundImageAssetId: undefined,
  isNewSortHeaderEnabled: undefined,
  useRouterLink: false,
};

export default GameCarouselContainerHeader;
