import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  TranslateFunction,
  withTranslations,
  WithTranslationsProps,
} from "@rbx/core-scripts/react";
import { useLocation, useHistory, RouteComponentProps } from "react-router-dom";
import { Loading } from "@rbx/core-ui";
import gameCarouselTranslationConfig from "../../gameCarousel/translation.config";
import eventStreamConstants, {
  EventStreamMetadata,
  SessionInfoType,
} from "../../common/constants/eventStreamConstants";
import usePageReferralTracker from "../../common/hooks/usePageReferralTracker";
import GamesSeeAllGrid from "./GamesSeeAllGrid";
import { usePageSession, withPageSession } from "../../common/utils/PageSessionContext";
import { TExploreApiSort } from "../../common/types/bedev2Types";
import useFilterUrlParams from "../../omniFeed/hooks/useFilterUrlParams";
import getDeviceFeatures from "../../common/utils/deviceFeaturesUtils";
import bedev2Services from "../../common/services/bedev2Services";
import {
  isGameSortFromExploreApi,
  isSongSortFromExploreApi,
  joinExploreApiSorts,
  mapExploreApiSortResponse,
} from "../../omniFeed/utils/gameSortUtils";
import ErrorContainer from "../../common/components/ErrorContainer";
import { CommonGameSorts } from "../../common/constants/translationConstants";
import SongsSeeAllGrid from "./SongsSeeAllGrid";
import { PageContext } from "../../common/types/pageContext";
import useExperimentValues from "../../common/hooks/useExperimentValues";
import experimentConstants from "../../common/constants/experimentConstants";

type TSortDetailExploreApiProps = {
  translate: TranslateFunction;
} & RouteComponentProps<{ sortName: string }>;

export const SortDetailExploreApi = ({
  match,
  translate,
}: TSortDetailExploreApiProps): JSX.Element => {
  const location = useLocation();
  const history = useHistory();
  const sortName = decodeURIComponent(match.params.sortName);

  const [sort, setSort] = useState<TExploreApiSort | undefined>(undefined);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const discoverPageSessionInfo = usePageSession();

  const { filters, getInitialUrlParamFilters } = useFilterUrlParams();

  const deviceFeatures = useMemo(() => {
    return getDeviceFeatures();
  }, []);

  const { ixpData } = useExperimentValues(
    experimentConstants.layerNames.discoverPage,
    experimentConstants.defaultValues.discoverPage,
  );
  const isMusicChartsCarouselEnabled = ixpData.IsMusicChartsCarouselEnabled;

  const fetchData = useCallback(
    (filterParams: Map<string, string>, pageToken?: string) => {
      setError(false);
      setIsFetching(true);
      bedev2Services
        .getExploreSortContents(
          discoverPageSessionInfo,
          sortName,
          pageToken,
          filterParams,
          deviceFeatures,
        )
        .then(data => mapExploreApiSortResponse(data))
        .then(newSort => {
          setSort(prevSort => {
            if (prevSort && pageToken) {
              return joinExploreApiSorts(newSort, prevSort);
            }
            return newSort;
          });
        })
        .catch(() => {
          setError(true);
        })
        .finally(() => {
          setIsFetching(false);
        });
    },
    [sortName, discoverPageSessionInfo, deviceFeatures],
  );

  const checkLoadMoreData = useCallback(() => {
    if (sort?.nextPageToken && !isFetching) {
      fetchData(filters, sort?.nextPageToken);
    }
  }, [fetchData, isFetching, sort?.nextPageToken, filters]);

  useEffect(() => {
    fetchData(getInitialUrlParamFilters());
  }, [fetchData, getInitialUrlParamFilters]);

  usePageReferralTracker(
    eventStreamConstants.sortDetailReferral,
    [
      EventStreamMetadata.Position,
      EventStreamMetadata.GameSetTargetId,
      EventStreamMetadata.GameSetTypeId,
      EventStreamMetadata.Page,
      EventStreamMetadata.TreatmentType,
      SessionInfoType.DiscoverPageSessionInfo,
    ],
    [
      // Do not cleanse the 'device' or 'country' filter query params from the URL
      "device",
      "country",
    ],
    {},
    location,
    history,
  );

  const errorPage = (
    <div className="game-sort-detail-container">
      <div className="game-sort-detail">
        <ErrorContainer
          errorSubtext={translate(CommonGameSorts.LabelContentLoadFailed)}
          onRefresh={() => fetchData(filters)}
        />
      </div>
    </div>
  );

  if (error) {
    return errorPage;
  }

  if (!sort) {
    return <Loading />;
  }

  // MUS-2078 TODO: Remove `isMusicChartsCarouselEnabled` once the Music
  // surfaces are ready for launch
  if (isMusicChartsCarouselEnabled && isSongSortFromExploreApi(sort)) {
    return (
      <SongsSeeAllGrid
        currentPage={PageContext.SongListPage}
        sort={sort}
        isFetching={isFetching}
        loadMoreData={checkLoadMoreData}
      />
    );
  }

  if (isGameSortFromExploreApi(sort)) {
    return (
      <GamesSeeAllGrid
        sort={sort}
        isFetching={isFetching}
        loadMoreData={checkLoadMoreData}
        translate={translate}
      />
    );
  }

  return errorPage;
};

export default withPageSession(
  withTranslations(SortDetailExploreApi, gameCarouselTranslationConfig) as unknown as React.FC<
    WithTranslationsProps & TSortDetailExploreApiProps
  >,
);
