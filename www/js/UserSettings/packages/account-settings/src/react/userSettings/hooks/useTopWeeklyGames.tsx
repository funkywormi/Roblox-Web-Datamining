import { useMemo } from "react";
import { authenticatedUser } from "header-scripts";
import { useGetGamesDetailsQuery, useGetAgeRecommendationQuery } from "../../apis/gameDetailsApi";
import { useGetTopWeeklyScreentimeByUniverseQuery } from "../../apis/parentalControlsApi";
import { useGetBlockedExperiencesQuery } from "../../apis/experienceBlockingApi";
import { blockedExperiencesPageSize } from "../constants/privacy/privacyConstants";
import { TChildInfo } from "../../../types/childrenInfoTypes";
import { TGameData } from "../components/parentalControls/parentDashboard/GameTile";

/**
 * Shared hook that returns the child/user's top weekly games (by playtime),
 * fully populated with game details, age recommendations, and block status.
 *
 * Used by the parent dashboard preview, the standalone Top Games list page,
 * and individual game detail pages so they all stay in sync.
 */
const useTopWeeklyGames = (child?: TChildInfo): { games: TGameData[]; isLoading: boolean } => {
  const { data: screentimeData, isLoading: isScreentimeLoading } =
    useGetTopWeeklyScreentimeByUniverseQuery(child?.userId);

  const { data: blockedExperiencesResult } = useGetBlockedExperiencesQuery({
    targetUserId: child?.userId ?? authenticatedUser.id!,
    limit: blockedExperiencesPageSize,
    offset: 0,
  });

  const universeIds = useMemo(
    () => screentimeData?.universeWeeklyScreentimes.map(game => game.universeId) ?? [],
    [screentimeData],
  );

  const { data: gamesDetails, isLoading: isDetailsLoading } = useGetGamesDetailsQuery(universeIds, {
    skip: universeIds.length === 0,
  });
  const { data: ageRecommendations } = useGetAgeRecommendationQuery(universeIds, {
    skip: universeIds.length === 0,
  });

  const games: TGameData[] = useMemo(() => {
    if (!gamesDetails || !screentimeData) return [];

    return screentimeData.universeWeeklyScreentimes.map(game => {
      const details = gamesDetails?.[game.universeId];
      const ageRec = ageRecommendations?.[game.universeId];
      const isBlocked = blockedExperiencesResult?.blockedExperiences.some(
        blocked => blocked.universeId === game.universeId,
      );
      return {
        universeId: game.universeId,
        name: details?.name ?? "",
        playTimeMinutes: game.weeklyMinutes,
        maturityRating: ageRec?.maturityRating ?? "",
        contentMaturity: ageRec?.contentMaturity,
        genre_l1: details?.genre_l1,
        genre_l2: details?.genre_l2,
        creator: details?.creator,
        isBlocked,
        disabled: isBlocked,
        rootPlaceId: details?.rootPlaceId,
      };
    });
  }, [gamesDetails, ageRecommendations, screentimeData, blockedExperiencesResult]);

  return {
    games,
    isLoading: isScreentimeLoading || (universeIds.length > 0 && isDetailsLoading),
  };
};

export default useTopWeeklyGames;
