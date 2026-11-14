import React from "react";
import PropTypes from "prop-types";
import { Button } from "@rbx/foundation-ui";
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailFormat,
  DefaultThumbnailSize,
} from "@rbx/thumbnails";
import playerConstants from "../constants/playerConstants";

function CurrentPlayingGame({ game, translate }) {
  const { universeId, name, referralUrl, isPlayable } = game;

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
    <div className="player-interaction-game flex items-start">
      <a href={referralUrl} className="game-card-link player-interaction-game-icon shrink-0">
        {thumbnail}
      </a>
      <div className="flex flex-col items-start gap-small grow min-width-0">
        <a
          href={referralUrl}
          className="player-interaction-game-name content-emphasis text-truncate-end"
        >
          {name}
        </a>
        {!isPlayable && (
          <Button as="a" href={referralUrl} variant="Standard" size="Small">
            {translate(playerConstants.viewGameDetails)}
          </Button>
        )}
      </div>
    </div>
  );
}

CurrentPlayingGame.propTypes = {
  game: PropTypes.shape({
    universeId: PropTypes.number,
    placeId: PropTypes.number,
    name: PropTypes.string,
    playerCount: PropTypes.number,
    isShowSponsoredLabel: PropTypes.bool,
    nativeAdData: PropTypes.string,
    imageUrl: PropTypes.string,
    referralUrl: PropTypes.string,
    isPlayable: PropTypes.bool,
  }).isRequired,
  translate: PropTypes.func.isRequired,
};

export default CurrentPlayingGame;
