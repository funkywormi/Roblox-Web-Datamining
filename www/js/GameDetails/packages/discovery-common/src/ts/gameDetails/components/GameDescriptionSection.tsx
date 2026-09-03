import React, { useEffect, useState } from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { Loading } from "@rbx/core-ui";
import { TGetGameDetails, TGetUniverseVoiceStatus } from "../../common/types/bedev1Types";
import bedev1Services from "../../common/services/bedev1Services";
import { FeatureGameDetails } from "../../common/constants/translationConstants";
import { TDiscoverySessionInfo } from "../../common/constants/eventStreamConstants";
import GameDescription from "./GameDescription";
import GameDescriptionTable from "./GameDescriptionTable";
import GameDescriptionFooter from "./GameDescriptionFooter";
import AgeRecommendationTitle from "../../gameGuidelines/containers/AgeRecommendationTitle";
import isBuildExperience from "../utils/isBuildExperience";
import "../../../css/gameDetails/_description.scss";

export type TGameDescriptionSectionProps = {
  universeId: string;
  placeId: string;
  gameDetails: TGetGameDetails | undefined;
  shouldShowLikeFavoriteCounts: boolean | undefined;
  isFetchingPolicy: boolean;
  referralSessionInfo: TDiscoverySessionInfo;
  translate: TranslateFunction;
};

export const GameDescriptionSection = ({
  universeId,
  placeId,
  gameDetails,
  shouldShowLikeFavoriteCounts,
  isFetchingPolicy,
  referralSessionInfo,
  translate,
}: TGameDescriptionSectionProps): JSX.Element => {
  const [universeVoiceStatus, setUniverseVoiceStatus] = useState<
    TGetUniverseVoiceStatus | undefined
  >(undefined);

  useEffect(() => {
    const fetchVoiceStatus = () => {
      bedev1Services
        .getVoiceStatus(universeId)
        .then(response => setUniverseVoiceStatus(response))
        .catch(() =>
          setUniverseVoiceStatus({
            isUniverseEnabledForVoice: false,
            isUniverseEnabledForAvatarVideo: false,
          }),
        );
    };

    fetchVoiceStatus();
  }, [universeId]);

  if (gameDetails === undefined || universeVoiceStatus === undefined || isFetchingPolicy) {
    return <Loading />;
  }

  return (
    <div className="game-description-container">
      <div className="container-header">
        <h2>{translate(FeatureGameDetails.HeadingDescription)}</h2>
      </div>

      <GameDescription
        name={gameDetails.name}
        sourceName={gameDetails.sourceName}
        description={gameDetails.description}
        sourceDescription={gameDetails.sourceDescription}
        universeId={universeId}
        referralSessionInfo={referralSessionInfo}
        translate={translate}
      />

      <div
        id="game-age-recommendation-details-container"
        className="game-age-recommendation-details-container"
      >
        <AgeRecommendationTitle isDisplayAgeRecommendationDetails />
      </div>

      <GameDescriptionTable
        gameDetails={gameDetails}
        universeVoiceStatus={universeVoiceStatus}
        shouldShowFavoritesCount={shouldShowLikeFavoriteCounts}
        translate={translate}
      />

      <GameDescriptionFooter
        placeId={placeId}
        universeId={universeId}
        copyingAllowed={gameDetails.copyingAllowed}
        showBuildDisclaimer={isBuildExperience(gameDetails.creationSource)}
        translate={translate}
      />
    </div>
  );
};

export default GameDescriptionSection;
