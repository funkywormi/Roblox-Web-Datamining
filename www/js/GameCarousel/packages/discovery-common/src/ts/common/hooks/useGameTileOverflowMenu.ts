import { useCallback, useState } from "react";
import { sendEvent } from "@rbx/core-scripts/event-stream";
import eventStreamConstants, {
  EventStreamMetadata,
  GameTileOverflowMenuActionType,
  TGameTileOverflowMenuAction,
} from "../constants/eventStreamConstants";
import { GameTileOverflowMenuItems } from "../types/gameTileOverflowMenuItems";
import { PageContext } from "../types/pageContext";
import { getSessionInfoTypeFromPageContext } from "../utils/parsingUtils";
import { usePageSession } from "../utils/PageSessionContext";

type TUseGameTileOverflowMenuResult = {
  overflowMenuOpen: boolean;
  sendGameTileOverflowMenuAction: (
    actionType: GameTileOverflowMenuActionType,
    availableMenuItems: GameTileOverflowMenuItems[],
    menuItem?: GameTileOverflowMenuItems,
  ) => void;
  closeOverflowMenu: (availableMenuItems: GameTileOverflowMenuItems[]) => void;
  toggleOverflowMenu: (availableMenuItems: GameTileOverflowMenuItems[]) => void;
};

const useGameTileOverflowMenu = (
  universeId: number,
  topicId?: string,
  page?: PageContext,
): TUseGameTileOverflowMenuResult => {
  const pageSession = usePageSession();

  const sendGameTileOverflowMenuAction = useCallback(
    (
      actionType: GameTileOverflowMenuActionType,
      availableMenuItems: GameTileOverflowMenuItems[],
      menuItem?: GameTileOverflowMenuItems,
    ) => {
      const sessionInfoType = getSessionInfoTypeFromPageContext(page);

      const params: TGameTileOverflowMenuAction = {
        [EventStreamMetadata.UniverseId]: universeId.toString(),
        [EventStreamMetadata.SortId]: topicId,
        [EventStreamMetadata.ActionType]: actionType,
        [EventStreamMetadata.MenuItem]: menuItem,
        [EventStreamMetadata.AvailableMenuItems]: availableMenuItems,
        ...(sessionInfoType && { [sessionInfoType]: pageSession }),
      };

      const eventParams = eventStreamConstants.gameTileOverflowMenuAction(params, page);
      sendEvent(...eventParams);
    },
    [universeId, topicId, page, pageSession],
  );

  const [overflowMenuOpen, setOverflowMenuOpen] = useState(false);

  const closeOverflowMenu = useCallback(
    (availableMenuItems: GameTileOverflowMenuItems[]) => {
      setOverflowMenuOpen(false);
      sendGameTileOverflowMenuAction(
        GameTileOverflowMenuActionType.GameTileOverflowMenuItemClosed,
        availableMenuItems,
      );
    },
    [sendGameTileOverflowMenuAction],
  );

  const toggleOverflowMenu = useCallback(
    (availableMenuItems: GameTileOverflowMenuItems[]) => {
      setOverflowMenuOpen(prevOpen => {
        sendGameTileOverflowMenuAction(
          prevOpen
            ? GameTileOverflowMenuActionType.GameTileOverflowMenuItemClosed
            : GameTileOverflowMenuActionType.GameTileOverflowMenuItemOpened,
          availableMenuItems,
        );
        return !prevOpen;
      });
    },
    [sendGameTileOverflowMenuAction],
  );

  return {
    overflowMenuOpen,
    sendGameTileOverflowMenuAction,
    closeOverflowMenu,
    toggleOverflowMenu,
  };
};

export default useGameTileOverflowMenu;
