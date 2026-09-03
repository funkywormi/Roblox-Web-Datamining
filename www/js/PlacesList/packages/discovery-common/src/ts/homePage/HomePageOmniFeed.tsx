import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { useSystemFeedback } from "@rbx/core-ui";
import dataStores from "@rbx/core-scripts/data-store";
import { InlinePrompt } from "@rbx/prompts-orchestrator";
import bedev2Services, { TGetOmniRecommendationsResponse } from "../common/services/bedev2Services";
import ErrorContainer from "../common/components/ErrorContainer";
import OmniFeedItem from "../omniFeed/OmniFeedItem";
import { homePage } from "../common/constants/configConstants";
import { LoadingGameTile } from "../common/components/LoadingGameTile";
import { CommonGameSorts } from "../common/constants/translationConstants";
import { TPageType } from "../common/types/bedev1Types";
import {
  TContentType,
  TOmniRecommendationsContentMetadata,
  TRequestIntent,
  TSduiTreatmentType,
  TTreatmentType,
} from "../common/types/bedev2Types";
import { ContentMetadataContext } from "../omniFeed/utils/contentMetadataContextProvider";
import useApportionGridRecommendationsWithResize from "../omniFeed/hooks/useApportionGridRecommendationsWithResize";
import { PageContext } from "../common/types/pageContext";
import { useVerticalScrollTracker } from "../common/components/useVerticalScrollTracker";
import {
  usePageSession,
  useRotatePageSession,
  withPageSession,
} from "../common/utils/PageSessionContext";
import useFriendsPresence from "../common/hooks/useFriendsPresence";
import { logOmniFeedStats } from "../sdui/utils/logSduiError";
import personalizationTranslationConfig from "./translation.config";
import getDeviceFeatures from "../common/utils/deviceFeaturesUtils";
// @ts-expect-error TODO: old, migrated code
import HomePageUpsellCardContainerEntry from "../../js/homePageUpsellCard/App";
import InterestCatcher from "./interestCatcher/InterestCatcher";
import { isGameSortFromOmniRecommendations } from "../omniFeed/utils/gameSortUtils";
import FriendsCarousel from "./FriendsCarousel";

const { maxTilesPerCarouselPage } = homePage;

export const HomePageOmniFeed = ({ translate }: WithTranslationsProps): JSX.Element => {
  const homePageSessionInfo = usePageSession();
  const initialSessionRef = useRef(homePageSessionInfo);
  const rotateSessionId = useRotatePageSession();
  const friendsPresenceData = useFriendsPresence();
  const { SystemFeedbackComponent } = useSystemFeedback();

  const [recommendations, setRecommendations] = useState<
    TGetOmniRecommendationsResponse | undefined
  >(undefined);
  const [error, setError] = useState<boolean>(false);

  const [hiddenUniverses, setHiddenUniverses] = useState<Set<number>>(new Set());

  const deviceFeatures = useMemo(() => {
    return getDeviceFeatures();
  }, []);
  const authIntentFeatures = useMemo(() => {
    try {
      const {
        authIntentDataStore: { retrieveAuthIntentDataForUser },
      } = dataStores;
      return retrieveAuthIntentDataForUser();
    } catch (e) {
      console.error("Error retrieving auth intent data:", e);
      return undefined;
    }
  }, []);

  const fetchRecommendations = useCallback(
    (sessionId: string, interestedUniverses?: number[], requestIntent?: TRequestIntent) => {
      setRecommendations(undefined);
      setError(false);
      bedev2Services
        .getOmniRecommendations(
          TPageType.Home,
          sessionId,
          deviceFeatures,
          authIntentFeatures,
          interestedUniverses,
          [TSduiTreatmentType.Carousel, TSduiTreatmentType.HeroUnit],
          requestIntent,
        )
        .then(data => {
          setRecommendations(data);
          window.EventTracker?.fireEvent(homePage.omniRecommendationEndpointSuccessEvent);

          logOmniFeedStats(data, sessionId);
        })
        .catch(() => {
          setError(true);
          window.EventTracker?.fireEvent(homePage.omniRecommendationEndpointErrorEvent);
        });
    },
    [deviceFeatures, authIntentFeatures],
  );

  const refreshFeed = useCallback(
    (requestIntent?: TRequestIntent, interestedUniverses?: number[]) => {
      const sessionId = rotateSessionId();
      fetchRecommendations(sessionId, interestedUniverses, requestIntent);
    },
    [fetchRecommendations, rotateSessionId],
  );

  useEffect(() => {
    fetchRecommendations(initialSessionRef.current);
  }, [fetchRecommendations]);

  const isDynamicLayoutSizingEnabled = true;

  const isNewSortHeaderEnabled = true;
  const isCarouselHorizontalScrollEnabled = true;
  const isNewScrollArrowsEnabled = true;

  const appendContentMetadata = useCallback(
    (additionalMetadata: TOmniRecommendationsContentMetadata) => {
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
    },
    [],
  );

  const {
    homeFeedRef,
    gridRecommendationsMap,
    itemsPerRowMap,
    startingRowNumbersMap,
    topicPositionOffsetsMap,
  } = useApportionGridRecommendationsWithResize(
    recommendations,
    isDynamicLayoutSizingEnabled,
    isCarouselHorizontalScrollEnabled,
  );

  useVerticalScrollTracker(PageContext.HomePage);

  const shouldShowLocalFriendsCarousel = useMemo((): boolean => {
    // During migration, show local friends carousel if server does not send one
    if (recommendations?.sorts) {
      return recommendations.sorts.every(
        sort => sort.treatmentType !== TTreatmentType.FriendCarousel,
      );
    }
    return false;
  }, [recommendations?.sorts]);

  const interestCatcherSortIndex: number | undefined = useMemo(() => {
    return recommendations?.sorts.findIndex(
      sort => sort.treatmentType === TTreatmentType.InterestGrid,
    );
  }, [recommendations?.sorts]);

  if (error) {
    return (
      <div className="game-home-page-container" data-testid="HomePageContainerTestId">
        <h2>{translate(CommonGameSorts.LabelGames)}</h2>
        <ErrorContainer
          errorSubtext={translate(CommonGameSorts.LabelApiError)}
          onRefresh={() => refreshFeed()}
        />
      </div>
    );
  }

  if (recommendations === undefined) {
    return (
      <div className="game-home-page-container" data-testid="HomePageContainerTestId">
        <div className="game-home-page-loading-title shimmer" />
        <div className="game-home-page-loading-carousel">
          {Array.from({ length: maxTilesPerCarouselPage }, (_, id) => (
            <LoadingGameTile key={id} />
          ))}
        </div>
      </div>
    );
  }

  if (interestCatcherSortIndex !== undefined && interestCatcherSortIndex > -1) {
    const interestCatcherSort = recommendations.sorts[interestCatcherSortIndex];
    if (interestCatcherSort && isGameSortFromOmniRecommendations(interestCatcherSort)) {
      return (
        <div className="game-home-page-container" data-testid="HomePageContainerTestId">
          <div ref={homeFeedRef}>
            <ContentMetadataContext.Provider
              value={{
                contentMetadata: recommendations.contentMetadata,
                appendContentMetadata,
              }}
            >
              <InterestCatcher
                sort={interestCatcherSort}
                itemsPerRow={itemsPerRowMap.get(interestCatcherSortIndex)}
                refreshFeed={refreshFeed}
                translate={translate}
              />
            </ContentMetadataContext.Provider>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="game-home-page-container" data-testid="HomePageContainerTestId">
      <div ref={homeFeedRef}>
        <ContentMetadataContext.Provider
          value={{
            contentMetadata: recommendations.contentMetadata,
            appendContentMetadata,
          }}
        >
          <InlinePrompt entryPoint="HomepageLaunchWeb" promptStyle="InlineBanner" />
          <HomePageUpsellCardContainerEntry translate={translate} context={undefined} />
          {shouldShowLocalFriendsCarousel && (
            <FriendsCarousel
              homePageSessionInfo={homePageSessionInfo}
              sortId={undefined}
              sortPosition={0}
            />
          )}
          {recommendations.sorts.map((sort, positionId) => (
            // eslint-disable-next-line react/no-array-index-key
            <React.Fragment key={positionId}>
              <OmniFeedItem
                translate={translate}
                sort={sort}
                positionId={positionId}
                startingRow={startingRowNumbersMap.get(positionId)}
                currentPage={PageContext.HomePage}
                itemsPerRow={itemsPerRowMap.get(positionId)}
                topicPositionOffset={topicPositionOffsetsMap.get(positionId) ?? 0}
                gridRecommendations={gridRecommendationsMap.get(positionId) ?? []}
                friendsPresenceData={friendsPresenceData}
                isDynamicLayoutSizingEnabled={isDynamicLayoutSizingEnabled}
                isCarouselHorizontalScrollEnabled={isCarouselHorizontalScrollEnabled}
                isNewScrollArrowsEnabled={isNewScrollArrowsEnabled}
                isNewSortHeaderEnabled={isNewSortHeaderEnabled}
                sduiRoot={recommendations.sdui}
                hiddenUniverses={hiddenUniverses}
                setHiddenUniverses={setHiddenUniverses}
                refreshFeed={refreshFeed}
              />
            </React.Fragment>
          ))}
        </ContentMetadataContext.Provider>
        <SystemFeedbackComponent />
      </div>
    </div>
  );
};

export default withPageSession(
  withTranslations(
    HomePageOmniFeed,
    personalizationTranslationConfig,
  ) as unknown as React.FC<WithTranslationsProps>,
);
