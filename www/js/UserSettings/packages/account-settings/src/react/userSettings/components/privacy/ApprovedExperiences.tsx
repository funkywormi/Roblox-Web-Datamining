import React, { useMemo } from "react";
import { authenticatedUser } from "header-scripts";
import { Loading } from "react-style-guide";
import { useTranslation } from "react-utilities";
import { TChildInfo } from "../../../../types/childrenInfoTypes";
import GameTile, { TGameData } from "../parentalControls/parentDashboard/GameTile";
import {
  useGetAgeRecommendationQuery,
  useGetGamesDetailsQuery,
} from "../../../apis/gameDetailsApi";
import { approvedExperiencesPageSize } from "../../constants/privacy/privacyConstants";
import { useGetApprovedExperiencesQuery } from "../../../apis/experienceBlockingApi";
import parentalControlsTranslationConstants from "../../constants/contentConstants/parentalControlsTranslationConstants";
import ApprovedExperienceTile from "./ApprovedExperienceTile";

export const ApprovedExperiences = ({ child }: { child?: TChildInfo }): JSX.Element => {
  const { translate } = useTranslation();
  const { approvedExperiences } = parentalControlsTranslationConstants;
  const {
    data: approvedExperiencesResult,
    isFetching,
    isLoading,
    isError,
  } = useGetApprovedExperiencesQuery({
    targetUserId: child?.userId ?? authenticatedUser.id!,
    limit: approvedExperiencesPageSize,
    offset: 0,
  });

  const universeIds = useMemo(
    () =>
      approvedExperiencesResult?.approvedExperiences.map(experience => experience.universeId) ?? [],
    [approvedExperiencesResult],
  );

  const { data: gameDetailsResult } = useGetGamesDetailsQuery(universeIds, {
    skip: universeIds.length === 0,
  });

  const { data: ageRecommendations } = useGetAgeRecommendationQuery(universeIds, {
    skip: universeIds.length === 0,
  });

  const getInnerComponent = (): JSX.Element => {
    if (isError) {
      return (
        <div className="text-description">
          {translate(parentalControlsTranslationConstants.errorLoadingList)}
        </div>
      );
    }

    if (!isLoading && approvedExperiencesResult?.approvedExperiences.length === 0) {
      return (
        <div className="text-description approved-experiences-empty-state">
          {translate(approvedExperiences.noApprovedExperiences)}
        </div>
      );
    }

    return (
      <div className="parental-controls-game-grid">
        {approvedExperiencesResult?.approvedExperiences.map(experience => {
          const { universeId } = experience;
          const ageRec = ageRecommendations?.[universeId];
          const gameData: TGameData = {
            universeId,
            name: gameDetailsResult?.[universeId]?.name ?? "",
            rootPlaceId: gameDetailsResult?.[universeId]?.rootPlaceId,
            maturityRating: ageRec?.maturityRating,
            isApproved: true,
          };
          return child ? (
            <ApprovedExperienceTile key={universeId} gameData={gameData} child={child} />
          ) : (
            <GameTile key={universeId} gameData={gameData} />
          );
        })}
        {isFetching && <Loading />}
      </div>
    );
  };

  return (
    <React.Fragment>
      {child && (
        <div className="text-description">
          {translate(approvedExperiences.approvedExperiencesDescription)}
        </div>
      )}
      {getInnerComponent()}
    </React.Fragment>
  );
};

export default ApprovedExperiences;
