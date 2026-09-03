import { useState } from "react";
import classNames from "classnames";
import { Thumbnail2d, ThumbnailTypes, ThumbnailGameIconSize } from "@rbx/thumbnails";
import { abbreviateNumber } from "@rbx/core-scripts/format/number";
import type { TGameTileProps } from "@rbx/discovery-common";
import type { TExperienceGameData } from "../../hooks/useFetchExperiencesData";

type ExperiencesSlideshowProps = {
  games: TExperienceGameData[];
  translate: TGameTileProps["translate"];
};

const ExperiencesSlideshow = ({ games, translate }: ExperiencesSlideshowProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const pageCount = games.length;

  const goPrev = () => {
    setCurrentPage(page => (page - 1 + pageCount) % pageCount);
  };
  const goNext = () => {
    setCurrentPage(page => (page + 1) % pageCount);
  };

  return (
    <div className="switcher slide-switcher games">
      <ul className="slide-items-container switcher-items hlist">
        {games.map((game, index) => (
          <li
            className={classNames("switcher-item slide-item-container", {
              active: index === currentPage,
            })}
            data-index={index}
            key={game.universeId}
          >
            <div className="col-sm-6 slide-item-container-left">
              <div className="slide-item-emblem-container">
                <a
                  className="slide-item-link"
                  href={game.canonicalUrlPath ?? `/games/${game.placeId}`}
                >
                  <Thumbnail2d
                    targetId={game.universeId}
                    type={ThumbnailTypes.gameIcon}
                    size={ThumbnailGameIconSize.size150}
                    containerClass="slide-item-image"
                    altName={game.name}
                  />
                </a>
              </div>
            </div>
            <div className="col-sm-6 slide-item-container-right games">
              <div className="slide-item-info">
                <div className="text-overflow slide-item-name games font-title">{game.name}</div>
                <p className="text-description para-overflow slide-item-description games">
                  {game.description}
                </p>
              </div>
              <div className="slide-item-stats">
                <ul className="hlist">
                  <li className="list-item">
                    <div className="text-label slide-item-stat-title">
                      {translate("Label.Playing")}
                    </div>
                    <div className="text-lead slide-item-members-count">
                      {abbreviateNumber(game.playerCount)}
                    </div>
                  </li>
                  <li className="list-item">
                    <div className="text-label slide-item-stat-title">
                      {translate("Label.Visits")}
                    </div>
                    <div className="text-lead text-overflow slide-item-my-rank games">
                      {abbreviateNumber(game.visits ?? 0)}
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="carousel-control left"
        aria-label={translate("Label.Previous")}
        onClick={goPrev}
      >
        <span className="icon-carousel-left" />
      </button>
      <button
        type="button"
        className="carousel-control right"
        aria-label={translate("Label.Next")}
        onClick={goNext}
      >
        <span className="icon-carousel-right" />
      </button>
    </div>
  );
};

export default ExperiencesSlideshow;
