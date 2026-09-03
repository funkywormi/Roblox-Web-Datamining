import { useState } from "react";
import classNames from "classnames";
import { GameTile, type TBuildEventProperties, type TGameTileProps } from "@rbx/discovery-common";
import type { TExperienceGameData } from "../../hooks/useFetchExperiencesData";
import useProgressiveReveal from "../../hooks/useProgressiveReveal";
import ExperiencesSlideshow from "./ExperiencesSlideshow";
import "./experiences.scss";

const INITIAL_VISIBLE = 12;
const REVEAL_STEP = 12;

type ExperiencesProps = {
  games: TExperienceGameData[];
  translate: TGameTileProps["translate"];
  buildEventProperties: TBuildEventProperties;
};

const Experiences = ({ games, translate, buildEventProperties }: ExperiencesProps) => {
  const [isGridOn, setIsGridOn] = useState(false);
  const { visibleCount, sentinelRef } = useProgressiveReveal(
    games.length,
    INITIAL_VISIBLE,
    REVEAL_STEP,
  );

  return (
    <div className="profile-experiences profile-game section">
      <div className="container-header">
        <h3>{translate("Heading.GameTitle")}</h3>
        <div className="container-buttons">
          <button
            type="button"
            className={classNames("profile-view-selector btn-generic-slideshow-xs", {
              "btn-secondary-xs": !isGridOn,
              "btn-control-xs": isGridOn,
            })}
            title={translate("Label.SlideshowView")}
            aria-label={translate("Label.SlideshowView")}
            aria-pressed={!isGridOn}
            onClick={() => {
              setIsGridOn(false);
            }}
          >
            <span className={classNames("icon-slideshow", { selected: !isGridOn })} />
          </button>
          <button
            type="button"
            className={classNames("profile-view-selector btn-generic-grid-xs", {
              "btn-secondary-xs": isGridOn,
              "btn-control-xs": !isGridOn,
            })}
            title={translate("Label.GridView")}
            aria-label={translate("Label.GridView")}
            aria-pressed={isGridOn}
            onClick={() => {
              setIsGridOn(true);
            }}
          >
            <span className={classNames("icon-grid", { selected: isGridOn })} />
          </button>
        </div>
      </div>

      {isGridOn ? (
        <ul className="hlist game-cards">
          {games.slice(0, visibleCount).map((game, index) => (
            <li className="game-container shown" data-index={index} key={game.universeId}>
              <GameTile
                id={index}
                gameData={game}
                translate={translate}
                buildEventProperties={buildEventProperties}
              />
            </li>
          ))}
          {visibleCount < games.length && (
            <li
              ref={sentinelRef}
              className="game-container experiences-sentinel"
              aria-hidden="true"
            />
          )}
        </ul>
      ) : (
        <ExperiencesSlideshow games={games} translate={translate} />
      )}
    </div>
  );
};

export default Experiences;
