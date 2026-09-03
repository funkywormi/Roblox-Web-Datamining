import React from "react";
import { SocialLinksJumbotron } from "@rbx/legacy-webapp-types/Roblox";
import GameBadgesList from "@rbx/badges/gameBadges/containers/GameBadgesList";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { aboutTabTranslationConfig } from "../translation.config";
import metadataConstants from "../constants/metadataConstants";
import GameDescriptionSection from "../components/GameDescriptionSection";
import RecommendedGamesCarousel from "../../recommendedGames/RecommendedGamesCarousel";
import TopSongsInGame from "../components/TopSongsInGame";
import GameDetailsVirtualEventsSection from "../../gameDetailsVirtualEvents/GameDetailsVirtualEventsSection";
import useGameDetailsForUniverseId from "../hooks/useGameDetailsForUniverseId";
import useGetAppPolicyData from "../../common/hooks/useGetAppPolicyData";
import ExperienceRefund from "../components/ExperienceRefund";
import ExperienceNotice from "../components/ExperienceNotice";
import { TDiscoverySessionInfo } from "../../common/constants/eventStreamConstants";
import { PageContext } from "../../common/types/pageContext";
import GameDescriptionError from "../components/GameDescriptionError";

const { SocialLinkJumbotronType } = SocialLinksJumbotron;

type TAboutTabProps = {
  attributionId: string;
  referralSessionInfo: TDiscoverySessionInfo;
  referralPage: PageContext | undefined;
} & WithTranslationsProps;

export const AboutTab = ({
  attributionId,
  referralSessionInfo,
  referralPage,
  translate,
}: TAboutTabProps): JSX.Element => {
  const { universeId = "", placeId = "" } = metadataConstants.metadataData() || {};

  const { gameDetails, hasError: hasGameDetailsError } = useGameDetailsForUniverseId(universeId);

  const { experienceDetailsNoticeType, shouldShowLikeFavoriteCounts, isFetchingPolicy } =
    useGetAppPolicyData();

  const shouldShowExperienceContent =
    !hasGameDetailsError && gameDetails !== undefined && gameDetails.isContentRestricted !== true;

  return (
    <div className="game-about-tab-container">
      {shouldShowExperienceContent && (
        <GameDetailsVirtualEventsSection
          universeId={universeId}
          gameDetails={gameDetails}
          attributionId={attributionId}
          referralSessionInfo={referralSessionInfo}
          referralPage={referralPage}
          translate={translate}
        />
      )}

      {hasGameDetailsError ? (
        <GameDescriptionError translate={translate} />
      ) : (
        <GameDescriptionSection
          universeId={universeId}
          placeId={placeId}
          gameDetails={gameDetails}
          shouldShowLikeFavoriteCounts={shouldShowLikeFavoriteCounts}
          isFetchingPolicy={isFetchingPolicy}
          referralSessionInfo={referralSessionInfo}
          translate={translate}
        />
      )}

      {shouldShowExperienceContent && (
        <React.Fragment>
          {experienceDetailsNoticeType !== undefined && experienceDetailsNoticeType !== "" && (
            <ExperienceNotice noticeType={experienceDetailsNoticeType} translate={translate} />
          )}
          <SocialLinksJumbotron
            type={SocialLinkJumbotronType.Game}
            targetId={universeId}
            referralSessionInfo={referralSessionInfo}
          />
          <GameBadgesList universeId={universeId} />
          <div className="container-list games-detail">
            <RecommendedGamesCarousel translate={translate} />
            <TopSongsInGame translate={translate} universeId={universeId} />
          </div>
          {gameDetails?.refundPolicy && (
            <ExperienceRefund gameDetails={gameDetails} translate={translate} />
          )}
        </React.Fragment>
      )}
    </div>
  );
};

export default withTranslations(AboutTab, aboutTabTranslationConfig);
