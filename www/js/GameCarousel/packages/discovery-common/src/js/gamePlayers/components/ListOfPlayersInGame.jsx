import React from "react";
import PropTypes from "prop-types";
import PlayerAvatar from "./PlayerAvatar";
import PlayerAction from "./PlayerAction";

function ListOfPlayersInGame({ friendsData, friendsInGame, dismissModal, isPlayable, translate }) {
  const friendsObj = {};
  friendsData.forEach(friend => {
    friendsObj[friend.id] = friend;
  });
  return (
    <ul className="flex flex-col" style={{ maxHeight: 450, overflowY: "auto" }}>
      {friendsInGame.map((friendId, idx) => {
        const keyValue = friendId + idx;
        const friend = friendsObj[friendId];
        const { id, nameForDisplay } = friend;
        return (
          <li key={keyValue} className="player-interaction-row">
            <div className="player-interaction-row-content flex items-start">
              <span
                className="player-interaction-avatar shrink-0 radius-circle"
                style={{ overflow: "hidden" }}
              >
                <PlayerAvatar playerId={id} altName={nameForDisplay} />
              </span>
              <PlayerAction
                playerData={friend}
                dismissModal={dismissModal}
                isPlayable={isPlayable}
                translate={translate}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

ListOfPlayersInGame.propTypes = {
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
  dismissModal: PropTypes.func.isRequired,
  isPlayable: PropTypes.bool.isRequired,
  translate: PropTypes.func.isRequired,
};

export default ListOfPlayersInGame;
