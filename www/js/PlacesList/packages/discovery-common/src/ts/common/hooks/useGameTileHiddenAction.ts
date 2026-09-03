import { useCallback } from "react";
import { sendEvent } from "@rbx/core-scripts/event-stream";
import eventStreamConstants, {
  EventStreamMetadata,
  GameTileHiddenActionType,
  TGameTileHiddenAction,
} from "../constants/eventStreamConstants";
import { GameTileHiddenReason } from "../types/gameTileHiddenReason";
import { PageContext } from "../types/pageContext";
import { getSessionInfoTypeFromPageContext } from "../utils/parsingUtils";
import { usePageSession } from "../utils/PageSessionContext";

type TSendGameTileHiddenAction = (
  actionType: GameTileHiddenActionType,
  hiddenReason?: GameTileHiddenReason,
) => void;

const useGameTileHiddenAction = (
  universeId: number,
  topicId?: string,
  page?: PageContext,
): TSendGameTileHiddenAction => {
  const pageSession = usePageSession();

  return useCallback(
    (actionType, hiddenReason) => {
      const sessionInfoType = getSessionInfoTypeFromPageContext(page);

      const params: TGameTileHiddenAction = {
        [EventStreamMetadata.UniverseId]: universeId.toString(),
        [EventStreamMetadata.SortId]: topicId,
        [EventStreamMetadata.ActionType]: actionType,
        [EventStreamMetadata.HiddenReason]: hiddenReason,
        ...(sessionInfoType && { [sessionInfoType]: pageSession }),
      };

      const eventParams = eventStreamConstants.gameTileHiddenAction(params, page);
      sendEvent(...eventParams);
    },
    [universeId, topicId, page, pageSession],
  );
};

export default useGameTileHiddenAction;
