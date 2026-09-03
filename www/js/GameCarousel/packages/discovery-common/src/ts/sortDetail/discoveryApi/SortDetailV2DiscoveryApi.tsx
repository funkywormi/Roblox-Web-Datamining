import React, { useCallback, useEffect, useMemo, useState } from "react";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { Redirect } from "react-router-dom";
import { Loading } from "@rbx/core-ui";
import SortDetailGridV2DiscoveryApi from "./SortDetailGridV2DiscoveryApi";
import bedev2Services, {
  TGetOmniRecommendationsResponse,
} from "../../common/services/bedev2Services";
import ErrorContainer from "../../common/components/ErrorContainer";
import { TPageType } from "../../common/types/bedev1Types";
import {
  TOmniRecommendationGameSort,
  TOmniRecommendationsContentMetadata,
  TContentType,
} from "../../common/types/bedev2Types";
import { CommonGameSorts } from "../../common/constants/translationConstants";
import gameCarouselTranslationConfig from "../../gameCarousel/translation.config";
import useVerticalScrollTracker from "../../common/components/useVerticalScrollTracker";
import { PageContext } from "../../common/types/pageContext";
import { usePageSession } from "../../common/utils/PageSessionContext";
import GamesInfoTooltip from "../../common/components/GamesInfoTooltip";
import { homePage } from "../../common/constants/configConstants";
import { isOmniRecommendationSduiSort } from "../../omniFeed/utils/gameSortUtils";
import getDeviceFeatures from "../../common/utils/deviceFeaturesUtils";

export const SortDetailV2DiscoveryApi = ({
  sortName,
  translate,
}: { sortName: string } & WithTranslationsProps): JSX.Element => {
  const [recommendations, setRecommendations] = useState<
    TGetOmniRecommendationsResponse | undefined
  >(undefined);

  const homePageSessionInfo = usePageSession();
  const [redirect, setRedirect] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  useVerticalScrollTracker(PageContext.SortDetailPageHome);

  const deviceFeatures = useMemo(() => {
    return getDeviceFeatures();
  }, []);

  const fetchRecommendations = useCallback(() => {
    setError(false);
    setRecommendations(undefined);

    bedev2Services
      .getOmniRecommendations(TPageType.Home, homePageSessionInfo, deviceFeatures)
      .then(omniRecommendations => {
        const selectedSort = omniRecommendations.sorts.find(
          // Do not consider SDUI sorts (which do not have the .topic field) for matching
          sortItem => !isOmniRecommendationSduiSort(sortItem) && sortItem.topic === sortName,
        );
        if (
          selectedSort === undefined ||
          homePage.topicIdsWithoutSeeAll.includes(selectedSort.topicId)
        ) {
          setRedirect(true);
        } else {
          setRecommendations({
            sorts: [selectedSort],
            contentMetadata: omniRecommendations.contentMetadata,
          });
        }
      })
      .catch(() => {
        setError(true);
      });
  }, [homePageSessionInfo, sortName]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Append additional game metadata used to hydrate the recommendations through pagination
  const appendContentMetadata = (additionalMetadata: TOmniRecommendationsContentMetadata) => {
    setRecommendations(prevRecommendations => {
      if (prevRecommendations) {
        return {
          ...prevRecommendations,
          contentMetadata: {
            [TContentType.Game]: {
              ...prevRecommendations.contentMetadata[TContentType.Game],
              ...additionalMetadata[TContentType.Game],
            },
            [TContentType.CatalogAsset]: {
              ...prevRecommendations.contentMetadata[TContentType.CatalogAsset],
              ...additionalMetadata[TContentType.CatalogAsset],
            },
            [TContentType.CatalogBundle]: {
              ...prevRecommendations.contentMetadata[TContentType.CatalogBundle],
              ...additionalMetadata[TContentType.CatalogBundle],
            },
          },
        };
      }
      return prevRecommendations;
    });
  };

  // Error in API calls
  if (error) {
    return (
      <div className="game-sort-detail-container">
        <h1>{translate(CommonGameSorts.LabelGames)}</h1>
        <div className="game-sort-detail">
          <ErrorContainer
            errorSubtext={translate(CommonGameSorts.LabelApiError)}
            onRefresh={fetchRecommendations}
          />
        </div>
      </div>
    );
  }

  // Redirect if recommendation cannot be found
  if (redirect) {
    return <Redirect to="/" />;
  }

  // Recommendations are loaded
  if (recommendations !== undefined && recommendations.sorts?.length > 0) {
    const sort = recommendations.sorts[0]!;
    return (
      <div className="game-sort-detail-container">
        <h1>
          {sortName}
          {sort.topicId === homePage.adSortHomePageId && (
            <GamesInfoTooltip
              tooltipText={
                translate(CommonGameSorts.LabelSponsoredAdsDisclosureStatic) ||
                "Sponsored experiences are paid for by Creators. They may be shown to you based on general information about your device type, location, and demographics."
              }
              placement="right"
              sizeInPx={22}
            />
          )}
        </h1>
        <SortDetailGridV2DiscoveryApi
          homePageSessionInfo={homePageSessionInfo}
          sort={sort as TOmniRecommendationGameSort}
          contentMetadata={recommendations.contentMetadata}
          appendContentMetadata={appendContentMetadata}
          translate={translate}
        />
      </div>
    );
  }

  return <Loading />;
};

export default withTranslations(SortDetailV2DiscoveryApi, gameCarouselTranslationConfig);
