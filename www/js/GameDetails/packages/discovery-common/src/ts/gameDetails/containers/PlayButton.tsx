import React, { type ReactNode } from "react";
import {
  InstallInstructionsWithTranslation,
  resolveAppDownload,
  TokenizedDownloadButton,
  type ResolvedAppDownload,
} from "@rbx/app-download";
import { TranslationProvider, useTranslation } from "@rbx/core-scripts/react";
import { Loading } from "@rbx/core-ui";
import {
  usePlayabilityStatus,
  DefaultPlayButton,
  ContextualMessage,
  PlayabilityStatus,
} from "@rbx/game-play-button";
import { EventContext } from "@rbx/unified-logging";
import metadataConstants from "../constants/metadataConstants";
import eventStreamConstants, {
  EventStreamMetadata,
  SessionInfoType,
} from "../../common/constants/eventStreamConstants";
import { ANALYTICS_DATA_KEY_SUFFIX } from "../../common/constants/analyticsConstants";
import usePageReferralTracker from "../../common/hooks/usePageReferralTracker";
import {
  mergeEventParamsWithAnalyticsData,
  filterAnalyticsDataQueryParams,
} from "../../common/utils/analyticsDataUtils";
import { parseQueryString } from "../../common/utils/parsingUtils";
import useGetAppPolicyData from "../../common/hooks/useGetAppPolicyData";
import usePlaceIdOverride from "../../common/hooks/usePlaceIdOverride";
import { PageContext } from "../../common/types/pageContext";
import getExperienceAffiliateReferralUrlParams from "../../common/utils/getExperienceAffiliateReferralUrlParams";
import { ExperienceNoticeType } from "../constants/experienceNoticeConstants";

type TPlayButtonProps = {
  attributionId: string;
};

const renderInstallInstructions = (download: ResolvedAppDownload): ReactNode => (
  <InstallInstructionsWithTranslation downloadLink={download.link} />
);

function PlayButtonContents({ attributionId }: TPlayButtonProps): JSX.Element {
  const { translate } = useTranslation();
  const {
    universeId = "",
    rootPlaceId = "",
    privateServerLinkCode = "",
    gameInstanceId = "",
  } = metadataConstants.metadataData() || {};
  const { playabilityStatus, refetchPlayabilityData, unplayableDisplayText, demoModeAvailable } =
    usePlayabilityStatus(universeId);
  const { experienceDetailsNoticeType, shouldShowVpcPlayButtonUpsells, isFetchingPolicy } =
    useGetAppPolicyData();
  const { linkCode, linkType } = getExperienceAffiliateReferralUrlParams(
    window.location.toString(),
  );
  const [shouldDefaultToDownloadButton] = React.useState(
    () => parseQueryString(window.location.search).downloadButtonDefault === "true",
  );
  const { referralParams, appsFlyerReferralParams, serverProvidedQueryParams } =
    usePageReferralTracker(
      eventStreamConstants.gameDetailReferral,
      [
        EventStreamMetadata.IsAd,
        EventStreamMetadata.NativeAdData,
        EventStreamMetadata.HeroUnitId,
        EventStreamMetadata.Page,
        EventStreamMetadata.PlaceId,
        EventStreamMetadata.PlaceIdOverride,
        EventStreamMetadata.LaunchData,
        EventStreamMetadata.UniverseId,
        EventStreamMetadata.SortPos,
        EventStreamMetadata.Position,
        EventStreamMetadata.RowOnPage,
        EventStreamMetadata.PositionInRow,
        EventStreamMetadata.GameSetTypeId,
        EventStreamMetadata.GameSetTargetId,
        EventStreamMetadata.SortId,
        EventStreamMetadata.SortSubId,
        EventStreamMetadata.FriendId,
        EventStreamMetadata.NumberOfLoadedTiles,
        EventStreamMetadata.AppliedFilters,
        SessionInfoType.DiscoverPageSessionInfo,
        SessionInfoType.HomePageSessionInfo,
        SessionInfoType.GameSearchSessionInfo,
        SessionInfoType.SearchLandingPageSessionInfo,
        SessionInfoType.SpotlightPageSessionInfo,
        SessionInfoType.PreAuthLandingPageSessionInfo,
      ],
      ["privateServerLinkCode", "placeId", "launchData", "gameInstanceId", "referralUrl"],
      {
        [EventStreamMetadata.PlaceId]: rootPlaceId,
        [EventStreamMetadata.UniverseId]: universeId,
        [EventStreamMetadata.ShareLinkType]: linkType,
        [EventStreamMetadata.ShareLinkId]: linkCode,
      },
      undefined,
      undefined,
      { queryParamSuffixForServerProvidedKeys: ANALYTICS_DATA_KEY_SUFFIX },
    );
  const resolvedDownload = React.useMemo(
    () =>
      resolveAppDownload({
        translate,
      }),
    [translate],
  );

  // Use placeIdOverride from URL only if it belongs to this EDP's universe
  const { validatedPlaceIdOverride, isResolvingPlaceId } = usePlaceIdOverride(
    referralParams[EventStreamMetadata.PlaceIdOverride],
    universeId,
  );
  const placeId = validatedPlaceIdOverride ? String(validatedPlaceIdOverride) : rootPlaceId;

  const launchData =
    referralParams[EventStreamMetadata.LaunchData] != null &&
    String(referralParams[EventStreamMetadata.LaunchData]).trim() !== ""
      ? String(referralParams[EventStreamMetadata.LaunchData])
      : undefined;

  if (isFetchingPolicy || isResolvingPlaceId) {
    return <Loading />;
  }

  const playButtonBaseEventProperties = {
    [SessionInfoType.DiscoverPageSessionInfo]: referralParams.discoverPageSessionInfo,
    [SessionInfoType.GameSearchSessionInfo]: referralParams.gameSearchSessionInfo,
    [SessionInfoType.HomePageSessionInfo]: referralParams.homePageSessionInfo,
    [SessionInfoType.SpotlightPageSessionInfo]: referralParams.spotlightPageSessionInfo,
    [SessionInfoType.SearchLandingPageSessionInfo]: referralParams.searchLandingPageSessionInfo,
    [SessionInfoType.PreAuthLandingPageSessionInfo]: referralParams.preAuthLandingPageSessionInfo,
    [EventStreamMetadata.AttributionId]: attributionId,
    [EventStreamMetadata.Page]: referralParams.page,
    [EventStreamMetadata.SortPos]: referralParams.sortPos,
    [EventStreamMetadata.GameSetTypeId]: referralParams.gameSetTypeId,
    [EventStreamMetadata.SortId]: referralParams.sortId,
    [EventStreamMetadata.SortSubId]: referralParams.sortSubId,
    [EventStreamMetadata.UniverseId]: universeId,
    [EventStreamMetadata.AppliedFilters]: referralParams.appliedFilters,
    [EventStreamMetadata.HeroUnitId]: referralParams.heroUnitId,
    [EventStreamMetadata.PlayContext]: PageContext.GameDetailPage,
    [EventStreamMetadata.LaunchData]: launchData,
    [EventStreamMetadata.PlaceId]: placeId,
    [EventStreamMetadata.PlaceIdOverride]: validatedPlaceIdOverride ?? undefined,
  };
  const playButtonEventProperties = mergeEventParamsWithAnalyticsData(
    playButtonBaseEventProperties,
    filterAnalyticsDataQueryParams(serverProvidedQueryParams),
  );
  const playabilityStatusCtaOverrides = {
    [PlayabilityStatus.GuestProhibited]:
      shouldDefaultToDownloadButton && resolvedDownload?.isDirectDownload ? (
        <TokenizedDownloadButton
          variant="Emphasis"
          size="Large"
          className="game-details-download-button width-full"
          download={resolvedDownload}
          renderInstallInstructions={renderInstallInstructions}
          text={translate("Action.Download")}
        />
      ) : undefined,
  };

  return (
    <React.Fragment>
      <DefaultPlayButton
        placeId={placeId}
        rootPlaceId={rootPlaceId}
        universeId={universeId}
        privateServerLinkCode={privateServerLinkCode}
        gameInstanceId={gameInstanceId}
        refetchPlayabilityStatus={refetchPlayabilityData}
        playabilityStatus={playabilityStatus}
        demoModeAvailable={demoModeAvailable}
        hideButtonText={false}
        disableLoadingState={false}
        eventProperties={playButtonEventProperties}
        appsFlyerReferralProperties={appsFlyerReferralParams}
        shouldShowVpcPlayButtonUpsells={shouldShowVpcPlayButtonUpsells}
        playabilityStatusCtaOverrides={playabilityStatusCtaOverrides}
        pageContext={EventContext.GameDetail}
      />
      <ContextualMessage
        playabilityStatus={playabilityStatus}
        shouldShowVpcPlayButtonUpsells={shouldShowVpcPlayButtonUpsells}
        shouldShowNoticeAgreementIfPlayable={
          experienceDetailsNoticeType === ExperienceNoticeType.InExperiencePurchase
        }
        unplayableDisplayText={unplayableDisplayText}
        contextualMessageClassName="play-button-contextual-message"
        analyticsConfig={{
          universeId,
          pageContext: EventContext.GameDetail,
          attributionId,
        }}
      />
    </React.Fragment>
  );
}

export default function PlayButton(props: TPlayButtonProps): JSX.Element {
  return (
    <TranslationProvider config={["Feature.DownloadLanding"]}>
      <PlayButtonContents {...props} />
    </TranslationProvider>
  );
}
