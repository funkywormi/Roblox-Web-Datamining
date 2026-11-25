import React, { ComponentType, ReactNode, useCallback, useMemo } from "react";
import classNames from "classnames";
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
import type HomeSortHeader from "./HomeSortHeader";

export type TGameCarouselContainerHeaderProps = {
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
  trailingComponent?: ReactNode;
  translate: TranslateFunction;
};

type TGameCarouselContainerHeaderBaseProps = TGameCarouselContainerHeaderProps & {
  NewSortHeader?: typeof HomeSortHeader;
};

const GameCarouselContainerHeaderBase = ({
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
  trailingComponent,
  translate,
  NewSortHeader,
}: TGameCarouselContainerHeaderBaseProps): JSX.Element => {
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
    return <a href={seeAllLink}>{sortTitle}</a>;
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
      <a
        href={seeAllLink}
        onClick={handleSeeAllLinkClick}
        className="btn-secondary-xs see-all-link-icon btn-more"
      >
        {seeAllButtonText}
      </a>
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

  if (isNewSortHeaderEnabled && NewSortHeader) {
    return (
      <NewSortHeader
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
      <div
        className={classNames(titleContainerClassName, {
          "flex items-center": trailingComponent,
        })}
      >
        <h2 className={classNames("sort-header", { grow: trailingComponent })}>
          {sortTitleComponent}
          {tooltipText && <GamesInfoTooltip tooltipText={tooltipText} placement="right" />}
        </h2>
        {trailingComponent ? (
          <div className="flex items-center">
            {seeAllLinkComponent}
            {trailingComponent}
          </div>
        ) : (
          seeAllLinkComponent
        )}
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

GameCarouselContainerHeaderBase.defaultProps = {
  sortSubtitle: undefined,
  tooltipInfoText: undefined,
  hideSeeAll: undefined,
  endTimestamp: undefined,
  countdownString: undefined,
  buildNavigateToSortLinkEventProperties: undefined,
  backgroundImageAssetId: undefined,
  isNewSortHeaderEnabled: undefined,
  useRouterLink: false,
  trailingComponent: undefined,
};

export default GameCarouselContainerHeaderBase;
