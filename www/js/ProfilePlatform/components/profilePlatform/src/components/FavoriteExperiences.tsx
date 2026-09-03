import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { useSystemFeedback } from "@rbx/core-ui";
import { Component } from "@rbx/profile-platform";
import {
  GameTile,
  GameTileHiddenReason,
  PageContext,
  type TBuildEventProperties,
  type TGameData,
} from "@rbx/discovery-common";
import useProfileJsonComponent from "../hooks/useProfileJsonComponent";
import useFetchFavoriteExperiencesData from "../hooks/useFetchFavoriteExperiencesData";
import ProfileCarouselWithAnalytics from "./Common/ProfileCarouselWithAnalytics";
import { useProfilePlatformContext } from "../context/ProfilePlatformContext";
import { useIsOwnProfile } from "../hooks/useIsOwnProfile";

const FavoriteExperiences = () => {
  const { translate } = useTranslation();
  const favoriteExperiencesData = useProfileJsonComponent(Component.FavoriteExperiences);
  const universeIds = useMemo(
    () =>
      (favoriteExperiencesData?.experiences ?? [])
        .map(experience => experience.universeId)
        .filter(universeId => typeof universeId === "number"),
    [favoriteExperiencesData],
  );
  const { games, isLoading, isError } = useFetchFavoriteExperiencesData(universeIds);
  const { profileId } = useProfilePlatformContext();
  const isOwnProfile = useIsOwnProfile();
  const [hiddenUniverses, setHiddenUniverses] = useState<Set<number>>(() => new Set());
  const { systemFeedbackService } = useSystemFeedback();

  // Randomize the display order on other users' profiles so the order of items
  // cannot be deterministically controlled by the profile owner. On the viewer's
  // own profile, preserve the original order so they see a stable, predictable view.
  const displayedGames = useMemo(() => {
    if (isOwnProfile) {
      return games;
    }
    return games
      .map(game => ({ game, sortKey: Math.random() }))
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(({ game }) => game);
  }, [games, isOwnProfile]);

  const setUniverseHidden = useCallback((universeId: number, isHidden: boolean) => {
    setHiddenUniverses(prev => {
      const updatedHiddenUniverses = new Set(prev);
      if (isHidden) {
        updatedHiddenUniverses.add(universeId);
      } else {
        updatedHiddenUniverses.delete(universeId);
      }
      return updatedHiddenUniverses;
    });
  }, []);

  const handleFavoriteStatusMutationError = useCallback(
    (universeId: number, confirmedIsFavorited: boolean) => {
      setUniverseHidden(universeId, !confirmedIsFavorited);
      systemFeedbackService.warning(
        translate(
          "Response.SomethingWentWrong",
          undefined,
          "Something went wrong. Please try again.",
        ),
      );
    },
    [setUniverseHidden, systemFeedbackService, translate],
  );

  const buildEventProperties = useCallback<TBuildEventProperties>(
    (gameData, position) => ({
      placeId: gameData.placeId,
      universeId: gameData.universeId,
      position: position + 1,
      page: PageContext.UserProfilePage,
    }),
    [],
  );

  const renderFavoriteGameItem = useCallback(
    (game: TGameData, index: number) => (
      <GameTile
        id={index}
        gameData={game}
        translate={translate}
        buildEventProperties={buildEventProperties}
        page={PageContext.UserProfilePage}
        enableRemoveFromFavorites={isOwnProfile}
        onRemoveFromFavorites={() => {
          setUniverseHidden(game.universeId, true);
        }}
        hiddenReason={
          hiddenUniverses.has(game.universeId)
            ? GameTileHiddenReason.RemovedFromFavorites
            : undefined
        }
        onUndoRemoveFromFavorites={() => {
          setUniverseHidden(game.universeId, false);
        }}
        onFavoriteStatusMutationError={confirmedIsFavorited => {
          handleFavoriteStatusMutationError(game.universeId, confirmedIsFavorited);
        }}
      />
    ),
    [
      buildEventProperties,
      translate,
      isOwnProfile,
      hiddenUniverses,
      setUniverseHidden,
      handleFavoriteStatusMutationError,
    ],
  );

  const getItemId = useCallback((game: TGameData) => game.universeId, []);

  if (isLoading || isError || games.length === 0) {
    return null;
  }

  return (
    <div className="profile-favorite-experiences">
      <ProfileCarouselWithAnalytics
        headerTitle={translate("Action.Favorites")}
        headerHref={`/users/${profileId}/favorites#!/places`}
        items={displayedGames}
        renderItem={renderFavoriteGameItem}
        getItemId={getItemId}
        component={Component.FavoriteExperiences}
      />
    </div>
  );
};

export default FavoriteExperiences;
