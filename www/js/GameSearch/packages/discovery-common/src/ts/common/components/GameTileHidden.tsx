import { WithTranslationsProps } from "@rbx/core-scripts/react";
import { PageContext } from "../types/pageContext";
import { GameTileHiddenReason } from "./GameTileUtils";
import RemoveFromFavoritesHiddenTileContent from "./RemoveFromFavoritesHiddenTileContent";

type TGameTileHiddenProps = {
  translate: WithTranslationsProps["translate"];
  reason?: GameTileHiddenReason;
  universeId: number;
  topicId?: string;
  page?: PageContext;
  onUndo?: () => void;
};

const GameTileHidden = ({
  translate,
  reason,
  universeId,
  topicId,
  page,
  onUndo,
}: TGameTileHiddenProps): JSX.Element | null => {
  switch (reason) {
    case GameTileHiddenReason.RemovedFromFavorites:
      return (
        <div className="game-tile-hidden-placeholder" data-testid="game-tile-hidden-placeholder">
          <RemoveFromFavoritesHiddenTileContent
            translate={translate}
            universeId={universeId}
            topicId={topicId}
            page={page}
            onUndo={onUndo}
          />
        </div>
      );
    default:
      console.error(`GameTileHidden: unsupported reason "${String(reason)}"`);
      return null;
  }
};

export default GameTileHidden;
