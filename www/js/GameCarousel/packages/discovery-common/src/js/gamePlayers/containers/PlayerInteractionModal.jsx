import React from "react";
import PropTypes from "prop-types";
import { Dialog, DialogBody, DialogContent, DialogTitle } from "@rbx/foundation-ui";
import { useTranslations } from "@rbx/www-common/i18n";
import playerConstants from "../constants/playerConstants";
import "../../../css/gamePlayers/playerInteractionModal.css";
import CurrentPlayingGame from "../components/CurrentPlayingGame";
import ListOfPlayersInGame from "../components/ListOfPlayersInGame";

function PlayerInteractionModal({ show, onHide, friendsData, friendsInGame, game }) {
  const translate = useTranslations("Feature.PlacesList");
  const translateControls = useTranslations("CommonUI.Controls");

  return (
    // Radix portals the dialog, but React still bubbles its clicks to the tile that opened it.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <span style={{ display: "contents" }} onClick={e => e.stopPropagation()}>
      <Dialog
        open={show}
        onOpenChange={open => {
          if (!open) {
            onHide(new Event("close"));
          }
        }}
        size="Medium"
        isModal
        hasCloseAffordance
        closeLabel={translateControls("Action.Close", undefined, "Close")}
      >
        <DialogContent
          className="player-interaction-dialog"
          style={{ width: 400, maxWidth: "calc(100vw - 24px)" }}
        >
          <DialogBody
            className="player-interaction-body"
            data-testid="game-players-player-interaction-modal"
          >
            <DialogTitle className="player-interaction-title content-emphasis">
              {translate(playerConstants.playerInteractionTitle)}
            </DialogTitle>
            <CurrentPlayingGame game={game} translate={translate} />
            <ListOfPlayersInGame
              friendsData={friendsData}
              friendsInGame={friendsInGame}
              dismissModal={onHide}
              isPlayable={game.isPlayable}
              translate={translate}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </span>
  );
}

PlayerInteractionModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  friendsData: PropTypes.arrayOf(
    PropTypes.shape({
      presense: PropTypes.shape({
        rootPlaceId: PropTypes.number,
        placeId: PropTypes.number,
        gameId: PropTypes.string,
      }),
      id: PropTypes.number,
      nameForDisplay: PropTypes.string,
    }),
  ).isRequired,
  friendsInGame: PropTypes.arrayOf(PropTypes.number).isRequired,
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
};

export default PlayerInteractionModal;
