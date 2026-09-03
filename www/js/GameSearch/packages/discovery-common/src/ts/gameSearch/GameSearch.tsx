import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import classNames from "classnames";
import { WithTranslationsProps } from "@rbx/core-scripts/react";
import { Button, Loading } from "@rbx/core-ui";
import { TGameData, TMetaData, TPaginationMethod } from "../common/types/bedev1Types";
import bedev2Services from "../common/services/bedev2Services";
import { gameSearchPage } from "../common/constants/configConstants";
import { PageContext } from "../common/types/pageContext";
import { EventStreamMetadata, SessionInfoType } from "../common/constants/eventStreamConstants";
import {
  FeatureGamePage,
  CommonGameSorts,
  SearchGlobalSearch,
} from "../common/constants/translationConstants";
import { TBuildEventProperties } from "../common/components/GameTileUtils";
import useGameSearchGridResize from "./hooks/useGameSearchGridResize";
import { GameGrid } from "../common/components/GameGrid";
import ErrorContainer from "../common/components/ErrorContainer";
import searchHelper from "./utils/searchHelper";
import {
  TComponentType,
  TGameSearchSortData,
  TOmniSearchPageType,
  TOmniSearchTextDataModel,
  TPlayerCountStyle,
} from "../common/types/bedev2Types";
import useGameImpressionsIntersectionTracker, {
  TBuildGridGameImpressionsEventProperties,
} from "../common/hooks/useGameImpressionsIntersectionTracker";
import {
  getSponsoredAdImpressionsData,
  getThumbnailAssetIdImpressionsData,
  getTileBadgeContextsImpressionsData,
  getTileFooterImpressionsData,
  isWideTileComponentType,
} from "../common/utils/parsingUtils";
import { useVerticalScrollTracker } from "../common/components/useVerticalScrollTracker";
import { usePageSession, withPageSession } from "../common/utils/PageSessionContext";
import SearchTextContent from "../common/components/SearchTextContent";
import {
  getSearchResultsGamesList,
  getGameSearchComponentType,
  getGameSearchTopicId,
} from "./utils/gameSearchSortUtils";

const HOTLINE_SEARCH_TEXT_TOPIC_ID = "HotlineSearchText";

function GameSearch({ translate }: WithTranslationsProps): JSX.Element {
  const gridRef = useRef<HTMLDivElement>(null);
  const tileRef = useRef<HTMLDivElement>(null);
  const keyword = searchHelper.getKeyword() as string;
  const gameSearchSessionInfo = usePageSession();
  const [gameData, setGameData] = useState<TGameData[] | undefined>(undefined);
  const [textData, setTextData] = useState<TOmniSearchTextDataModel[] | undefined>(undefined);
  const [metaData, setMetaData] = useState<TMetaData | undefined>(undefined);
  const [sortsData, setSortsData] = useState<TGameSearchSortData[] | undefined>(undefined);
  const [gameTopicIds, setGameTopicIds] = useState<Set<string> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string>("");

  const topicId = useMemo(() => {
    return getGameSearchTopicId(gameTopicIds);
  }, [gameTopicIds]);

  const componentType: TComponentType | undefined = useMemo(() => {
    return getGameSearchComponentType(topicId, sortsData);
  }, [topicId, sortsData]);

  const { searchFeedRef } = useGameSearchGridResize(gridRef, componentType);

  const buildGameImpressionsProperties: TBuildGridGameImpressionsEventProperties = useCallback(
    (viewedIndex: number[]) => {
      if (gameData !== undefined && metaData !== undefined) {
        const parsedViewedIndex = viewedIndex.filter(id => id < gameData?.length);

        const analyticsTopicId = topicId ?? gameSearchPage.unknownTopicId;

        return {
          rootPlaceIds: parsedViewedIndex.map(id => gameData[id]!.placeId),
          universeIds: parsedViewedIndex.map(id => gameData[id]!.universeId),
          absPositions: parsedViewedIndex,
          ...getThumbnailAssetIdImpressionsData(
            gameData,
            analyticsTopicId,
            parsedViewedIndex,
            componentType,
          ),
          ...getTileBadgeContextsImpressionsData(gameData, analyticsTopicId, parsedViewedIndex),
          ...getTileFooterImpressionsData(
            gameData,
            analyticsTopicId,
            parsedViewedIndex,
            componentType,
          ),
          ...getSponsoredAdImpressionsData(gameData, parsedViewedIndex),
          gameSetTypeId: analyticsTopicId,
          componentType,
          suggestionKwd: keyword,
          suggestionReplacedKwd: metaData?.filteredKeyword || "",
          suggestionCorrectedKwd: metaData?.correctedKeyword || "",
          suggestionAlgorithm: metaData?.suggestionAlgorithm || "",
          algorithm: metaData?.algorithmQueryType || "",
          gameSearchSessionInfo,
          emphasisFlag: metaData?.emphasis || false,
          page: PageContext.SearchPage,
        };
      }

      return undefined;
    },
    [gameData, metaData, gameSearchSessionInfo, keyword, componentType, topicId],
  );

  useGameImpressionsIntersectionTracker(
    gridRef,
    gameData?.length ?? 0,
    buildGameImpressionsProperties,
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const data = await bedev2Services.getOmniSearch(
        keyword,
        nextPageToken,
        gameSearchSessionInfo,
        TOmniSearchPageType.All,
      );

      const gamesList = getSearchResultsGamesList(data.gamesList);

      // Cache the emphasis flag since
      // only the first set of results generates an emphasis
      // (Previously, it would be sent down in every call)
      let hasEmphasis = metaData?.emphasis === true;

      // First set of results
      if (nextPageToken.length === 0) {
        hasEmphasis = data.gamesList.length > 0 && data.gamesList[0]!.emphasis === true;
      }

      const currMetaData: TMetaData = {
        emphasis: hasEmphasis,
        paginationMethod: data.paginationMethod as TPaginationMethod,
        hasMoreRows: data.nextPageToken.length > 0,
        algorithm: "",
        algorithmQueryType: "",
        suggestionAlgorithm: "",
      };

      setNextPageToken(data.nextPageToken);
      setGameData([...(gameData || []), ...gamesList]);
      setTextData(data.textList);
      setMetaData(currMetaData);
      setGameTopicIds(data.gameTopicIds);
      setSortsData(data.sorts);

      window.EventTracker?.fireEvent(gameSearchPage.omniSearchEndpointSuccessEvent);
    } catch (err) {
      setError(true);

      window.EventTracker?.fireEvent(gameSearchPage.omniSearchEndpointErrorEvent);
    }

    setLoading(false);
  }, [
    keyword,
    gameData,
    metaData,
    nextPageToken,
    gameSearchSessionInfo,
    setMetaData,
    setNextPageToken,
  ]);

  const checkLoadMoreData = useCallback(async () => {
    if (!metaData || metaData?.hasMoreRows) {
      await loadData();
    }
  }, [metaData, loadData]);

  const buildEventProperties: TBuildEventProperties = (data, id) => ({
    [EventStreamMetadata.PlaceId]: data.placeIdOverride ?? data.placeId,
    [EventStreamMetadata.PlaceIdOverride]: data.placeIdOverride,
    [EventStreamMetadata.UniverseId]: data.universeId,
    [EventStreamMetadata.IsAd]: data.isSponsored,
    [EventStreamMetadata.NativeAdData]: data.nativeAdData,
    [EventStreamMetadata.Position]: id,
    [EventStreamMetadata.NumberOfLoadedTiles]: (gameData || []).length,
    [SessionInfoType.GameSearchSessionInfo]: gameSearchSessionInfo,
    [EventStreamMetadata.Page]: PageContext.SearchPage,
    [EventStreamMetadata.LaunchData]: data.launchDataOverride,
  });

  useEffect(() => {
    // eslint-disable-next-line no-void
    void loadData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useVerticalScrollTracker(PageContext.SearchPage);

  const loadDataOnScroll = useCallback(() => {
    if (metaData?.paginationMethod !== TPaginationMethod.Button) {
      // eslint-disable-next-line no-void
      void checkLoadMoreData();
    }
  }, [checkLoadMoreData, metaData?.paginationMethod]);

  const isWideTileSearchFeed = isWideTileComponentType(componentType);

  if (error) {
    return (
      <ErrorContainer
        errorSubtext={translate(CommonGameSorts.LabelApiError)}
        onRefresh={loadData}
      />
    );
  }
  if (gameData === undefined || metaData === undefined) {
    return <Loading />;
  }

  // Currently text content is only used for displaying the search hotline message, and when it is present, games data
  // is actually not returned by the API.
  if (textData && textData.length === 1 && textData[0]?.topicId === HOTLINE_SEARCH_TEXT_TOPIC_ID) {
    return <SearchTextContent textData={textData[0]} />;
  }

  if (gameData.length === 0) {
    return (
      <div data-testid="game-search-no-results" className="font-bold">
        {translate(FeatureGamePage.LabelNoSearchResults)}
      </div>
    );
  }

  const showLoadMore =
    !loading && metaData.hasMoreRows && metaData.paginationMethod === TPaginationMethod.Button;

  return (
    <div
      className={classNames("game-search-feed-container", {
        "wide-tile-search-feed": isWideTileSearchFeed,
      })}
    >
      <div ref={searchFeedRef}>
        <GameGrid
          ref={gridRef}
          tileRef={tileRef}
          loadData={loadDataOnScroll}
          shouldUseSentinelTile
          gameData={gameData}
          emphasis={metaData.emphasis}
          translate={translate}
          buildEventProperties={buildEventProperties}
          componentType={componentType}
          playerCountStyle={TPlayerCountStyle.Footer}
          isSearchGameGrid
          isDynamicLayoutSizingEnabled={isWideTileSearchFeed}
          page={PageContext.SearchPage}
        />
        {loading && <Loading />}
        {showLoadMore && (
          <div className="load-more-btn-container">
            <Button variant="control" width="full" size="sm" onClick={checkLoadMoreData}>
              {translate(SearchGlobalSearch.ActionLoadMore)}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default withPageSession(GameSearch);
