import React, { useRef, useCallback, useEffect } from "react";
import { WithTranslationsProps } from "@rbx/core-scripts/react";
import {
  EventStreamMetadata,
  SessionInfoType,
  TGameDetailReferral,
  TGridGameImpressions,
} from "../../common/constants/eventStreamConstants";
import { PageContext } from "../../common/types/pageContext";
import { TGameData, TGetFriendsResponse } from "../../common/types/bedev1Types";
import {
  TComponentType,
  TGameSort,
  TPlayButtonStyle,
  TPlayerCountStyle,
  THoverStyle,
} from "../../common/types/bedev2Types";
import { TOmniRecommendationAnalyticsData } from "../../common/types/analyticsTypes";
import { GameGrid } from "../../common/components/GameGrid";
import { TBuildEventProperties } from "../../common/components/GameTileUtils";
import useGameImpressionsIntersectionTracker, {
  TBuildGridGameImpressionsEventProperties,
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
import GamesInfoTooltip from "../../common/components/GamesInfoTooltip";
import { CommonGameSorts } from "../../common/constants/translationConstants";
import { homePage } from "../../common/constants/configConstants";
import HomeSortHeader from "../../common/components/HomeSortHeader";

type THomePageGridDiscoveryApiProps = {
  gameData: TGameData[];
  sort: TGameSort;
  positionId: number;
  friendsPresence: TGetFriendsResponse[];
  componentType?: TComponentType;
  playerCountStyle?: TPlayerCountStyle;
  playButtonStyle?: TPlayButtonStyle;
  hoverStyle?: THoverStyle;
  itemsPerRow?: number;
  topicPositionOffset?: number;
  startingRow: number | undefined;
  isSponsoredFooterAllowed?: boolean;
  isSponsoredRatingFooterAllowed?: boolean;
  hideTileMetadata?: boolean;
  isDynamicLayoutSizingEnabled?: boolean;
  isNewSortHeaderEnabled?: boolean;
  enableExplicitFeedback?: boolean;
  hiddenUniverses?: Set<number>;
  setHiddenUniverses?: React.Dispatch<React.SetStateAction<Set<number>>>;
  translate: WithTranslationsProps["translate"];
  enableSponsoredFeedback?: boolean;
  sponsoredUserCohort?: string;
  enableReportAd?: boolean;
  sponsoredFooterAdLabelText?: string;
  sponsoredFooterAdLabelFirst?: boolean;
  sponsoredFooterIncludeRatingContent?: boolean;
  omniAnalyticsData: TOmniRecommendationAnalyticsData;
};

export const HomePageGrid = ({
  gameData,
  sort,
  positionId,
  friendsPresence,
  componentType,
  playerCountStyle,
  playButtonStyle,
  hoverStyle,
  itemsPerRow,
  topicPositionOffset,
  startingRow,
  isSponsoredFooterAllowed,
  isSponsoredRatingFooterAllowed,
  hideTileMetadata,
  isDynamicLayoutSizingEnabled,
  isNewSortHeaderEnabled,
  enableExplicitFeedback,
  hiddenUniverses,
  setHiddenUniverses,
  enableSponsoredFeedback,
  sponsoredUserCohort,
  enableReportAd,
  sponsoredFooterAdLabelText,
  sponsoredFooterAdLabelFirst,
  sponsoredFooterIncludeRatingContent,
  translate,
  omniAnalyticsData,
}: THomePageGridDiscoveryApiProps): JSX.Element => {
  const gridRef = useRef<HTMLDivElement>(null);
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

  const buildGameImpressionsProperties: TBuildGridGameImpressionsEventProperties = useCallback(
    (viewedIndex: number[]) => {
      if (gameData !== undefined && startingRow !== undefined) {
        const parsedViewedIndex = viewedIndex.filter(id => id < gameData?.length);
        const viewedUniverseIds = parsedViewedIndex.map(id => gameData[id]!.universeId);

        const eventParams: TGridGameImpressions = {
          [EventStreamMetadata.RootPlaceIds]: parsedViewedIndex.map(id => gameData[id]!.placeId),
          [EventStreamMetadata.UniverseIds]: viewedUniverseIds,
          ...getThumbnailAssetIdImpressionsData(
            gameData,
            sort.topicId,
            parsedViewedIndex,
            componentType,
          ),
          ...getTileBadgeContextsImpressionsData(gameData, sort.topicId, parsedViewedIndex),
          ...getTileFooterImpressionsData(gameData, sort.topicId, parsedViewedIndex, componentType),
          [EventStreamMetadata.NavigationUids]: parsedViewedIndex.map(
            id => gameData[id]!.navigationUid ?? "0",
          ),
          [EventStreamMetadata.AbsPositions]: parsedViewedIndex,
          [EventStreamMetadata.PositionsInTopic]: parsedViewedIndex.map(
            id => (topicPositionOffset ?? 0) + id,
          ),
          ...getSponsoredAdImpressionsData(gameData, parsedViewedIndex),
          ...getAbsoluteRowImpressionsData(
            startingRow,
            itemsPerRow,
            gameData?.length,
            parsedViewedIndex,
          ),
          [EventStreamMetadata.SortPos]: positionId,
          [EventStreamMetadata.NumberOfLoadedTiles]: gameData?.length,
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
      itemsPerRow,
      startingRow,
      topicPositionOffset,
      omniAnalyticsData,
    ],
  );

  useGameImpressionsIntersectionTracker(gridRef, gameData.length, buildGameImpressionsProperties);

  useEffect(() => {
    if (itemsPerRow && gridRef?.current) {
      gridRef.current.style.setProperty("--items-per-row", itemsPerRow.toString());
    }
  }, [itemsPerRow]);

  return (
    <div data-testid="home-page-game-grid">
      {isNewSortHeaderEnabled ? (
        <HomeSortHeader
          titleText={sort.topic}
          sendNavigateToSortLinkEvent={undefined}
          titleLink={undefined}
          isSortLinkOverrideEnabled={false}
          subtitleText={undefined}
          subtitleLink={undefined}
          shouldShowSeparateSubtitleLink={false}
          hasBackgroundMural={false}
          tooltipText={
            sort.topicId === homePage.adSortHomePageId
              ? translate(CommonGameSorts.LabelSponsoredAdsDisclosureStatic) ||
                "Sponsored experiences are paid for by Creators. They may be shown to you based on general information about your device type, location, and demographics."
              : undefined
          }
          hideSeeAll
        />
      ) : (
        <div className="container-header">
          <h2>
            {sort.topic}
            {sort.topicId === homePage.adSortHomePageId && (
              <GamesInfoTooltip
                tooltipText={
                  translate(CommonGameSorts.LabelSponsoredAdsDisclosureStatic) ||
                  "Sponsored experiences are paid for by Creators. They may be shown to you based on general information about your device type, location, and demographics."
                }
                placement="right"
              />
            )}
          </h2>
        </div>
      )}

      <GameGrid
        ref={gridRef}
        tileRef={tileRef}
        gameData={gameData}
        emphasis={false}
        translate={translate}
        buildEventProperties={buildEventProperties}
        isHomeGameGrid
        friendsPresence={friendsPresence}
        componentType={componentType}
        playerCountStyle={playerCountStyle}
        playButtonStyle={playButtonStyle}
        isSponsoredFooterAllowed={isSponsoredFooterAllowed}
        isSponsoredRatingFooterAllowed={isSponsoredRatingFooterAllowed}
        hideTileMetadata={hideTileMetadata}
        hoverStyle={hoverStyle}
        topicId={sort.topicId?.toString()}
        isDynamicLayoutSizingEnabled={isDynamicLayoutSizingEnabled}
        enableExplicitFeedback={enableExplicitFeedback}
        hiddenUniverses={hiddenUniverses}
        setHiddenUniverses={setHiddenUniverses}
        page={PageContext.HomePage}
        enableSponsoredFeedback={enableSponsoredFeedback}
        sponsoredUserCohort={sponsoredUserCohort}
        enableReportAd={enableReportAd}
        sponsoredFooterAdLabelText={sponsoredFooterAdLabelText}
        sponsoredFooterAdLabelFirst={sponsoredFooterAdLabelFirst}
        sponsoredFooterIncludeRatingContent={sponsoredFooterIncludeRatingContent}
      />
    </div>
  );
};

HomePageGrid.defaultProps = {
  componentType: undefined,
  playerCountStyle: undefined,
  playButtonStyle: undefined,
  hoverStyle: undefined,
  itemsPerRow: undefined,
  isSponsoredFooterAllowed: undefined,
  isSponsoredRatingFooterAllowed: undefined,
  hideTileMetadata: undefined,
  sponsoredFooterAdLabelText: undefined,
  sponsoredFooterAdLabelFirst: undefined,
  sponsoredFooterIncludeRatingContent: undefined,
  isDynamicLayoutSizingEnabled: undefined,
  isNewSortHeaderEnabled: undefined,
};

export default HomePageGrid;
