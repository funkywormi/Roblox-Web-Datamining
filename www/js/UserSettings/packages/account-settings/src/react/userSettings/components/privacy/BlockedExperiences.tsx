import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { authenticatedUser } from "header-scripts";
import { Loading } from "react-style-guide";
import { useTranslation } from "react-utilities";
import { TChildInfo } from "../../../../types/childrenInfoTypes";
import GameTile, { TGameData } from "../parentalControls/parentDashboard/GameTile";
import {
  useGetAgeRecommendationQuery,
  useGetGamesDetailsQuery,
} from "../../../apis/gameDetailsApi";
import { blockedExperiencesPageSize } from "../../constants/privacy/privacyConstants";
import { useGetBlockedExperiencesQuery } from "../../../apis/experienceBlockingApi";
import parentalControlsTranslationConstants from "../../constants/contentConstants/parentalControlsTranslationConstants";

export const BlockedExperiences = ({
  searchPagePath,
  child,
}: {
  searchPagePath?: string;
  child?: TChildInfo;
}): JSX.Element => {
  const { translate } = useTranslation();
  const { perExperienceScreentime } = parentalControlsTranslationConstants;
  const {
    data: blockedExperiencesResult,
    isFetching,
    isLoading,
    isError,
  } = useGetBlockedExperiencesQuery({
    targetUserId: child?.userId ?? authenticatedUser.id!,
    limit: blockedExperiencesPageSize,
    offset: 0,
  });

  const universeIds = useMemo(
    () =>
      blockedExperiencesResult?.blockedExperiences.map(experience => experience.universeId) ?? [],
    [blockedExperiencesResult],
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

    if (!isLoading && blockedExperiencesResult?.blockedExperiences.length === 0) {
      return (
        <div className="text-description">
          {translate(perExperienceScreentime.noBlockedExperiences)}
        </div>
      );
    }
    return (
      <div className="parental-controls-game-grid">
        {blockedExperiencesResult?.blockedExperiences.map(experience => {
          const { universeId } = experience;

          const ageRec = ageRecommendations?.[universeId];
          const gameData: TGameData = {
            universeId,
            name: gameDetailsResult?.[universeId]?.name ?? "",
            rootPlaceId: gameDetailsResult?.[universeId]?.rootPlaceId,
            maturityRating: ageRec?.maturityRating,
            isBlocked: true,
          };
          return (
            <GameTile key={universeId} gameData={gameData} showManagementButton child={child} />
          );
        })}
        {isFetching && <Loading />}
      </div>
    );
  };

  return (
    <React.Fragment>
      {child && searchPagePath && (
        <Link to={searchPagePath} className="experience-search-link">
          <span className="icon-additem" />
        </Link>
      )}
      {getInnerComponent()}
    </React.Fragment>
  );
};

export default BlockedExperiences;
