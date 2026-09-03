import { WithTranslationsProps } from "@rbx/core-scripts/react";
import { FeatureGameDetails } from "../constants/translationConstants";
import { PageContext } from "../types/pageContext";
import {
  GameTileHiddenReason,
  GameTileHiddenTileMessage,
  GameTileUndoButton,
} from "./GameTileUtils";

export type TRemoveFromFavoritesHiddenTileContentProps = {
  translate: WithTranslationsProps["translate"];
  universeId: number;
  topicId?: string;
  page?: PageContext;
  onUndo?: () => void;
};

const RemoveFromFavoritesHiddenTileContent = ({
  translate,
  universeId,
  topicId,
  page,
  onUndo,
}: TRemoveFromFavoritesHiddenTileContentProps): JSX.Element => (
  <div className="game-tile-hidden-placeholder-contents">
    <GameTileHiddenTileMessage
      message={translate(
        FeatureGameDetails.MessageRemovedFromFavorites,
        undefined,
        "Removed from Favorites",
      )}
    />
    <GameTileUndoButton
      translate={translate}
      onUndo={onUndo}
      universeId={universeId}
      topicId={topicId}
      page={page}
      hiddenReason={GameTileHiddenReason.RemovedFromFavorites}
    />
  </div>
);

export default RemoveFromFavoritesHiddenTileContent;
