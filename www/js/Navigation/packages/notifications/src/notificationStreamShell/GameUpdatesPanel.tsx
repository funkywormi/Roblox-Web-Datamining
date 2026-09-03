import React from "react";
import { useNotificationLocalization } from "../sendrNotificationStream/context/NotificationsLocalization";
import GameUpdateShellCard from "./shellCards/GameUpdateShellCard";
import { GameUpdateModel, markGameUpdateSeenOnce } from "../notificationStreamData/useGameUpdates";
import { GAME_UPDATE_NS_PAGES } from "../notificationStreamData/gameUpdatesApi";
import "./gameUpdatesPanel.css";

export type GameUpdatesPanelProps = {
  models: Map<number, GameUpdateModel>;
  onBack: () => void;
  onInteract: () => void;
  canLaunch: boolean;
};

export const GameUpdatesPanel = ({
  models,
  onBack,
  onInteract,
  canLaunch,
}: GameUpdatesPanelProps): JSX.Element => {
  const translate = useNotificationLocalization();
  const sorted = [...models.values()].sort((a, b) => (b.createdOn ?? 0) - (a.createdOn ?? 0));

  React.useEffect(() => {
    sorted.forEach(markGameUpdateSeenOnce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="game-updates-panel">
      <div className="notification-stream-header game-updates-panel-header">
        <button type="button" className="game-updates-panel-back" onClick={onBack}>
          <span className="game-updates-panel-back-icon" />
          <span className="content-default game-updates-panel-title">
            {translate("Heading.BackToAllNotifications")}
          </span>
        </button>
      </div>
      <div className="game-updates-panel-list">
        {sorted.map(model => (
          <div key={model.universeId} className="game-updates-panel-row">
            <GameUpdateShellCard
              universes={[{ UniverseId: model.universeId, GameName: model.truncatedGameName }]}
              models={models}
              eventDate={model.createdOn != null ? new Date(model.createdOn).toISOString() : ""}
              eventCount={1}
              isInteracted={false}
              canLaunch={canLaunch}
              onInteract={onInteract}
              onViewUpdates={onBack}
              nsPage={GAME_UPDATE_NS_PAGES.gameUpdates}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameUpdatesPanel;
