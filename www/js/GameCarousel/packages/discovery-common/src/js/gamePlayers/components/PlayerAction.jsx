import React from "react";
import PropTypes from "prop-types";
import { buildPlayGameProperties } from "@rbx/core-scripts/game";
import { Button } from "@rbx/foundation-ui";
import { launchPlayGame } from "@rbx/game-play-button/game-launcher";
import playerConstants from "../constants/playerConstants";

function PlayerAction({ playerData, dismissModal, isPlayable, translate }) {
  const {
    presence: { rootPlaceId, placeId, gameId: gameInstanceId },
    id,
    nameForDisplay,
  } = playerData;
  const joinGame = e => {
    const propertiesForEvent = {
      rootPlaceId,
      placeId,
    };
    const playGameProperties = buildPlayGameProperties(rootPlaceId, placeId, gameInstanceId, id);
    const {
      eventStreamParams: { joinGameInPlacesList, gamePlayIntentInPlacesList },
    } = playerConstants;
    const eventStreamProperties = {
      eventName: joinGameInPlacesList.name,
      ctx: joinGameInPlacesList.ctx,
      properties: propertiesForEvent,
      gamePlayIntentEventCtx: gamePlayIntentInPlacesList.ctx,
    };
    launchPlayGame(playGameProperties, eventStreamProperties);
    dismissModal(e);
  };

  return (
    <div className="player-interaction-info flex items-center justify-between grow min-width-0">
      <span className="player-interaction-name text-truncate-end">{nameForDisplay}</span>
      <Button
        className="player-interaction-join"
        variant="Emphasis"
        size="Small"
        onClick={joinGame}
        isDisabled={!isPlayable}
      >
        {translate(playerConstants.joinGame)}
      </Button>
    </div>
  );
}

PlayerAction.propTypes = {
  playerData: PropTypes.shape({
    presence: PropTypes.shape({
      rootPlaceId: PropTypes.number,
      placeId: PropTypes.number,
      gameId: PropTypes.string,
    }),
    id: PropTypes.number,
    nameForDisplay: PropTypes.string,
  }).isRequired,
  dismissModal: PropTypes.func.isRequired,
  isPlayable: PropTypes.bool.isRequired,
  translate: PropTypes.func.isRequired,
};

export default PlayerAction;
