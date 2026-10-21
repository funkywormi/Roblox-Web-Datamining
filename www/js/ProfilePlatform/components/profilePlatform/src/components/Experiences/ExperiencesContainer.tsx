import { useCallback, useMemo } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { Component } from "@rbx/profile-platform";
import { PageContext, type TBuildEventProperties } from "@rbx/discovery-common";
import useProfileJsonComponent from "../../hooks/useProfileJsonComponent";
import useFetchExperiencesData from "../../hooks/useFetchExperiencesData";
import Experiences from "./Experiences";

const ExperiencesContainer = () => {
  const { translate } = useTranslation();
  const experiencesData = useProfileJsonComponent(Component.Experiences);
  const universeIds = useMemo(
    () =>
      (experiencesData?.experiences ?? [])
        .map(experience => experience.universeId)
        .filter(universeId => typeof universeId === "number"),
    [experiencesData],
  );
  const { games, isLoading, isError } = useFetchExperiencesData(universeIds);

  const buildEventProperties = useCallback<TBuildEventProperties>(
    (gameData, position) => ({
      placeId: gameData.placeId,
      universeId: gameData.universeId,
      position: position + 1,
      page: PageContext.UserProfilePage,
    }),
    [],
  );

  if (isLoading || isError || games.length === 0) {
    return null;
  }

  return (
    <Experiences games={games} translate={translate} buildEventProperties={buildEventProperties} />
  );
};

export default ExperiencesContainer;
