import { SduiClientModule } from "@rbx/sdui-client";
import { SduiCommonModule } from "@rbx/sdui-common";
import type { SduiRegistryModule } from "@rbx/sdui-core";
import { DISCOVERY_ACTION_HANDLERS } from "./actions/discoveryActionHandlers";
import { gamesFilterClickTelemetryHandler } from "./actions/gamesFilterClickHandler";
import { DISCOVERY_V2_COMPONENTS } from "./components/discoverySduiComponents";
import {
  DISCOVERY_GAME_ITEM_IMPRESSION_HANDLERS,
  DISCOVERY_IMPRESSION_HANDLERS,
} from "./impressions/discoveryImpressionHandlers";

/** Names templates put in `Action.telemetry_handler`. They are template contract, not event names. */
export enum DiscoveryTelemetryHandlerName {
  GamesFilterClick = "gamesFilterClick",
  GameTileOverflowMenu = "GameTileOverflowMenu",
}

export const DiscoverySduiModule = {
  name: "discovery-common",
  components: DISCOVERY_V2_COMPONENTS,
  actionHandlers: DISCOVERY_ACTION_HANDLERS,
  impressionHandlers: DISCOVERY_IMPRESSION_HANDLERS,
  telemetryHandlers: {
    [DiscoveryTelemetryHandlerName.GamesFilterClick]: gamesFilterClickTelemetryHandler,
  },
} satisfies SduiRegistryModule;

/**
 * Compose ahead of `DiscoverySduiModule` to also send the generic `itemImpressions` with
 * `gameImpressions`.
 */
export const DiscoveryGameItemImpressionsSduiModule = {
  name: "discovery-common/game-item-impressions",
  impressionHandlers: DISCOVERY_GAME_ITEM_IMPRESSION_HANDLERS,
} satisfies SduiRegistryModule;

/** Modules for discovery surfaces, in precedence order. */
export const DISCOVERY_SDUI_MODULES = [DiscoverySduiModule, SduiClientModule, SduiCommonModule];
