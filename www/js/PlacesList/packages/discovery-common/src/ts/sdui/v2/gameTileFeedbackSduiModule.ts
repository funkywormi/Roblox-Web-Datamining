import { SduiClientModule } from "@rbx/sdui-client";
import { ActionType, clientOnly, UiComponentType, type SduiRegistryModule } from "@rbx/sdui-core";
import {
  gameTileOverflowMenuTelemetryHandler,
  openGameNotInterestedFeedbackHandler,
  openWhyThisAdHandler,
  setGameTileNotInterestedHandler,
  undoGameTileNotInterestedHandler,
} from "./actions/gameTileFeedbackHandlers";
import { SduiFeedbackGameTile } from "./components/gameTileFeedback/SduiFeedbackGameTile";
import { SduiGameTileHiddenState } from "./components/gameTileFeedback/SduiGameTileHiddenState";
import { DiscoveryTelemetryHandlerName } from "./discoverySduiModule";

const defaultGameTile = SduiClientModule.components[UiComponentType.GAME_TILE];

/**
 * Game tile feedback: the overflow menu's actions and telemetry, the "Not
 * interested" hidden state, and the forms, modals, and toasts they open.
 * Compose it ahead of `DISCOVERY_SDUI_MODULES` on pages whose tile templates
 * send an overflow menu.
 */
export const GameTileFeedbackSduiModule = {
  name: "discovery-common/game-tile-feedback",
  components: {
    [UiComponentType.GAME_TILE]: { ...defaultGameTile, component: SduiFeedbackGameTile },
    [UiComponentType.GAME_TILE_HIDDEN_STATE]: { component: SduiGameTileHiddenState },
  },
  // Game tile menu actions send their own event-stream events instead of itemAction.
  actionHandlers: {
    [ActionType.SET_GAME_TILE_NOT_INTERESTED]: {
      handler: clientOnly(setGameTileNotInterestedHandler),
      skipUnifiedLogging: true,
    },
    [ActionType.UNDO_GAME_TILE_NOT_INTERESTED]: {
      handler: clientOnly(undoGameTileNotInterestedHandler),
      skipUnifiedLogging: true,
    },
    [ActionType.OPEN_GAME_NOT_INTERESTED_FEEDBACK]: {
      handler: clientOnly(openGameNotInterestedFeedbackHandler),
      skipUnifiedLogging: true,
    },
    [ActionType.OPEN_WHY_THIS_AD]: {
      handler: clientOnly(openWhyThisAdHandler),
      skipUnifiedLogging: true,
    },
  },
  telemetryHandlers: {
    [DiscoveryTelemetryHandlerName.GameTileOverflowMenu]: gameTileOverflowMenuTelemetryHandler,
  },
} satisfies SduiRegistryModule;
