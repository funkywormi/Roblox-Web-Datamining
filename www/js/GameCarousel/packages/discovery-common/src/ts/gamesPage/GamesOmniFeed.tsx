import React, { useEffect, useCallback, useState, useRef, useMemo, useLayoutEffect } from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { Loading } from "@rbx/core-ui";
import bedev2Services from "../common/services/bedev2Services";
import { CommonGameSorts, CommonUIFeatures } from "../common/constants/translationConstants";
import ErrorContainer from "../common/components/ErrorContainer";
import OmniFeedItem from "../omniFeed/OmniFeedItem";
import {
  TExploreApiGameSort,
  TExploreApiSort,
  TExploreApiSorts,
} from "../common/types/bedev2Types";
import {
  extractFiltersFromExploreSorts,
  getAllHeaderSorts,
  isGameSortFromExploreApi,
  mapExploreApiGameSortResponse,
  mapExploreApiSortsResponse,
} from "../omniFeed/utils/gameSortUtils";
import SentinelTile from "../common/components/SentinelTile";
import { PageContext } from "../common/types/pageContext";
import { useVerticalScrollTracker } from "../common/components/useVerticalScrollTracker";
import { usePageSession, withPageSession } from "../common/utils/PageSessionContext";
import { getNumTilesPerRow } from "../common/components/GameTileUtils";
import { isWideTileComponentType } from "../common/utils/parsingUtils";
import configConstants from "../common/constants/configConstants";
import getDeviceFeatures from "../common/utils/deviceFeaturesUtils";
import useFilterUrlParams from "../omniFeed/hooks/useFilterUrlParams";
import useFriendsPresence from "../common/hooks/useFriendsPresence";
import useExperimentValues from "../common/hooks/useExperimentValues";
import experimentConstants from "../common/constants/experimentConstants";

const { carouselContainerBufferWidth } = configConstants.gamesPage;

type TGamesOmniFeedProps = {
  translate: TranslateFunction;
};

const GamesOmniFeed = ({ translate }: TGamesOmniFeedProps): JSX.Element => {
  const [error, setError] = useState<boolean>(false);

  const [sortsData, setSortsData] = useState<TExploreApiSorts | undefined>(undefined);

  const lastPageTokenRef = useRef<string | undefined>(undefined);

  const [isFetching, setIsFetching] = useState<boolean>(false);

  const [isLoadingMoreBySort, setIsLoadingMoreBySort] = useState<Map<string, boolean>>(new Map());

  const { ixpData } = useExperimentValues(
    experimentConstants.layerNames.discoverPage,
    experimentConstants.defaultValues.discoverPage,
  );
  const isMusicChartsCarouselEnabled = ixpData.IsMusicChartsCarouselEnabled;
  const isNewScrollArrowsAndHeaderEnabled = ixpData.IsNewScrollArrowsAndHeaderEnabled;

  const discoverPageSessionInfo = usePageSession();

  const friendsPresenceData = useFriendsPresence();

  const [itemsPerRowMap, setItemsPerRowMap] = useState<Map<number, number>>(new Map());

  const { filters, setFilters, getInitialUrlParamFilters } = useFilterUrlParams();

  const deviceFeatures = useMemo(() => {
    return getDeviceFeatures();
  }, []);

  const fetchGamesPageData = useCallback(
    (filterParams: Map<string, string>, sortsPageToken?: string) => {
      setError(false);
      setIsFetching(true);

      // If this is a refresh, clear the existing page data
      if (!sortsPageToken) {
        setSortsData(undefined);
      }

      lastPageTokenRef.current = sortsPageToken;

      bedev2Services
        .getExploreSorts(discoverPageSessionInfo, sortsPageToken, filterParams, deviceFeatures)
        .then(data => mapExploreApiSortsResponse(data))
        .then(newSortsData => {
          if (!sortsPageToken) {
            setSortsData(newSortsData);

            const newFilters = extractFiltersFromExploreSorts([
              ...(newSortsData.header?.sorts ?? []),
              ...newSortsData.sorts,
            ]);
            if (newFilters) {
              setFilters(newFilters);
            }
          } else {
            setSortsData(prevSortsData => {
              const allHeaderSorts = getAllHeaderSorts(prevSortsData, newSortsData);

              const allSorts = [...(prevSortsData?.sorts ?? []), ...newSortsData.sorts];

              const newFilters = extractFiltersFromExploreSorts([...allHeaderSorts, ...allSorts]);
              if (newFilters) {
                setFilters(newFilters);
              }

              return {
                header:
                  allHeaderSorts.length > 0
                    ? {
                        sorts: allHeaderSorts,
                        layoutData:
                          newSortsData?.header?.layoutData ?? prevSortsData?.header?.layoutData,
                      }
                    : prevSortsData?.header,
                sorts: allSorts,
                nextSortsPageToken: newSortsData.nextSortsPageToken,
              };
            });
          }
        })
        .catch(() => {
          setError(true);
        })
        .finally(() => {
          setIsFetching(false);
        });
    },
    [discoverPageSessionInfo, deviceFeatures, setFilters],
  );

  const checkLoadMoreSorts = useCallback(() => {
    if (
      sortsData?.nextSortsPageToken &&
      sortsData.nextSortsPageToken !== lastPageTokenRef.current &&
      !isFetching
    ) {
      fetchGamesPageData(filters, sortsData?.nextSortsPageToken);
    }
  }, [fetchGamesPageData, isFetching, sortsData?.nextSortsPageToken, filters]);

  // Make initial Explore API fetch with the initial filters from the URL, if present
  useEffect(() => {
    fetchGamesPageData(getInitialUrlParamFilters());
  }, [fetchGamesPageData, getInitialUrlParamFilters]);

  const updateIsLoadingMoreForSort = (sortId: string, isLoadingMore: boolean) => {
    setIsLoadingMoreBySort(prevIsLoadingMore => {
      const updatedLoadingMore = new Map(prevIsLoadingMore);
      updatedLoadingMore.set(sortId, isLoadingMore);

      return updatedLoadingMore;
    });
  };

  const appendDataForGameSort = (sortIndex: number, updatedSort: TExploreApiGameSort) => {
    setSortsData(prevSortsData => {
      if (prevSortsData) {
        const updatedSorts = prevSortsData.sorts;

        const sort = updatedSorts[sortIndex];
        if (sort && isGameSortFromExploreApi(sort)) {
          updatedSorts[sortIndex] = {
            ...sort,
            games: [...sort.games, ...updatedSort.games],
            nextPageToken: updatedSort.nextPageToken,
          };
        }

        return {
          ...prevSortsData,
          sorts: updatedSorts,
        };
      }
      return prevSortsData;
    });
  };

  const loadMoreGamesForSort = useCallback(
    (sortId: string) => {
      const sortIndex = sortsData?.sorts?.findIndex(sort => sort.sortId === sortId);

      if (sortIndex !== undefined && sortsData?.sorts[sortIndex]) {
        const currentSort = sortsData?.sorts[sortIndex];
        if (currentSort.nextPageToken && !isLoadingMoreBySort.get(sortId)) {
          updateIsLoadingMoreForSort(sortId, true);

          bedev2Services
            .getExploreSortContents(
              discoverPageSessionInfo,
              sortId,
              currentSort.nextPageToken,
              filters,
              deviceFeatures,
            )
            .then(data => mapExploreApiGameSortResponse(data))
            .then(updatedSort => appendDataForGameSort(sortIndex, updatedSort))
            .catch(() => {
              // Non-blocking, we can continue to show the existing games
            })
            .finally(() => {
              updateIsLoadingMoreForSort(sortId, false);
            });
        }
      }
    },
    [sortsData, isLoadingMoreBySort, discoverPageSessionInfo, deviceFeatures, filters],
  );

  useVerticalScrollTracker(PageContext.GamesPage);

  const gamesFeedRef = useRef<HTMLDivElement>(null);

  const getItemsPerRow = (sort: TExploreApiSort, gamesFeedWidth: number) => {
    const componentType = sort.topicLayoutData?.componentType;

    return getNumTilesPerRow(gamesFeedWidth, carouselContainerBufferWidth, componentType);
  };

  const updateItemsPerRow = useCallback(
    (gamesFeedWidth: number) => {
      const allItemsPerRow = new Map<number, number>();

      sortsData?.sorts.forEach((sort, positionId) => {
        if (
          isGameSortFromExploreApi(sort) &&
          isWideTileComponentType(sort.topicLayoutData?.componentType)
        ) {
          allItemsPerRow.set(positionId, getItemsPerRow(sort, gamesFeedWidth));
        }
      });

      setItemsPerRowMap(allItemsPerRow);
    },
    [sortsData?.sorts],
  );

  useLayoutEffect(() => {
    const handleResize = () => {
      const gamesFeedWidth = gamesFeedRef?.current?.getBoundingClientRect()?.width;

      if (gamesFeedWidth) {
        document.documentElement.style.setProperty("--games-feed-width", `${gamesFeedWidth}px`);

        updateItemsPerRow(gamesFeedWidth);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [updateItemsPerRow]);

  const headerSortCount = sortsData?.header?.sorts?.length ?? 0;

  return (
    <div ref={gamesFeedRef} className="games-page-container">
      <div className="section">
        <div className="games-list-header">
          <h1>{translate(CommonUIFeatures.LabelCharts)}</h1>
        </div>
        {error && !sortsData && (
          <ErrorContainer
            errorSubtext={translate(CommonGameSorts.LabelApiError)}
            onRefresh={() => fetchGamesPageData(getInitialUrlParamFilters())}
          />
        )}
        {headerSortCount > 0 && (
          <div className="sticky-header-sorts">
            {sortsData?.header?.sorts.map((sort, positionId) => (
              <OmniFeedItem
                key={`${sort.sortId}-${sort.topicId}-${sort.gameSetTargetId}`}
                translate={translate}
                sort={sort}
                positionId={positionId}
                currentPage={PageContext.GamesPage}
                itemsPerRow={undefined}
                startingRow={undefined}
                gridRecommendations={[]}
                friendsPresenceData={friendsPresenceData}
                isMusicChartsCarouselEnabled={isMusicChartsCarouselEnabled}
                fetchGamesPageData={fetchGamesPageData}
                isNewScrollArrowsEnabled={isNewScrollArrowsAndHeaderEnabled}
                isNewSortHeaderEnabled={isNewScrollArrowsAndHeaderEnabled}
              />
            ))}
          </div>
        )}
        <div className={headerSortCount > 0 ? "body-sorts" : ""}>
          {sortsData?.sorts.map((sort, positionId) => (
            <OmniFeedItem
              key={`${sort.sortId}-${sort.topicId}-${sort.gameSetTargetId}`}
              translate={translate}
              sort={sort}
              positionId={positionId + headerSortCount}
              currentPage={PageContext.GamesPage}
              itemsPerRow={itemsPerRowMap.get(positionId)}
              startingRow={undefined}
              gridRecommendations={[]}
              friendsPresenceData={friendsPresenceData}
              loadMoreGames={() => loadMoreGamesForSort(sort.sortId)}
              isLoadingMoreGames={isLoadingMoreBySort.get(sort.sortId) === true}
              isMusicChartsCarouselEnabled={isMusicChartsCarouselEnabled}
              fetchGamesPageData={fetchGamesPageData}
              isNewScrollArrowsEnabled={isNewScrollArrowsAndHeaderEnabled}
              isNewSortHeaderEnabled={isNewScrollArrowsAndHeaderEnabled}
            />
          ))}
        </div>
        {!error && <SentinelTile loadData={checkLoadMoreSorts} />}
        {isFetching && <Loading />}
      </div>
    </div>
  );
};

export default withPageSession(GamesOmniFeed);
