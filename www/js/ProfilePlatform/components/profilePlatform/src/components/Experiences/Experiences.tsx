import { useCallback } from "react";
import { GameTile, type TBuildEventProperties, type TGameTileProps } from "@rbx/discovery-common";
import { Component } from "@rbx/profile-platform";
import type { TExperienceGameData } from "../../hooks/useFetchExperiencesData";
import ProfileCarouselWithAnalytics from "../Common/ProfileCarouselWithAnalytics";

type ExperiencesProps = {
  games: TExperienceGameData[];
  translate: TGameTileProps["translate"];
  buildEventProperties: TBuildEventProperties;
};

const Experiences = ({ games, translate, buildEventProperties }: ExperiencesProps) => {
  const renderGameItem = useCallback(
    (game: TExperienceGameData, index: number) => (
      <GameTile
        id={index}
        gameData={game}
        translate={translate}
        buildEventProperties={buildEventProperties}
      />
    ),
    [buildEventProperties, translate],
  );
  const getItemId = useCallback((game: TExperienceGameData) => game.universeId, []);

  return (
    <div className="profile-experiences">
      <ProfileCarouselWithAnalytics
        headerTitle={translate("Label.Games")}
        items={games}
        renderItem={renderGameItem}
        getItemId={getItemId}
        component={Component.Experiences}
      />
    </div>
  );
};

export default Experiences;
