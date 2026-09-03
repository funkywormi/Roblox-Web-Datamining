import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { WithTranslationsProps } from "@rbx/core-scripts/react";
import { getAbsoluteUrl } from "@rbx/core-scripts/util/url";
import { buildSortDetailUrl } from "../../common/utils/browserUtils";
import {
  EventStreamMetadata,
  SessionInfoType,
  TBuildNavigateToSortLinkEventProperties,
  TCarouselGameImpressions,
  TGameDetailReferral,
} from "../../common/constants/eventStreamConstants";
import { PageContext } from "../../common/types/pageContext";
import { TGameData, TGetFriendsResponse } from "../../common/types/bedev1Types";
import {
  TComponentType,
  TGameSort,
  TPlayButtonStyle,
  TPlayerCountStyle,
  THoverStyle,
  TRequestIntent,
} from "../../common/types/bedev2Types";
import { TOmniRecommendationAnalyticsData } from "../../common/types/analyticsTypes";
import { GameCarousel } from "../../common/components/GameCarousel";
import { TBuildEventProperties } from "../../common/components/GameTileUtils";
import useGameImpressionsIntersectionTracker, {
  TBuildCarouselGameImpressionsEventProperties,
} from "../../common/hooks/useGameImpressionsIntersectionTracker";
import {
  getAbsoluteRowClickData,
  getAbsoluteRowImpressionsData,
  getSponsoredAdImpressionsData,
  getThumbnailAssetIdImpressionsData,
  getTileBadgeContextsImpressionsData,
  getTileFooterImpressionsData,
} from "../../common/utils/parsingUtils";
import {
  buildOmniRecommendationGameImpressionsAnalyticsData,
  buildOmniRecommendationTileAnalyticsData,
  mergeEventParamsWithAnalyticsData,
} from "../../common/utils/analyticsDataUtils";
import { usePageSession } from "../../common/utils/PageSessionContext";
import GameCarouselContainerHeader from "../../common/components/GameCarouselContainerHeader";
import { homePage } from "../../common/constants/configConstants";
import SortBackgroundMuralWrapper from "./SortBackgroundMuralWrapper";
import GameCarouselHorizontalScroll from "../../gamesPage/components/GameCarouselHorizontalScroll";
import useAmpUpsellAction from "../../common/hooks/useAmpUpsellAction";
import {
  UpsellComponent,
  UpsellEntrySurface,
  UpsellPurpose,
  UpsellStage,
} from "../../homePageUpsellCard/constants/upsellAnalyticsConstants";

type THomePageGameCarouselDiscoveryApiProps = {
  positionId: number;
  gameData: TGameData[];
  sort: TGameSort;
  friendsPresence: TGetFriendsResponse[];
  translate: WithTranslationsProps["translate"];
  startingRow: number | undefined;
  componentType?: TComponentType;
  playerCountStyle?: TPlayerCountStyle;
  playButtonStyle?: TPlayButtonStyle;
  hoverStyle?: THoverStyle;
  tooltipInfoText?: string;
  hideSeeAll?: boolean;
  navigationRootPlaceId?: string;
  isSponsoredFooterAllowed?: boolean;
  seeAllLinkPath?: string;
  subtitleLinkPath?: string;
  itemsPerRow?: number;
  topicPositionOffset?: number;
  endTimestamp?: string;
  countdownString?: string;
  hideTileMetadata?: boolean;
  isDynamicLayoutSizingEnabled?: boolean;
  isCarouselHorizontalScrollEnabled?: boolean;
  isNewScrollArrowsEnabled?: boolean;
  isNewSortHeaderEnabled?: boolean;
  omniAnalyticsData: TOmniRecommendationAnalyticsData;
  refreshFeed?: (requestIntent?: TRequestIntent) => void;
};

const AMP_UPSELL_EVENT_CONTEXT = "gameCarousel";
const AMP_UPSELL_ANALYTICS_CONFIG = {
  upsellEntrySurface: UpsellEntrySurface.Homepage,
  upsellComponent: UpsellComponent.Carousel,
  upsellStage: UpsellStage.Fae,
  upsellPurpose: UpsellPurpose.FacialAgeEstimation,
};

export const HomePageCarousel = ({
  translate,
  friendsPresence,
  gameData,
  sort,
  positionId,
  componentType,
  playerCountStyle,
  playButtonStyle,
  hoverStyle,
  tooltipInfoText,
  hideSeeAll,
  navigationRootPlaceId,
  isSponsoredFooterAllowed,
  seeAllLinkPath,
  subtitleLinkPath,
  itemsPerRow,
  topicPositionOffset,
  startingRow,
  endTimestamp,
  countdownString,
  hideTileMetadata,
  isDynamicLayoutSizingEnabled,
  isCarouselHorizontalScrollEnabled,
  isNewScrollArrowsEnabled,
  isNewSortHeaderEnabled,
  omniAnalyticsData,
  refreshFeed,
}: THomePageGameCarouselDiscoveryApiProps): JSX.Element => {
  // Type union will be cleaned up with isCarouselHorizontalScrollEnabled
  const carouselRef = useRef<HTMLDivElement | HTMLUListElement>(null);
  const tileRef = useRef<HTMLDivElement>(null);
  const homePageSessionInfo = usePageSession();
  const buildEventProperties: TBuildEventProperties = (data, id) => {
    const eventParams: TGameDetailReferral = {
      [EventStreamMetadata.PlaceId]: data.placeIdOverride ?? data.placeId,
      [EventStreamMetadata.PlaceIdOverride]: data.placeIdOverride,
      [EventStreamMetadata.UniverseId]: data.universeId,
      [EventStreamMetadata.IsAd]: data.isSponsored,
      [EventStreamMetadata.NativeAdData]: data.nativeAdData,
      [EventStreamMetadata.Position]: id,
      ...getAbsoluteRowClickData(startingRow, itemsPerRow, id),
      [EventStreamMetadata.SortPos]: positionId,
      [EventStreamMetadata.NumberOfLoadedTiles]: (gameData || []).length,
      [EventStreamMetadata.GameSetTypeId]: sort.topicId,
      [EventStreamMetadata.SortSubId]: sort.subId,
      [EventStreamMetadata.Page]: PageContext.HomePage,
      [SessionInfoType.HomePageSessionInfo]: homePageSessionInfo,
      [EventStreamMetadata.PlayContext]: PageContext.HomePage,
      [EventStreamMetadata.LaunchData]: data.launchDataOverride,
    };
    const tileAnalyticsData = buildOmniRecommendationTileAnalyticsData(
      data.universeId,
      omniAnalyticsData,
    );
    return mergeEventParamsWithAnalyticsData(eventParams, tileAnalyticsData);
  };

  const buildGameImpressionsProperties: TBuildCarouselGameImpressionsEventProperties = useCallback(
    (viewedIndexes: number[]) => {
      if (gameData !== undefined && startingRow !== undefined) {
        const filteredViewedIndexes = viewedIndexes.filter(id => id < gameData?.length);
        const viewedUniverseIds = filteredViewedIndexes.map(id => gameData[id]!.universeId);

        const eventParams: TCarouselGameImpressions = {
          [EventStreamMetadata.RootPlaceIds]: filteredViewedIndexes.map(
            id => gameData[id]!.placeId,
          ),
          [EventStreamMetadata.UniverseIds]: viewedUniverseIds,
          ...getThumbnailAssetIdImpressionsData(
            gameData,
            sort.topicId,
            filteredViewedIndexes,
            componentType,
          ),
          ...getTileBadgeContextsImpressionsData(gameData, sort.topicId, filteredViewedIndexes),
          ...getTileFooterImpressionsData(
            gameData,
            sort.topicId,
            filteredViewedIndexes,
            componentType,
          ),
          ...getSponsoredAdImpressionsData(gameData, filteredViewedIndexes),
          ...getAbsoluteRowImpressionsData(
            startingRow,
            gameData?.length,
            gameData?.length,
            filteredViewedIndexes,
          ),
          [EventStreamMetadata.NavigationUids]: filteredViewedIndexes.map(
            id => gameData[id]!.navigationUid ?? "0",
          ),
          [EventStreamMetadata.AbsPositions]: filteredViewedIndexes,
          [EventStreamMetadata.PositionsInTopic]: filteredViewedIndexes.map(
            id => (topicPositionOffset ?? 0) + id,
          ),
          [EventStreamMetadata.SortPos]: positionId,
          [EventStreamMetadata.GameSetTypeId]: sort.topicId,
          [EventStreamMetadata.SortSubId]: sort.subId,
          [EventStreamMetadata.Page]: PageContext.HomePage,
          [SessionInfoType.HomePageSessionInfo]: homePageSessionInfo,
        };
        const impressionAnalyticsData = buildOmniRecommendationGameImpressionsAnalyticsData(
          viewedUniverseIds,
          omniAnalyticsData,
        );
        return mergeEventParamsWithAnalyticsData(eventParams, impressionAnalyticsData);
      }

      return undefined;
    },
    [
      gameData,
      homePageSessionInfo,
      positionId,
      sort.topicId,
      sort.subId,
      componentType,
      startingRow,
      topicPositionOffset,
      omniAnalyticsData,
    ],
  );

  useGameImpressionsIntersectionTracker(
    carouselRef,
    gameData.length,
    buildGameImpressionsProperties,
  );

  useEffect(() => {
    if (isDynamicLayoutSizingEnabled) {
      if (itemsPerRow && carouselRef?.current) {
        carouselRef.current.style.setProperty("--items-per-row", itemsPerRow.toString());
      }
    }
  }, [isDynamicLayoutSizingEnabled, itemsPerRow]);

  const seeAllLink: string = useMemo(() => {
    if (seeAllLinkPath) {
      return getAbsoluteUrl(seeAllLinkPath);
    }

    return buildSortDetailUrl(sort.topic, PageContext.HomePage, {
      position: positionId,
      sortId: sort.topicId,
      page: PageContext.HomePage,
      treatmentType: sort.treatmentType,
      homePageSessionInfo,
    });
  }, [
    homePageSessionInfo,
    positionId,
    sort.topic,
    sort.topicId,
    sort.treatmentType,
    seeAllLinkPath,
  ]);

  const subtitleLink: string = useMemo(() => {
    if (subtitleLinkPath) {
      return subtitleLinkPath;
    }

    return seeAllLink;
  }, [subtitleLinkPath, seeAllLink]);

  const ampUpsellCompletionCallback = useCallback(() => {
    refreshFeed?.(TRequestIntent.AmpUpsellFeatureGranted);
  }, [refreshFeed]);

  const ampUpsellCallback = useAmpUpsellAction({
    featureName: sort.topicLayoutData?.ampUpsellFeatureName,
    namespace: sort.topicLayoutData?.ampUpsellNamespace,
    completionCallback: ampUpsellCompletionCallback,
    analyticsConfig: AMP_UPSELL_ANALYTICS_CONFIG,
    entryPointEventCtx: AMP_UPSELL_EVENT_CONTEXT,
  });

  const buildNavigateToSortLinkEventProperties: TBuildNavigateToSortLinkEventProperties =
    useCallback(() => {
      if (seeAllLinkPath) {
        return {
          [EventStreamMetadata.LinkPath]: seeAllLinkPath,
          [EventStreamMetadata.SortPos]: positionId,
          [EventStreamMetadata.GameSetTypeId]: sort.topicId,
          [EventStreamMetadata.Page]: PageContext.HomePage,
          [SessionInfoType.HomePageSessionInfo]: homePageSessionInfo,
        };
      }
      return undefined;
    }, [homePageSessionInfo, positionId, seeAllLinkPath, sort.topicId]);

  return (
    <SortBackgroundMuralWrapper
      backgroundImageAssetId={
        sort.topicLayoutData?.backgroundImageAssetId
          ? parseInt(sort.topicLayoutData?.backgroundImageAssetId, 10)
          : undefined
      }
    >
      <GameCarouselContainerHeader
        sortTitle={sort.topic}
        sortSubtitle={sort.subtitle}
        seeAllLink={seeAllLink}
        subtitleLink={subtitleLink}
        shouldShowSeparateSubtitleLink={!!subtitleLinkPath}
        isSortLinkOverrideEnabled={!!seeAllLinkPath}
        buildNavigateToSortLinkEventProperties={buildNavigateToSortLinkEventProperties}
        subtitleAction={ampUpsellCallback}
        shouldShowSponsoredTooltip={sort.topicId === homePage.adSortHomePageId}
        tooltipInfoText={tooltipInfoText}
        titleContainerClassName="container-header"
        hideSeeAll={hideSeeAll}
        endTimestamp={endTimestamp}
        countdownString={countdownString}
        backgroundImageAssetId={
          sort.topicLayoutData?.backgroundImageAssetId
            ? parseInt(sort.topicLayoutData?.backgroundImageAssetId, 10)
            : undefined
        }
        isNewSortHeaderEnabled={isNewSortHeaderEnabled}
        permitLinkClickPropagation // Let clicks bubble to the click interceptor in routing/helpers.tsx for client-side page transitions
        translate={translate}
      />

      {isCarouselHorizontalScrollEnabled ? (
        <GameCarouselHorizontalScroll
          gameData={gameData}
          sort={sort}
          positionId={positionId}
          page={PageContext.HomePage}
          gamesContainerRef={carouselRef}
          buildEventProperties={buildEventProperties}
          loadMoreGames={undefined}
          isLoadingMoreGames={false}
          componentType={componentType}
          sortId={sort.topicId}
          playerCountStyle={playerCountStyle}
          playButtonStyle={playButtonStyle}
          itemsPerRow={itemsPerRow}
          friendData={friendsPresence}
          navigationRootPlaceId={navigationRootPlaceId}
          isSponsoredFooterAllowed={isSponsoredFooterAllowed}
          hideTileMetadata={hideTileMetadata}
          hoverStyle={hoverStyle}
          topicId={sort.topicId?.toString()}
          isDynamicLayoutSizingEnabled={isDynamicLayoutSizingEnabled}
          isCarouselHorizontalScrollEnabled={isCarouselHorizontalScrollEnabled}
          isNewScrollArrowsEnabled={isNewScrollArrowsEnabled}
          translate={translate}
        />
      ) : (
        <GameCarousel
          // Type cast will be cleaned up with isCarouselHorizontalScrollEnabled
          ref={carouselRef as React.RefObject<HTMLDivElement>}
          tileRef={tileRef}
          gameData={gameData}
          friendData={friendsPresence}
          buildEventProperties={buildEventProperties}
          translate={translate}
          componentType={componentType}
          playerCountStyle={playerCountStyle}
          playButtonStyle={playButtonStyle}
          navigationRootPlaceId={navigationRootPlaceId}
          isSponsoredFooterAllowed={isSponsoredFooterAllowed}
          hideTileMetadata={hideTileMetadata}
          hoverStyle={hoverStyle}
          topicId={sort.topicId?.toString()}
          isDynamicLayoutSizingEnabled={isDynamicLayoutSizingEnabled}
        />
      )}
    </SortBackgroundMuralWrapper>
  );
};

HomePageCarousel.defaultProps = {
  componentType: undefined,
  playerCountStyle: undefined,
  playButtonStyle: undefined,
  hoverStyle: undefined,
  tooltipInfoText: undefined,
  hideSeeAll: undefined,
  navigationRootPlaceId: undefined,
  isSponsoredFooterAllowed: undefined,
  seeAllLinkPath: undefined,
  subtitleLinkPath: undefined,
  itemsPerRow: undefined,
  endTimestamp: undefined,
  countdownString: undefined,
  hideTileMetadata: undefined,
  isDynamicLayoutSizingEnabled: undefined,
  isCarouselHorizontalScrollEnabled: undefined,
  isNewScrollArrowsEnabled: undefined,
  isNewSortHeaderEnabled: undefined,
};

export default HomePageCarousel;
