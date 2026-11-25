import { ActionType, type SduiRegistryModule } from "@rbx/sdui-core";
import {
  openSearchResultsTabResolveHref,
  openSearchResultsTabHandler,
} from "../actions/openSearchResultsTabHandler";
import { GAME_SEARCH_CLIENT_COMPONENTS } from "./gameSearchComponents";

export const GameSearchSduiModule = {
  name: "game-search",
  components: GAME_SEARCH_CLIENT_COMPONENTS,
  actionHandlers: {
    [ActionType.OPEN_SEARCH_RESULTS_TAB]: {
      resolveHref: openSearchResultsTabResolveHref,
      clientNavigation: true,
      handler: openSearchResultsTabHandler,
    },
  },
} satisfies SduiRegistryModule;

export default GameSearchSduiModule;
