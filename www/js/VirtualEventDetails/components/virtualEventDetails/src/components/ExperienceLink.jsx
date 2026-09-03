import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailFormat,
  DefaultThumbnailSize,
} from "@rbx/thumbnails";
import { Link } from "@rbx/core-ui/legacy/react-style-guide";
import { getGameDetailsUrlForPlace } from "../services";

import "../css/virtualEventDetails/virtualEventExperienceLink.scss";

function ExperienceLink({ universeId, rootPlaceId, name }) {
  const referralUrl = useMemo(() => getGameDetailsUrlForPlace(rootPlaceId), [rootPlaceId]);

  const thumbnail = (
    <Thumbnail2d
      type={ThumbnailTypes.gameIcon}
      size={DefaultThumbnailSize}
      targetId={universeId}
      imgClassName="game-card-thumb"
      format={ThumbnailFormat.jpeg}
    />
  );

  return (
    <div className="player-interaction-container" data-testid="event-experience-link">
      <span className="cursor-pointer game-icon">
        <Link url={referralUrl} className="game-card-link">
          {thumbnail}
        </Link>
      </span>
      <span className="game-info-container">
        <Link url={referralUrl} className="game-name">
          {name}
        </Link>
      </span>
    </div>
  );
}

ExperienceLink.propTypes = {
  universeId: PropTypes.number.isRequired,
  rootPlaceId: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
};

ExperienceLink.defaultProps = {};

export default ExperienceLink;
